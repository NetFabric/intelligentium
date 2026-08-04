# Contributing to Intelligentium

Intelligentium is an [APM](https://microsoft.github.io/apm/) marketplace: a collection of `plugins/<name>/` packages, each bundling one or more Copilot skills, published for install via `apm install <plugin>@intelligentium`.

## Prerequisites

- [APM CLI](https://microsoft.github.io/apm/) (`apm`)
- Node.js 20+ and `npm install` (only needed for the ARD catalog generator script)

## Repository Layout

```
apm.yml                  # root manifest; marketplace.packages lists every plugin
plugins/<name>/
  apm.yml                # plugin manifest (name, version, tags, targets, deps)
  .apm/skills/<skill>/
    SKILL.md              # skill frontmatter (name, description) + body
    references/*.md       # optional deep-dive reference files
```

Master copies of skills live in `.agents/skills/` at the repo root (used by this workspace's own Copilot). Plugins contain copies of a themed subset of those skills for publishing — keep both in sync when editing a skill that's shared.

## Adding a Skill to an Existing Plugin

1. Add `plugins/<plugin>/.apm/skills/<skill-name>/SKILL.md` with `name`/`description` frontmatter and the skill body. Add any `references/*.md` files it links to.
2. If the skill also exists as a master copy, mirror the change in `.agents/skills/<skill-name>/`.
3. Regenerate build artifacts (see [Verifying Changes](#verifying-changes)).

## Adding a New Plugin Package

1. Scaffold it: `apm plugin init <name>`. This creates a **nested** `<name>/<name>/` — flatten it: `mv "<name>/<name>"/* "<name>/"` (or run `apm plugin init` from inside `plugins/` and flatten there).
2. Delete any generated `plugin.json` — `apm pack` synthesizes it from `apm.yml`, don't hand-author it.
3. Fill in `plugins/<name>/apm.yml` (`description`, `keywords`, `targets`) and add the skill(s) under `.apm/skills/`.
4. Register the package in the root [apm.yml](apm.yml)'s `marketplace.packages` list (`name`, `description`, `source: ./plugins/<name>`, `version`, `tags`).
5. Add a row for it in the [README.md](README.md) plugin table.
6. Regenerate build artifacts (see [Verifying Changes](#verifying-changes)).

## Verifying Changes

Run before opening a PR:

```bash
apm pack                  # rebuilds .claude-plugin/marketplace.json from apm.yml
npm run generate:ard      # rebuilds .well-known/ai-catalog.json from apm.yml
```

`apm compile` only processes instructions/prompts/agents, not skills — for skill-only plugins it reports "No instruction files found," which is expected, not an error.

Commit the regenerated `.claude-plugin/marketplace.json` and `.well-known/ai-catalog.json` — both are consumed directly from the repo (by `apm marketplace add` and ARD crawlers respectively), not built at install time.

## Pull Requests

- Keep the title a short, imperative summary (e.g. "Add math-foundations plugin").
- One logical change per PR (a new plugin, a skill fix, a tooling change).
- Re-run the commands in [Verifying Changes](#verifying-changes) and commit any resulting diffs.
