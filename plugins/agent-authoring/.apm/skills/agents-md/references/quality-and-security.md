# Quality & Security

## Writing Rules

`AGENTS.md` is re-read into context on every task, same as a skill — apply the same compact writing style: dense, table-driven, zero preamble, no loss of accuracy.

| Rule | Do | Don't |
|------|----|-------|
| Executable over descriptive | "Run `pnpm test`" | "Make sure tests pass" |
| Tables > prose | Bullet/table a list of commands or conventions | Multi-sentence paragraphs for scannable facts |
| No preamble | Start with the first section heading | "This file describes how to work in this repo..." |
| Active voice, short sentences | "Run `X` before committing" | "`X` should be run by contributors before changes are committed" |
| Link, don't duplicate | Link to README/CONTRIBUTING for human-facing content | Copy full README prose into `AGENTS.md` |
| Concrete over aspirational | Document what the repo's tooling actually does today | Describe a style guide nobody enforces |
| Concise over exhaustive | Short, scannable sections | A wall of prose an agent must re-parse every run |
| Nest instead of bloat | Per-package `AGENTS.md` for monorepos | One giant root file covering every package |

Compactness never trims a command, a flag, or a caveat that changes behavior — cut words, not facts.

## Verification Is Mandatory

Agents will execute testing/build/lint commands found in `AGENTS.md` automatically and attempt to fix failures before finishing a task. Every listed command must:

- Actually succeed on a clean checkout — never transcribe a command from stale docs without running it.
- Be safe to run unattended and non-interactively (no prompts requiring manual input).
- Be idempotent or clearly scoped (a "reset DB" command listed casually will get run by an agent).

## Security Considerations to Cover

Include a Security section whenever any of these apply (most repos):

- **No secrets in the file** — `AGENTS.md` is typically committed and world-readable; never place API keys, tokens, or credentials in it, even as examples.
- **Flag destructive commands** — migrations, force-push, prod deploys, data-deleting scripts — require explicit confirmation before an agent runs them; state that explicitly rather than assuming caution.
- **Note sandbox/network limits** — if agents in this environment run without network access or in a restricted sandbox, say so, so agents don't waste turns retrying blocked calls.
- **Protected paths** — call out generated code, vendored dependencies, or lockfiles that must never be hand-edited by an agent.

## Maintenance

- Update `AGENTS.md` in the **same PR** that changes build, test, or lint tooling — treat a stale instruction as a bug, not a documentation nit.
- Periodically prune commands/sections referencing tools or scripts that no longer exist.
- Re-validate nested files after restructuring a monorepo (package moved, renamed, or merged).

## Anti-Patterns

- ❌ Copying the entire README/CONTRIBUTING.md verbatim instead of linking to it
- ❌ Committing secrets, tokens, or connection strings "for convenience"
- ❌ Listing commands that don't currently pass
- ❌ One monolithic root file for a large monorepo instead of nested per-package files
- ❌ Baking language- or framework-specific advice into a supposedly project-agnostic template
- ❌ Leaving placeholder/`TODO` text in a committed `AGENTS.md`
- ❌ Symlinking `CLAUDE.md` to `AGENTS.md` instead of using the `@AGENTS.md` import directive
- ❌ Copying `AGENTS.md` content into `CLAUDE.md` instead of importing it, creating two documents to keep in sync
