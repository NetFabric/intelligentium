# APM Actions — Modes

## Default Install

```yaml
- uses: microsoft/apm-action@v1
```

Installs CLI, reads `apm.yml`, runs `apm install`.

### With Options

```yaml
- uses: microsoft/apm-action@v1
  with:
    compile: 'true'                    # generate AGENTS.md after install
    apm-version: '0.7.0'               # pin a specific APM version
    working-directory: './my-project'  # custom working directory
```

## Isolated Mode

Ignore `apm.yml`; install only inline deps. No `apm.yml` needed.

```yaml
- uses: microsoft/apm-action@v1
  with:
    isolated: 'true'
    dependencies: |
      - microsoft/apm-sample-package
```

## Setup-only Mode

Install CLI + `PATH` only, like `actions/setup-node`. No `apm.yml` read, no install/deploy. Mutually exclusive with `pack`, `bundle`, `bundles-file`. Sets `apm-version`/`apm-path` outputs.

```yaml
- uses: microsoft/apm-action@v1
  id: apm
  with:
    setup-only: 'true'
    apm-version: '0.11.0'
- run: apm --version
- run: apm pack -o build --format plugin
```

## Update Mode

Runs `apm update --yes` instead of `apm install`: re-resolves every branch/tag ref to its latest matching commit, rewrites `apm.lock.yaml`, deploys refreshed assets. Requires `apm.yml` in the working directory. Composes with `audit-report`, `compile`, `script`, `dependencies`, `pack`. Mutually exclusive with `isolated`, `setup-only`, `bundle`, `bundles-file`, `mode`.

```yaml
name: Refresh AI agent assets
on:
  schedule:
    - cron: '0 6 * * 1'   # Monday 06:00 UTC
  workflow_dispatch:

jobs:
  apm-update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: microsoft/apm-action@v1
        with:
          update: 'true'
          audit-report: 'true'
      - uses: peter-evans/create-pull-request@v6
        with:
          title: 'chore: update AI agent assets'
          branch: apm/auto-update
```

Pack, restore, and release modes: [references/pack-and-restore.md](pack-and-restore.md).
