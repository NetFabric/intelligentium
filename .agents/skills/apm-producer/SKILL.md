---
name: apm-producer
description: Author and publish APM packages: create primitives, compile, pack, and distribute. Use when: apm plugin init; authoring under .apm/ (skills, prompts, agents, instructions, hooks, commands); SKILL.md authoring; .prompt.md; .agent.md; .instructions.md frontmatter; apm compile strategies (distributed vs single-file); apm preview; apm view; apm pack bundles; apm publish; apm marketplace init / add / update; plugin.json; marketplace block in apm.yml; apm lifecycle; package-relative links; versioning; releasing from CI; dev-only primitives; devDependencies. Covers: .apm/ layout, primitive-to-target compatibility matrix, compilation placement, bundle format, marketplace.json. DO NOT USE FOR: installing packages from others (use apm-consumer); org-wide policy enforcement (apm-policy.yml).
---

# APM Producer

An APM package is a directory with `apm.yml` + a `.apm/` source tree. `apm compile` transforms `.apm/` into per-harness output; `apm pack` bundles it for distribution.

## Producer Ladder

| Step | Command | What Happens |
|------|---------|-------------|
| 1. Scaffold | `apm plugin init` | Creates `apm.yml` and `.apm/` skeleton |
| 2. Compile | `apm compile` | Transforms `.apm/` → harness-native output (git-diffable) |
| 3. Preview | `apm preview` / `apm view` | Dry-run: confirm what consumers receive |
| 4. Pack | `apm pack` | Produces `.zip` bundle (+ `marketplace.json` if configured) |
| 5. Publish | `apm publish` | Pushes to marketplace; consumers install via `apm install` |

Steps 4–5 are optional for internal distribution; a git repo alone is enough.

## `.apm/` Source Layout

```
.apm/
├── instructions/       # Always-on rules scoped by file glob
├── skills/<name>/      # Multi-file capabilities (SKILL.md + assets)
├── prompts/            # Reusable prompt templates
├── agents/             # Specialized agent personas
├── context/            # Shared fragments referenced by other primitives
└── hooks/              # Lifecycle event handlers
```

## Primitive Types

| Primitive | File Pattern | Format | Key Frontmatter |
|-----------|-------------|--------|-----------------|
| Instructions | `.apm/instructions/*.instructions.md` | Markdown | `description` (required), `applyTo` (glob) |
| Prompts | `.apm/prompts/*.prompt.md` | Markdown | `description`, `mode`, `tools` |
| Agents | `.apm/agents/*.agent.md` | Markdown | `name`, `description`, `model`, `tools` |
| Skills | `.apm/skills/<name>/SKILL.md` | Markdown | `name` (kebab), `description` (≤1024 chars) |
| Hooks | `.apm/hooks/*.json` | JSON | `event`, `command` |

## Compatibility Matrix (Key Rows)

| Primitive | copilot | claude | cursor | codex | gemini | windsurf | kiro |
|-----------|---------|--------|--------|-------|--------|----------|------|
| instructions | native | native | native | compiled | compiled | native | native |
| prompts | native | compiled → `/cmd` | compiled | unsupported | compiled | compiled | compiled |
| agents | native | native | compiled | compiled | unsupported | native | unsupported |
| skills | native | native | native | native | native | native | native |
| hooks | native | native | native | native | native | unsupported | native |
| MCP servers | native | native | native | native | native | native | native |

`compiled` = APM transforms the file to the harness's own format. `unsupported` = not delivered.

## Key Commands

| Command | What It Does |
|---------|-------------|
| `apm plugin init` | Scaffold a new plugin package with `.apm/` skeleton |
| `apm compile [--target <slug>]` | Transform `.apm/` into harness output |
| `apm compile --clean` | Remove stale distributed output files |
| `apm preview [<pkg>]` | Dry-run install; shows what consumers receive |
| `apm view <pkg>` | Inspect a remote package before installing |
| `apm pack` | Produce `.zip` bundle (and `marketplace.json` if configured) |
| `apm publish` | Push to configured marketplace |
| `apm marketplace init` | Add `marketplace:` block to `apm.yml` |
| `apm marketplace add <pkg>` | Add a package entry to the marketplace block |
| `apm lifecycle` | Manage `pre/post install/update/uninstall` scripts |

## Reference Files

| File | Load When |
|------|-----------|
| [references/primitives.md](references/primitives.md) | Authoring instructions, prompts, agents, skills, hooks; frontmatter fields; file formats |
| [references/compile.md](references/compile.md) | Compilation strategies, placement, managed-section mode, `apm compile` flags |
| [references/pack-and-publish.md](references/pack-and-publish.md) | `apm pack`, `apm publish`, `marketplace:` block in `apm.yml`, `plugin.json`, CI release |
