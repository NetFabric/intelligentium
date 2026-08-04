# Skill Structure Reference

## Folder Layout

```text
~/.agents/skills/<skill-name>/   # user-global (all workspaces)
  SKILL.md
  references/

.agents/skills/<skill-name>/     # workspace-scoped (preferred)
  SKILL.md
  references/

# Fallback (legacy):
.github/copilot/skills/<skill-name>/
```

## Frontmatter Spec

| Field | Required | Constraint | Notes |
|-------|----------|-----------|-------|
| `name` | yes | kebab-case | Must match folder name |
| `description` | yes | ≤1024 chars | Semantic trigger for agent |

## Description Template

```text
<Primary action verb> <domain>. Use when: <trigger list>. [Covers: <key topics>.] [DO NOT USE FOR: <exclusions>.]
```

- Lead with verb: "Create", "Configure", "Debug", "Migrate"
- Trigger list: semicolons, no articles, keyword-dense
- Exclusions prevent false activations — include them
- Count chars: `echo -n "text" | wc -c`

## YAML Safety in Descriptions

Descriptions are unquoted plain YAML scalars. Some character sequences break or silently corrupt parsing:

| Sequence | Effect | Fix |
|----------|--------|-----|
| ` #` (space + hash) | Starts a YAML comment — a strict parser silently drops everything after it, with no error | Never use the raw token; reword (e.g. "colon-prefixed directives" instead of "`#:`") |
| `: ` (colon + space) mid-value | Ambiguous with a new mapping key; strict parsers (`js-yaml`) throw `bad indentation of a mapping entry` | Tolerated in this repo only because SKILL.md frontmatter is parsed via regex, not `yaml.load` — avoid introducing new instances where avoidable |
| Leading `- ? : , [ ] { } # & * ! \| > ' " % @` \` | A scalar can't start with these unquoted | Don't start a description with these characters |

Verify a description is comment-safe: `node -e "console.log(require('js-yaml').load('description: ' + require('fs').readFileSync('SKILL.md','utf8').split(/\ndescription: /)[1].split('\n')[0]))"` — if the printed value is truncated versus the source line, reword it.

## Reference File Conventions

| Convention | Rule |
|-----------|------|
| Naming | lowercase, hyphen-separated |
| Scope | one topic per file |
| Size | ≤200 lines; split if larger |
| Linking | use relative markdown links in SKILL.md table |
| Load hint | every ref file must have a row in SKILL.md table |

## Scripts & Assets

| Directory | Use For | Notes |
|-----------|---------|-------|
| `scripts/` | Automation run by skill (e.g. codegen, scaffolding) | Python preferred; any language permitted |
| `assets/` | Templates, sample data, images | Link from SKILL.md or reference files |

A `scripts/` script isn't limited to pure deterministic code — it can embed the [copilot-sdk](../../copilot-sdk/SKILL.md) to call out to Copilot for one bounded, non-deterministic step (e.g. classify input, summarize a diff) and then resume deterministic control flow. Use this when only part of the pipeline needs judgment; keep the AI call scoped to that step so the rest of the script stays testable and reproducible.

## SKILL.md Required Sections

1. Frontmatter
2. Anatomy table (files + purpose + size)
3. Core quick-reference (tables/code, ≤3 sections)
4. Reference file table (file | load when)

## Anti-patterns

- ❌ Single flat SKILL.md with all detail
- ❌ Description > 1024 chars
- ❌ Reference files not listed in SKILL.md table
- ❌ `name` field mismatching folder name
- ❌ Duplicate content across SKILL.md and references
