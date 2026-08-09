# APM Actions — Inputs & Outputs

## Inputs

| Input | Default | Description |
|-------|---------|--------------|
| `working-directory` | `.` | Working directory. Must exist in non-isolated mode (with your `apm.yml`). Auto-created in isolated, pack, or bundle modes |
| `apm-version` | `latest` | APM CLI version to install |
| `github-token` | `${{ github.token }}` | GitHub token for API calls. Auto-forwarded as `GITHUB_APM_PAT` |
| `script` | — | APM script to run after install |
| `dependencies` | — | YAML array of extra dependencies to install (additive to `apm.yml`) |
| `isolated` | `false` | Ignore `apm.yml` and clear pre-existing primitive dirs — install only inline dependencies |
| `compile` | `false` | Run `apm compile` after install to generate `AGENTS.md` |
| `update` | `false` | Run `apm update --yes` instead of `apm install`: re-resolve branch/tag refs, rewrite `apm.lock.yaml` |
| `pack` | `false` | Pack a bundle after install (produces `.tar.gz` by default) |
| `bundle-format` | `apm` | Bundle layout when `pack: true`: `apm` (restorable) or `plugin` (Claude Code marketplace bundle) |
| `setup-only` | `false` | Install the APM CLI and exit — no `apm.yml` read, no install, no deploy |
| `bundle` | — | Restore from a bundle (local path or glob) via `apm unpack` |
| `bundles-file` | — | Path to a UTF-8 file, one bundle path per line; merges N bundles in order (last wins on collisions) |
| `target` | — | Bundle target: `copilot`, `vscode`, `claude`, or `all` (used with `pack: true`) |
| `archive` | `true` | Produce `.tar.gz` instead of a directory (used with `pack: true`) |
| `marketplace` | — | Forwarded to `apm pack --marketplace=<value>`: comma list, `all`, or `none` |
| `marketplace-path` | — | Forwarded to `apm pack --marketplace-path FORMAT=PATH`; one override per line |
| `json-output` | — | Forwarded to `apm pack --json`; captures the report to this path |
| `offline` | `false` | Forwarded to `apm pack --offline`; skip network resolution, use `apm.lock.yaml` pins |
| `include-prerelease` | `false` | Forwarded to `apm pack --include-prerelease`; considers pre-release tags |
| `audit-report` | — | Generate a SARIF audit report (hidden Unicode scanning). `true` for default path, or a custom path |
| `mode` | — | Set to `release` for the one-step tag-publish pipeline |

## Mutual Exclusivity

| When Set | Exclusive With |
|----------|-----------------|
| `update` | `isolated`, `setup-only`, `bundle`, `bundles-file`, `mode` |
| `setup-only` | `pack`, `bundle`, `bundles-file` |
| `bundles-file` | `pack`, `bundle` |

The action errors fast if more than one mutually-exclusive input is set.

## Outputs

| Output | Set When | Meaning |
|--------|----------|---------|
| `success` | always | Whether the action succeeded (`true`/`false`) |
| `apm-version` | always | Resolved APM CLI version, e.g. `0.11.0` |
| `apm-path` | always | Absolute path to the resolved `apm` binary (tool-cache, or `which apm` if reusing an existing CLI) |
| `bundle-format` | pack and single-bundle restore | `apm` or `plugin` |
| `primitives-path` | install modes | Path where agent primitives were deployed (`.github`) |
| `bundle-path` | pack mode | Path to the packed bundle; empty for marketplace-only projects — use `pack-json` instead |
| `pack-json` | when `json-output` set | Path to the captured `apm pack --json` report; source of truth for every emitted artifact |
| `audit-report-path` | when `audit-report` set | Path to the generated SARIF audit report |
| `bundles-restored` | multi-bundle restore | Count of bundles successfully merged |
| `packages`, `marketplace-drift`, `release-url`, `release-tag` | release mode | Release pipeline results |
