# APM Producer — Pack & Publish

## `apm pack`

```shell
apm pack [--output <dir>] [--target <slug>] [--offline]
```

Produces a `.zip` bundle from compiled output. If `marketplace:` block is present in `apm.yml`, also emits `marketplace.json` (default: `.claude-plugin/marketplace.json`).

| Flag | Effect |
|------|--------|
| `--output <dir>` | Destination directory for the bundle |
| `--target <slug>` | Pack only for one target |
| `--offline` | Skip fetching package metadata from remote; use cached only |

What `apm pack` includes:
- All compiled output from `apm compile`
- Files listed in `includes:` (or all local content if `includes: auto`)
- Dependencies from `dependencies` (not `devDependencies`)

What it excludes:
- `apm_modules/`
- `devDependencies`
- Files outside the `includes:` path list (when form 3 is used)

## `apm unpack`

```shell
apm unpack <bundle.zip> [--output <dir>]
```

Extracts a bundle into a directory. Use to inspect what `apm pack` produced before publishing.

## `apm publish`

```shell
apm publish [--marketplace <name>] [--tag <version>]
```

Publishes the packed bundle to the configured marketplace. Requires `marketplace:` block in `apm.yml` and appropriate credentials.

## Marketplace Block in `apm.yml`

Add with `apm marketplace init`. Full block:

```yaml
marketplace:
  # name, description, version inherit from top-level unless overridden
  owner:
    name: contoso
    url: https://github.com/contoso
    email: maintainers@contoso.example

  output: .claude-plugin/marketplace.json   # default

  # Optional: relative package sources compose onto this base
  sourceBase: https://gitlab.corp.example.com/platform/agent-marketplace

  metadata:
    homepage: https://contoso.example/marketplace

  build:
    tagPattern: "v{version}"    # must contain exactly one {version}

  packages:
    - name: code-review
      source: contoso/code-review           # owner/repo on default host
      version: "^1.0.0"                     # semver range
      description: AI code-review skills
      tags: [review, quality]

    - name: pinned-helper
      source: contoso/pinned-helper
      ref: main                             # explicit ref overrides version

    - name: local-tool
      source: ./packages/local-tool         # local-path package

    - name: enterprise-agents
      source: ghe.corp.example.com/platform/agents   # non-default host
      version: "^0.3.0"

    - name: gitlab-helper
      source: https://gitlab.corp.example.com/team/helper.git
      ref: v1.2.0
```

### `marketplace.packages` Fields

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Package identifier in the marketplace |
| `source` | Yes | `owner/repo`, `host/owner/repo`, HTTPS URL, or `./local` |
| `version` | Conditional | Semver range; required for remote unless `ref` is set |
| `ref` | Conditional | Explicit git ref; overrides `version` when both present |
| `tag_pattern` | No | Per-package override of `build.tagPattern` |
| `description` | No | Falls back to package's own `apm.yml` description |
| `tags` | No | Max 50 tags, 100 chars each |
| `category` | Conditional | Required when `outputs` includes `codex` |
| `include_prerelease` | No | Default `false`; include pre-release tags in range resolution |

## `apm marketplace` Commands

| Command | What It Does |
|---------|-------------|
| `apm marketplace init` | Add `marketplace:` block to `apm.yml`; scaffold `.claude-plugin/` |
| `apm marketplace add <pkg>` | Add a package entry to `marketplace.packages` |
| `apm marketplace update [<pkg>]` | Refresh resolved refs for all or one package |
| `apm marketplace build` | Re-generate `marketplace.json` from current `apm.yml` |

## Lifecycle Scripts (`apm lifecycle`)

Lifecycle hooks run shell commands at install/update/uninstall time on the consumer's machine.

```shell
apm lifecycle add pre-install "./scripts/check-prereqs.sh"
apm lifecycle add post-install "./scripts/setup-env.sh"
```

Available events: `pre-install`, `post-install`, `pre-update`, `post-update`, `pre-uninstall`, `post-uninstall`.

Consumers must explicitly approve lifecycle scripts:
- Interactive: consent prompt during `apm install`
- Governed: `apm-policy.yml` can block lifecycle execution org-wide

## `plugin.json` (Legacy / Auto-Generated)

`apm pack` generates `plugin.json` automatically from `apm.yml` + compiled output. Do not hand-author for new packages. If you have an existing `plugin.json`-based package, migrate to `.apm/` layout and let APM generate it.

Key `plugin.json` fields (set via `apm.yml`):

| `apm.yml` Field | → `plugin.json` Field |
|-----------------|----------------------|
| `name` | `name` |
| `version` | `version` |
| `description` | `description` |
| `homepage` | `homepage` |
| `repository` | `repository` |
| `keywords` | `keywords` |
| `license` | `license` |

## Releasing from CI

```yaml
# .github/workflows/release.yml
on:
  push:
    tags: ["v*"]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: curl -sSL https://aka.ms/apm-unix | sh
      - run: apm compile
      - run: apm pack --output dist/
      - run: apm publish
        env:
          GITHUB_APM_PAT: ${{ secrets.GITHUB_APM_PAT }}
```

Drift check (add as a separate required PR check):
```yaml
      - run: apm install --frozen
      - run: apm audit --ci
```
