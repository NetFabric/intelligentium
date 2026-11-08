# APM Consumer — Manifest & Lockfile

## `apm.yml` Top-Level Fields

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Package identifier; free-form string |
| `version` | Yes | SemVer string (quote numeric values in YAML) |
| `description` | No | Shown on marketplace listings |
| `author` | No | String or `{name, email?, url?}` |
| `license` | No | SPDX identifier (e.g. `MIT`, `Apache-2.0`) |
| `targets` / `target` | No | List of harness slugs; omit for auto-detect |
| `type` | No | `instructions`, `skill`, `hybrid`, or `prompts` |
| `includes` | No | `auto` (default for `apm init`) or explicit path list |
| `dependencies` | No | `apm:`, `mcp:`, `lsp:` lists |
| `devDependencies` | No | Same shape; excluded from `apm pack` output |
| `scripts` | No | Named shell commands; run via `apm run <name>` |
| `compilation` | No | Controls `apm compile` behavior |
| `policy` | No | Consumer-side policy fetch settings |
| `registries` | No | Named REST-based APM registry entries |
| `marketplace` | No | Producer-only; see `apm-producer` skill |

### `includes`

| Value | Meaning |
|-------|---------|
| _(omitted)_ | Legacy implicit consent; `apm audit` emits advisory |
| `auto` | Explicit consent for all local content (new project default) |
| `[<path>, ...]` | Explicit allow-list; `apm pack` includes only these paths |

## Dependency String Form

```yaml
dependencies:
  apm:
    - owner/repo                    # latest (lockfile pins SHA)
    - owner/repo#v1.0.0             # pinned tag (immutable)
    - owner/repo#main               # branch ref
    - gitlab.com/acme/repo#main     # non-GitHub host
    - owner/repo/skills/my-skill    # subdirectory (virtual package)
    - owner/repo/review.prompt.md   # single file
    - ./packages/local              # local path (dev only)
```

## Dependency Object Form

Use when the string form is ambiguous, or when you need extra options:

```yaml
dependencies:
  apm:
    - git: owner/repo
      ref: v2.0                     # branch, tag, or SHA
      path: instructions/security   # subdirectory within the repo
      alias: acme-sec               # local alias for this dep
      targets: [copilot, claude]    # restrict which harnesses receive this dep

    - git: https://gitlab.com/org/repo.git
      ref: "^1.2.0"                 # semver range resolved against git tags
      alias: gl-standards

    - path: ./packages/my-shared    # local path (dev only)

    - name: sec-check               # marketplace dep
      marketplace: acme-plugins
      version: "~2.1.0"

    - id: acme/toolkit              # registry dep (requires registries: block)
      version: "^2.0.0"
```

## `devDependencies`

Same structure as `dependencies`. Installed by `apm install` (no flag needed) but excluded from bundles produced by `apm pack`. Use for test fixtures, internal tooling, release checklists.

```yaml
devDependencies:
  apm:
    - owner/test-helpers
    - path: ./dev/skills/release-checklist
```

Add via: `apm install --dev owner/test-helpers`

## Compilation Block (Consumer-Relevant)

```yaml
compilation:
  strategy: distributed       # distributed (default) or single-file
  exclude:
    - "apm_modules/**"
    - "tmp/**"
  source_attribution: false   # true adds source comments to compiled output
```

`distributed` writes per-directory `AGENTS.md` / `CLAUDE.md` next to each instruction's `applyTo` glob. `single-file` writes one root file.

## Policy Block (Consumer-Side)

```yaml
policy:
  fetch_failure_default: warn   # warn (default) or block
  hash: "sha256:<hex>"          # optional pin on org policy bytes
  hash_algorithm: sha256        # sha256 (default), sha384, sha512
```

`block` opts into fail-closed installs when no enforceable org policy is reachable.

## Registries Block

```yaml
registries:
  jf-skills:
    url: https://artifactory.example.com/artifactory/api/skills/jf-skills-local
  default: jf-skills
```

Requires `apm experimental enable registries`. Once a default registry is set, plain `owner/repo` shorthand routes through it.

## Lockfile (`apm.lock.yaml`) Anatomy

```yaml
lockfile_version: '1'
generated_at: '2026-04-21T21:45:34Z'
apm_version: 0.22.0

dependencies:
  - repo_url: https://github.com/owner/repo
    resolved_commit: a1b2c3d4...     # exact SHA installed
    resolved_ref: v1.0.0
    version: 1.0.0
    depth: 1                          # 1 = direct, 2+ = transitive
    content_hash: sha256:9f...        # hash of the full package tree
    deployed_files:
      - .github/skills/my-skill/SKILL.md
    deployed_file_hashes:
      .github/skills/my-skill/SKILL.md: sha256:c4...

mcp_servers:
  - io.github.github/github-mcp-server

local_deployed_files:
  - .github/instructions/my-rule.instructions.md
local_deployed_file_hashes:
  .github/instructions/my-rule.instructions.md: sha256:45...
```

- Never edit the lockfile by hand; run `apm install` or `apm update` to regenerate.
- `apm audit` rehashes every entry and reports mismatches.
- `depth: 1` = direct dependency; `depth: 2+` = transitive.
