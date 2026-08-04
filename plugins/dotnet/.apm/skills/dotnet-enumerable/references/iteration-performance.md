# foreach Codegen & Iteration Benchmarks

## foreach Lowering

`foreach` desugars to a `while` loop calling `GetEnumerator()`, `MoveNext()`, `Current`, wrapped in `try`/`finally` disposing the enumerator (generic `IEnumerator<T>` only — non-generic `IEnumerator` is disposed conditionally via an `as IDisposable` check):

```csharp
IEnumerator<int> enumerator = source.GetEnumerator();
try
{
    while (enumerator.MoveNext())
        Console.WriteLine(enumerator.Current);
}
finally { enumerator?.Dispose(); }
```

## Value-Type vs Reference-Type Enumerators

If `GetEnumerator()`'s static return type is `IEnumerable`/`IEnumerable<T>` (an interface), the enumerator is a **reference type** — `MoveNext()`/`Current` are `callvirt` (virtual dispatch), and if the concrete enumerator were a struct it gets boxed onto the heap.

If the collection exposes a `GetEnumerator()` that returns a concrete `struct` (e.g. `List<int>.Enumerator`), and the code doesn't box it to an interface, the JIT emits direct `call` instructions — no virtual dispatch, no heap allocation. All BCL collections do this; if you implement a new collection type, do it too.

Benchmark (`foreach` over `List<int>` cast to `IEnumerable<int>` vs used directly), 100 & 10,000 items, .NET 6/7/8:

| Path | Result |
|---|---|
| `IEnumerable<int>` (reference-type enumerator) | 300–700% slower on x64, ~450% slower on Arm64; heap allocation per enumeration |
| `List<int>` (value-type enumerator) | baseline; zero heap allocation |

**Rule**: avoid casting a concrete collection to an interface right before iterating it in a hot path. On public APIs, prefer concrete types or immutable collections that keep value-type enumerators when possible.

## Array Iteration

`for` and `foreach` both compile to a `while` loop, but `foreach` on an array copies the array **reference** into a local first. This lets the JIT prove the reference can't change mid-loop and **elide the bounds check**, producing tighter assembly. Net effect: `foreach` over an array is ~30% faster than the manual indexed `for` loop.

Slicing: convert to `ReadOnlySpan<T>` via `.AsSpan().Slice(start, length)` and `foreach` that — same benefit, ~20% faster than a manually indexed sub-range `for` loop.

## ArraySegment\<T\>

Unlike arrays/spans, the C# compiler does **not** special-case `ArraySegment<T>` — `foreach` allocates its (value-type) enumerator and uses it, rather than the indexer. Benchmarks (.NET 6/7/8):

| Approach | vs. indexed `for` on the segment |
|---|---|
| `foreach` on `ArraySegment<T>` | ~1.3x slower — enumerator's `Current` does two bounds checks vs the indexer's one |
| `for` + segment indexer | baseline |
| `for` on `.Array` using `.Offset`/`.Count` directly, or `.AsSpan()` + `foreach` | 1.6–2x **faster** — array reference is copied locally, enabling bounds-check elimination like a plain array |
| LINQ `Sum()` on the segment | ~10x slower (3–5x on .NET 8) — boxes the enumerator to a reference type on top of the double bounds check |
| `.Array!.Skip(offset).Take(count).Sum()` | 8–20x slower — stacks multiple enumerators |

**Rule**: given an `ArraySegment<T>`, prefer `.AsSpan()` (or manual `.Array`/`.Offset`/`.Count` indexing) over `foreach`ing the segment directly, and avoid LINQ on it.

## ImmutableArray\<T\>

`ImmutableArray<T>.Enumerator` is a value type, so a naive read of the IL suggests it should perform like `List<T>` (value-type enumerator, still two method calls per item). Surprising finding: **since JIT improvements around .NET 8, the generated machine code for `foreach` on `ImmutableArray<T>` is nearly identical to a plain array or `ReadOnlySpan<T>`** — not to `List<T>`. Confirmed via disassembly diagnoser across .NET 6 → .NET 8: `ImmutableArray<T>` iteration is as fast as array iteration, a pure JIT-level win requiring no code changes, only a runtime upgrade.

## Practical Ranking (fastest → slowest, typical int collections)

1. `for`/`foreach` on `int[]`, `ReadOnlySpan<int>`, or `ImmutableArray<int>` (.NET 8+) — all roughly equivalent
2. `foreach` on `List<int>` (value-type enumerator, two calls per item, no bounds-check elision)
3. `for` + indexer on `ArraySegment<int>`
4. `foreach` on `ArraySegment<int>` (enumerator, double bounds check)
5. Anything cast to `IEnumerable<int>` before iterating — reference-type enumerator, heap allocation, virtual calls

## Why This Doesn't Apply to `IAsyncEnumerable<T>`

An async iterator method already compiles to a heap-allocated state machine (needed to suspend/resume across `await` points), so there's no value-type-enumerator-vs-boxing trade-off to make: `await foreach` always dispatches through the `IAsyncEnumerator<T>` interface, and that one allocation is unavoidable regardless of how the sequence is produced. Optimize async streams by reducing *how much* is awaited and allocated per item (batch I/O, avoid `ConfigureAwait` capturing you don't need — see [async-enumeration.md](async-enumeration.md)), not by chasing struct enumerators.
