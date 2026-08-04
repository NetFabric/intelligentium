---
name: apm-actions
description: Configure and use the microsoft/apm-action GitHub Action for CI/CD workflows. Use when: writing workflows that install/pack/restore APM agent primitives; install mode (apm install from apm.yml); isolated mode (inline dependencies, no apm.yml); setup-only mode; update mode (refresh branch/tag refs, apm update --yes); pack mode (.tar.gz bundles); bundle-format apm vs plugin; restore mode (bundle:, apm unpack); multi-bundle restore (bundles-file); release mode (tag-triggered publish pipeline); cross-job artifact workflows; apm-action inputs/outputs; audit-report SARIF security scanning; private repo / cross-org authentication (GITHUB_APM_PAT); marketplace artifact publishing from CI; troubleshooting apm-action mutual-exclusivity errors. DO NOT USE FOR: local apm CLI usage as a consumer (use apm-consumer); authoring/publishing packages, apm.yml marketplace block, plugin.json (use apm-producer).
---

# APM Actions

`microsoft/apm-action` installs the APM CLI and deploys agent primitives (skills, prompts, agents, instructions) in CI. One line, zero config for the common case; several mutually-exclusive modes cover advanced pipelines.

## Modes

| Mode | Trigger Input | What Happens |
|------|---------------|--------------|
| Install (default) | none | Reads `apm.yml`, runs `apm install` |
| Isolated | `isolated: true` | Ignores `apm.yml`; installs only inline `dependencies:` |
| Setup-only | `setup-only: true` | Installs CLI onto `PATH`, exits — no install/deploy |
| Update | `update: true` | `apm update --yes`; refreshes branch/tag refs, rewrites lockfile |
| Pack | `pack: true` | `apm install` then `apm pack` → bundle (+ marketplace files) |
| Restore | `bundle: <path\|glob>` | `apm unpack` restores a single bundle |
| Multi-restore | `bundles-file: <path>` | Merges N bundles into one workspace, in file order |
| Release | `mode: release` | One-step tag-triggered gate → pack → sidecars → `gh release create` |

Full YAML per mode and combinability rules: [references/modes.md](references/modes.md) and [references/pack-and-restore.md](references/pack-and-restore.md).

## Common Inputs

| Input | Default | Purpose |
|-------|---------|---------|
| `working-directory` | `.` | Where `apm.yml` / bundles live |
| `apm-version` | `latest` | Pin CLI version |
| `github-token` | `${{ github.token }}` | Auto-forwarded as `GITHUB_APM_PAT`; same-org private repos need zero config |
| `compile` | `false` | Run `apm compile` after install (generates `AGENTS.md`) |
| `audit-report` | — | Generate SARIF hidden-Unicode scan report |
| `target` | — | Bundle target: `copilot`, `vscode`, `claude`, `all` (pack mode) |

Full inputs/outputs (30+ fields) and mutual-exclusivity table: [references/inputs-outputs.md](references/inputs-outputs.md).

## Minimal Usage

```yaml
- uses: microsoft/apm-action@v1
```

## Reference Files

| File | Load When |
|------|-----------|
| [references/modes.md](references/modes.md) | Full YAML for install, isolated, setup-only, update modes |
| [references/pack-and-restore.md](references/pack-and-restore.md) | Full YAML for pack, bundle-format, marketplace artifacts, restore, multi-bundle restore, cross-job artifact workflow, release mode |
| [references/inputs-outputs.md](references/inputs-outputs.md) | Complete inputs/outputs tables, mutual-exclusivity rules |
| [references/auth-and-security.md](references/auth-and-security.md) | `github-token`/`GITHUB_APM_PAT` forwarding, cross-org/multi-platform auth, `audit-report` SARIF + Code Scanning |
