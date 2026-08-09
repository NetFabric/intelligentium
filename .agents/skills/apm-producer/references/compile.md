# APM Producer — Compile

## `apm compile`

```shell
apm compile [--target <slug>] [--single-agents] [--clean] [--dry-run]
```

Transforms `.apm/` source into per-harness output files. Output is deterministic and git-diffable. Run after any change to `.apm/`.

| Flag | Effect |
|------|--------|
| `--target <slug>` | Compile for one target only |
| `--single-agents` | One root `AGENTS.md` instead of distributed files |
| `--clean` | Delete distributed output files no longer produced |
| `--dry-run` | Print what would be written without writing |

## Strategies

| Strategy | Behavior | When to Use |
|----------|----------|-------------|
| `distributed` (default) | Per-directory `AGENTS.md`/`CLAUDE.md` placed next to each instruction's `applyTo` scope | Minimal context principle; each agent loads only relevant rules |
| `single-file` | One root `AGENTS.md` at the repo root | Simple repos; when harness doesn't support per-dir files |

Set in `apm.yml`:
```yaml
compilation:
  strategy: distributed     # or single-file
```
Or override: `apm compile --single-agents`

## Output Files Per Target

| Target | Compiled Context File | Skills Dir |
|--------|----------------------|-----------|
| `copilot` | `AGENTS.md` (distributed or root) | `.github/agents/`, `.github/instructions/`, `.github/prompts/` |
| `claude` | `CLAUDE.md` | `.claude/rules/`, `.claude/commands/` |
| `cursor` | `AGENTS.md` | `.cursor/rules/*.mdc`, `.cursor/agents/` |
| `codex` | `AGENTS.md` | `.codex/agents/`, `.agents/skills/` |
| `gemini` | `GEMINI.md` | `.gemini/commands/*.toml` |
| `opencode` | `AGENTS.md` | `.opencode/agents/` |
| `windsurf` | `AGENTS.md` | `.windsurf/rules/`, `.windsurf/workflows/` |
| `kiro` | `AGENTS.md` | `.kiro/steering/`, `.kiro/skills/` |

## Instruction Placement (Distributed Mode)

Each instruction's `applyTo:` glob determines which directory gets the compiled file:

```
applyTo: "src/**"     → src/AGENTS.md
applyTo: "scripts/**" → scripts/AGENTS.md
(no applyTo)          → root AGENTS.md
```

Tune placement:
```yaml
compilation:
  placement:
    min_instructions_per_file: 1   # min count to warrant a separate file
```

## Managed-Section Mode

Preserves hand-written content in the root `AGENTS.md` across recompiles. APM only rewrites the block between the two markers.

```yaml
compilation:
  agents_md:
    mode: managed_section
    start_marker: "<!-- apm:start -->"
    end_marker:   "<!-- apm:end -->"
```

The markers must appear exactly once in the file before the first compile. Both `mode: full` (default, full overwrite) and `mode: managed_section` apply only to the root file; subdirectory files in distributed mode are always fully APM-owned.

## Exclude Patterns

```yaml
compilation:
  exclude:
    - "apm_modules/**"
    - "tmp/**"
    - "dev/**"
```

Glob patterns; relative to project root. `apm_modules/**` is recommended to always include.

## Pinning Targets for Reproducible Output

Without `targets:` in `apm.yml`, auto-detection picks targets based on which harness folders exist on the current machine. This makes committed output non-deterministic across teammates.

**Fix:** Pin targets explicitly:
```yaml
targets:
  - copilot
  - claude
```

Now every `apm compile` run (local or CI) produces the same set of output files regardless of which tools are installed.

## Source Attribution

```yaml
compilation:
  source_attribution: true
```

Adds HTML comments in compiled output pointing back to the source `.apm/` file. Useful for debugging which primitive contributed a specific instruction. Off by default.

## `apm preview`

```shell
apm preview [--target <slug>] [--output <dir>]
```

Performs a dry-run install into a temp directory and shows the resolved primitive tree. Use before `apm pack` to verify what consumers will see.

## `apm targets`

```shell
apm targets [--list]
```

Shows which targets are active for the current project (based on `apm.yml` + auto-detection).
