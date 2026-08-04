---
name: apm-consumer
description: Manage APM packages as a consumer: install, update, remove agent context (skills, prompts, agents, instructions, MCP/LSP servers). Use when: apm init; apm install packages; apm update / outdated; apm uninstall / prune; private or org packages; local bundles; authentication (GITHUB_APM_PAT); apm run scripts; apm audit; drift detection; governance ramp; apm doctor; troubleshooting install failures; managing apm.yml dependencies; lockfile (apm.lock.yaml) semantics; MCP server wiring; LSP server config. Covers: targets (copilot, claude, cursor, codex, gemini, windsurf, kiro), harness auto-detection, what to commit. DO NOT USE FOR: authoring or publishing packages (use apm-producer); writing apm-policy.yml.
---

# APM Consumer

APM manages AI agent context (skills, prompts, agents, instructions, MCP/LSP servers) with a manifest + lockfile model across all major harnesses. Mental model: `npm` for agentic context.

## Key CLI Commands

| Command | What It Does |
|---------|-------------|
| `apm init` | Scaffold `apm.yml`; auto-detects harness targets |
| `apm install <owner>/<repo>[#ref]` | Add dep; resolve transitive; deploy to harnesses |
| `apm install` | Restore all deps from `apm.lock.yaml` |
| `apm install --frozen` | Lockfile-only; fails on drift (CI use) |
| `apm uninstall <pkg>` | Remove dep and deployed files |
| `apm update [<pkg>]` | Re-resolve refs; rewrite lockfile |
| `apm outdated` | List stale dependencies |
| `apm prune` | Remove cached packages not in `apm.yml` |
| `apm run <name>` | Execute `scripts.<name>` from `apm.yml` |
| `apm audit [--ci]` | Rehash deployed files; `--ci` exits non-zero on drift |
| `apm list` | Show installed packages and versions |
| `apm doctor` | Diagnose environment and config issues |
| `apm self-update` | Upgrade the APM CLI binary |

## What to Commit

| Path | Commit? |
|------|---------|
| `apm.yml` | Yes — manifest |
| `apm.lock.yaml` | Yes — pins exact SHAs and content hashes |
| `.github/`, `.claude/`, `.cursor/`, `.agents/`, `.kiro/`, `.opencode/`, `.windsurf/`, `.gemini/` | Yes — deployed context; available on clone before `apm install` |
| `apm_modules/` | No — cache; auto-gitignored; rebuilt from lockfile |

## Targets

Auto-detected from harness folder presence. Override with `targets:` in `apm.yml` or `--target` flag. Fallback when nothing detected: `copilot`.

| Slug | Root Dir | Harness |
|------|----------|---------|
| `copilot` | `.github/` | GitHub Copilot (CLI + IDE) |
| `claude` | `.claude/` | Claude Code |
| `cursor` | `.cursor/` | Cursor IDE |
| `codex` | `.codex/` + `.agents/` | Codex CLI |
| `gemini` | `.gemini/` | Gemini CLI |
| `opencode` | `.opencode/` | OpenCode |
| `windsurf` | `.windsurf/` | Windsurf / Cascade |
| `kiro` | `.kiro/` | Kiro IDE |
| `agent-skills` | `.agents/skills/` | Harness-neutral skills only |

## Reference Files

| File | Load When |
|------|-----------|
| [references/commands.md](references/commands.md) | Full CLI flags, `--target`, authentication, private packages, CI drift check |
| [references/manifest-and-lockfile.md](references/manifest-and-lockfile.md) | `apm.yml` full schema, dependency string/object forms, `devDependencies`, `includes` |
| [references/mcp-lsp-servers.md](references/mcp-lsp-servers.md) | MCP registry vs self-defined servers; LSP object form; env var injection |
