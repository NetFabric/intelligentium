# APM Actions — Pack, Restore & Release

## Pack Mode

Installs deps, scans for hidden Unicode threats, packs into a self-contained `.tar.gz`. Works with isolated, inline deps, or `apm.yml`.

```yaml
- uses: microsoft/apm-action@v1
  id: pack
  with:
    pack: 'true'
    target: 'copilot'
    audit-report: true
- uses: github/codeql-action/upload-sarif@v3
  if: always() && steps.pack.outputs.audit-report-path
  with:
    sarif_file: ${{ steps.pack.outputs.audit-report-path }}
    category: apm-audit
- uses: actions/upload-artifact@v4
  with:
    name: agent-bundle
    path: ${{ steps.pack.outputs.bundle-path }}
```

### Bundle Format (`apm` vs `plugin`)

- `bundle-format: apm` (default) — bundle with `apm.lock.yaml` + `.github/` (or `.claude/`) tree; restorable by this action via `bundle:`/`bundles-file:`
- `bundle-format: plugin` — Claude Code plugin bundle (`plugin.json` at root, flat primitive dirs); not restorable by this action, use plugin tooling instead

```yaml
- uses: microsoft/apm-action@v1
  with:
    pack: 'true'
    bundle-format: 'plugin'
```

### Marketplace Artifacts (Publishing Flow)

When `apm.yml` declares `outputs:` (vendor-format marketplace files), forward pack-time controls:

```yaml
- uses: microsoft/apm-action@v1
  id: pack
  with:
    pack: 'true'
    archive: 'true'
    marketplace: 'claude,codex'      # formats to emit (default: all from outputs:)
    json-output: 'pack.json'         # capture --json report
    offline: 'true'                  # hermetic build using apm.lock.yaml
    include-prerelease: 'false'      # default; skip pre-release tags
```

`bundle-path` is empty for marketplace-only projects (no `dependencies:` block) — use `pack-json` to enumerate bundles + marketplace files + sidecars uniformly.

`marketplace-path` overrides where each format file is written (newline-separated `FORMAT=PATH`; `,` is a legal filename character so it can't be the separator):

```yaml
- uses: microsoft/apm-action@v1
  with:
    pack: 'true'
    marketplace-path: |
      claude=marketplace.json
      codex=plugins.toml
```

## Restore Mode

```yaml
- uses: actions/download-artifact@v4
  with:
    name: agent-bundle
- uses: microsoft/apm-action@v1
  with:
    bundle: './*.tar.gz'
```

Only files listed in the bundle's lockfile (`deployed_files`) are written to `working-directory`; the lockfile and `apm.yml` themselves are not, so the workspace stays clean for downstream steps like `git checkout`.

### Multi-bundle Restore

Merges N bundles into one workspace in caller-specified order (later bundles overwrite earlier ones on file collision). Mutually exclusive with `pack`, `bundle`.

```yaml
- uses: actions/download-artifact@v4
  with:
    pattern: apm-*
    path: /tmp/bundles
- run: find /tmp/bundles -name '*.tar.gz' | sort > /tmp/bundle-list.txt
- uses: microsoft/apm-action@v1
  id: restore
  with:
    bundles-file: /tmp/bundle-list.txt
    working-directory: /tmp/agent-workspace
- run: echo "Merged ${{ steps.restore.outputs.bundles-restored }} bundles into the workspace"
```

### Cross-job Artifact Workflow

Pack once, restore everywhere — identical primitives across all consumer jobs.

```yaml
jobs:
  agent-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: microsoft/apm-action@v1
        id: pack
        with:
          pack: 'true'
          target: 'copilot'
      - uses: actions/upload-artifact@v4
        with:
          name: agent-bundle
          path: ${{ steps.pack.outputs.bundle-path }}

  lint:
    needs: agent-config
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: agent-bundle
      - uses: microsoft/apm-action@v1
        with:
          bundle: './*.tar.gz'
      # .github/ is ready — primitives deployed
```

## Release Mode

One-step tag-triggered publish: gate on version/drift → matrix-pack → sha256 sidecars → `marketplace.json` drift check → Step Summary → `gh release create`. Vendor-neutral CLI primitives underneath (same steps work in GitLab CI, Jenkins, ADO — see `apm-producer` for non-Actions releasing).

```yaml
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: microsoft/apm-action@v1
        with:
          mode: release
          # release-tag defaults to GITHUB_REF_NAME
          # release-prerelease: auto  (detects -rc/-alpha/-beta/-pre suffix)
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Steps, in order:
1. `apm pack --check-versions --check-clean --json` — fails the job on misaligned per-package versions or uncommitted `marketplace.json` drift
2. Detect repo shape (`aggregator` if `plugins/<name>/apm.yml` files exist, else `single-plugin`)
3. Matrix-pack every package (`apm pack --offline --archive`) → tarballs in `dist/`
4. Write `<tarball>.sha256` sidecars
5. Stage `marketplace-<version>.json` for aggregator shapes
6. Render a GitHub Step Summary table of release contents
7. `gh release create <tag> <files...>` (skip with `release-skip-publish: true`)

Outputs: `packages` (JSON), `marketplace-drift`, `release-url`, `release-tag`.
