# APM Consumer — CLI Commands Reference

## `apm init`

```shell
apm init [<name>]
```

Writes `apm.yml` in the current directory (or `<name>/` subdirectory). Uses `includes: auto` and leaves `targets:` commented so APM auto-detects harnesses. Sets `dependencies.apm: []` and `dependencies.mcp: []`.

## `apm install`

```shell
apm install [<pkg>...] [--target <slug>] [--dev] [--frozen] [--update] [--global]
```

| Flag | Effect |
|------|--------|
| `<pkg>` | Add one or more packages to `apm.yml` and deploy |
| _(no pkg)_ | Restore from `apm.lock.yaml` |
| `--target <slug>` | Override target; required for greenfield repos with no harness dirs |
| `--dev` | Add to `devDependencies` instead of `dependencies` |
| `--frozen` | Fail if `apm.lock.yaml` is missing or out-of-date (CI use) |
| `--update` | Re-resolve even if lockfile is present |
| `--global` | Install to user scope (`~/.copilot/`, `~/.claude/`, etc.) |
| `--trust-transitive-mcp` | Allow MCP servers from transitive deps (skip block) |

Package specifiers:

| Form | Example |
|------|---------|
| GitHub shorthand | `owner/repo` |
| Pinned tag | `owner/repo#v1.0.0` |
| Branch | `owner/repo#main` |
| Non-GitHub host | `gitlab.com/acme/repo#main` |
| Full HTTPS URL | `https://github.com/owner/repo.git` |
| Subdirectory | `owner/repo/skills/my-skill` |
| Single file | `owner/repo/prompts/review.prompt.md` |
| Local path | `./packages/my-shared-skills` |

## `apm update`

```shell
apm update [<pkg>...] [--target <slug>]
```

Re-resolves each listed package (or all if none specified) from `apm.yml`, rewrites `apm.lock.yaml`, and redeploys. Shows a diff of what changed with a consent prompt.

## `apm uninstall`

```shell
apm uninstall <pkg> [--global]
```

Removes the package from `apm.yml` and deletes its deployed files. Uses the lockfile to find every file placed by that package.

## `apm prune`

Removes packages from `apm_modules/` that are no longer in `apm.yml`. Does not touch deployed files in harness dirs.

## `apm audit`

```shell
apm audit [--ci] [--fix]
```

Rehashes all entries in `deployed_file_hashes` and `local_deployed_file_hashes` from `apm.lock.yaml`. Any mismatch means a file was edited after install.

- `--ci` — exits non-zero on any drift; intended as a required CI check.
- Without `--fix`, drift is reported but not corrected. With `--fix`, reruns `apm install` to restore clean state.

## `apm run`

```shell
apm run [<name>] [-- <args>]
apm run <name> --param key=value
```

Runs the shell command at `scripts.<name>` in `apm.yml`. Bare `apm run` defaults to `scripts.start`. Supports `{key}` placeholder substitution via `--param`.

## `apm deps`

```shell
apm deps [--json] [--depth <n>]
```

Prints the full resolved dependency tree. Useful for tracing transitive MCP servers.

## `apm view`

```shell
apm view <pkg> [--target <slug>]
```

Shows what primitives a package would deploy without actually installing it.

## Authentication

| Env Var | Used For |
|---------|---------|
| `GITHUB_APM_PAT` | GitHub public/private packages |
| `GITHUB_TOKEN` | Alternate GitHub token |
| `GITLAB_APM_PAT` | Self-hosted GitLab |
| `BITBUCKET_APM_USER` + `BITBUCKET_APM_PAT` | Bitbucket |
| `ADO_APM_PAT` | Azure DevOps |
| `GITEA_APM_PAT` | Gitea |

Set via environment or `apm config set auth.<host>.token <value>`. Tokens are stored in `~/.apm/config.json`, never in `apm.yml`.

## Private & Org Packages

1. Set `GITHUB_APM_PAT` with `read:packages` scope (for GitHub Packages) or `repo` scope (for private repos).
2. Run `apm install owner/private-repo`.
3. For org-wide policy: `apm-policy.yml` at the org level restricts which sources are allowed — see enterprise docs.

## CI Pattern

```yaml
# .github/workflows/drift-check.yml
- run: apm install --frozen    # fails if lockfile is stale
- run: apm audit --ci          # fails if deployed files were hand-edited
```

Combine both checks: `--frozen` catches manifest/lockfile drift; `--ci` catches deployed-file tampering.

## `apm config`

```shell
apm config set <key> <value>
apm config get <key>
apm config list
```

Writes to `~/.apm/config.json`. Common keys:

| Key | Purpose |
|-----|---------|
| `auth.<host>.token` | Per-host auth token |
| `registry.<name>.url` | Registry base URL |
| `registry.<name>.default` | Make this registry the default |
| `install.target` | Default `--target` for all installs |
