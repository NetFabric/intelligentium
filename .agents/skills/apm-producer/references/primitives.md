# APM Producer — Primitives

## Instructions

Always-on rules scoped to file globs; compiled into harness context files on every agent turn.

**Source:** `.apm/instructions/<name>.instructions.md`

```markdown
---
description: Apply TypeScript coding standards
applyTo: "**/*.ts"    # glob; omit for repo-wide
---
# TypeScript Standards
...
```

| Frontmatter Field | Required | Notes |
|-------------------|----------|-------|
| `description` | Yes | Shown in compiled output; helps the agent know when to apply |
| `applyTo` | No | Glob (e.g. `src/**`, `**/*.py`); omit → repo-wide |

Compilation:
- With `applyTo`: placed in the subdirectory whose path best matches the glob.
- Without `applyTo`: placed in the root compiled file.
- Target output: `.github/instructions/`, `.cursor/rules/*.mdc`, `.claude/rules/`, `.kiro/steering/`, etc.

## Prompts

Reusable, parameterized AI workflows. The same `.prompt.md` becomes a Copilot prompt and a Claude `/command`.

**Source:** `.apm/prompts/<name>.prompt.md`

```markdown
---
description: Review this code for security issues
mode: ask             # ask | agent | edit
tools:                # optional tool list
  - codebase
---
Review the following code for OWASP Top 10 vulnerabilities:

${selection}
```

| Frontmatter Field | Notes |
|-------------------|-------|
| `description` | Required; displayed as the command description |
| `mode` | `ask` (default), `agent`, or `edit` |
| `tools` | Whitelist of tools the prompt may use |

Per-harness output:
- **Copilot**: stays as `.prompt.md` in `.github/prompts/`
- **Claude**: compiled to `.claude/commands/<name>.md` (becomes a `/command`)
- **Cursor**: compiled to `.cursor/agents/<name>.mdc`
- **Gemini**: compiled to `.gemini/commands/<name>.toml`

## Agents

Specialized personas with their own model, system prompt, and tool boundaries.

**Source:** `.apm/agents/<name>.agent.md`

```markdown
---
name: security-reviewer
description: Expert in OWASP Top 10 and secure coding practices
model: claude-opus-4-5
tools:
  - codebase
  - web_search
---
You are a security-focused code reviewer...
```

| Frontmatter Field | Notes |
|-------------------|-------|
| `name` | Identifier used by harnesses |
| `description` | What the agent does; trigger for invocation |
| `model` | Optional model override |
| `tools` | Optional tool whitelist |

Supported by: Copilot (native), Claude (native), Cursor (compiled), Codex (compiled). Not supported by Gemini or OpenCode.

## Skills

Multi-file capabilities loaded on demand by harnesses that support agent skills. Built around `SKILL.md` as the entry point.

**Source:** `.apm/skills/<name>/SKILL.md` (+ sibling reference files, scripts, assets)

```markdown
---
name: my-skill                         # kebab-case; must match folder name
description: <trigger phrases; ≤1024 chars; include exclusions>
---
# My Skill
...
```

Skills deploy to `.agents/skills/<name>/` and are harness-neutral (`native` on all targets). Sibling files in the skill folder are deployed alongside `SKILL.md`.

## Hooks

Lifecycle handlers triggered by harness events.

**Source:** `.apm/hooks/<name>.json`

```json
{
  "event": "PreToolUse",
  "command": "./scripts/pre-tool-check.sh"
}
```

| Field | Notes |
|-------|-------|
| `event` | `PreToolUse`, `PostToolUse`, `Stop`, or harness-specific events |
| `command` | Script path; must be executable |

- **Claude**: hooks merged into `.claude/settings.json` under `hooks`.
- **Copilot**: hooks written to `.github/hooks/`.
- **Kiro**: individual JSON files in `.kiro/hooks/`.
- **Windsurf**: not supported.

## Plugin Type (`plugin.json`)

A package may ship a `plugin.json` at its root instead of (or alongside) `.apm/`. APM normalizes plugin format at install time into the same primitives above.

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "...",
  "skills": [...],
  "prompts": [...],
  "instructions": [...]
}
```

`apm pack` generates `plugin.json` from `apm.yml` + `.apm/` content automatically. Do not hand-author `plugin.json` for new packages; use the `.apm/` layout.

## Dev-Only Primitives

Primitives useful to the package author but excluded from shipped artifacts (release checklists, internal debug agents, test fixtures):

1. Author them outside `.apm/` (e.g. `dev/skills/release-checklist/SKILL.md`).
2. Declare them under `devDependencies.apm:` using a local path:
   ```yaml
   devDependencies:
     apm:
       - path: ./dev/skills/release-checklist
   ```
3. `apm pack` excludes all `devDependencies`; `apm install --dev` deploys them locally.
