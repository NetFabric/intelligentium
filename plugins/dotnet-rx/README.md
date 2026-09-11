# dotnet-rx

Rx.NET and ReactiveUI skills for composable observable pipelines, concurrency, resource lifetimes, MVVM state, commands, bindings, and deterministic testing.

## Overview

Rx.NET (`System.Reactive`) models asynchronous and event-driven work as `IObservable<T>` sequences. It is useful when values, timing, completion, failures, cancellation, and subscription lifetime must be composed explicitly. The `dotnet-rx` skill covers observable creation, operators, hot and cold sources, multicasting, schedulers, disposal, error recovery, interop, and virtual-time tests.

ReactiveUI builds on reactive concepts for testable .NET MVVM applications. The `reactiveui` skill covers ReactiveUI 24+ package families, view-model state, derived properties, commands, activation, bindings, interactions, routing, platform setup, and application lifecycle.

Use Rx.NET for general observable pipelines. Use ReactiveUI when those pipelines belong to a ReactiveUI-based application and must integrate with its view models, commands, bindings, and UI lifetime.

## Skills

| Skill | Description |
| --- | --- |
| [dotnet-rx](.apm/skills/dotnet-rx) | Design, implement, debug, review, and test Rx.NET pipelines with System.Reactive |
| [reactiveui](.apm/skills/reactiveui) | Design, implement, migrate, debug, review, and test ReactiveUI 24+ applications |

## Install

```bash
apm install dotnet-rx@intelligentium
```

Part of the [Intelligentium](../../README.md) marketplace.