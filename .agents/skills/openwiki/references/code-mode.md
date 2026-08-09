# OpenWiki Code Mode

## Prepare The Repository

Run code mode from the repository root. Before the first run:

1. Confirm the working tree state so generated changes are easy to distinguish.
2. Add `.openwikiignore` rules for private, generated, vendored, and irrelevant paths.
3. Ensure the selected model provider is authorized to process the remaining repository content.
4. Decide whether `openwiki/`, `AGENTS.md`, and `CLAUDE.md` changes will be committed.

```text
secrets/
**/bin/
**/obj/
*.log
!logs/keep.log
```

`.openwikiignore` is a read boundary: matching paths are not read or reproduced. It cannot prevent the agent from inferring a topic from allowed sources such as tests, commit messages, or README files.

## Initialize

```bash
openwiki --init
# Equivalent explicit mode:
openwiki code --init
```

The first interactive run prompts for provider, model, credentials, and optional LangSmith tracing. A successful run typically creates or updates:

| Path | Purpose |
| --- | --- |
| `openwiki/` | Generated linked Markdown wiki |
| `openwiki/INSTRUCTIONS.md` | User-owned scope and priorities; normal init/update runs preserve it |
| `openwiki/.last-update.json` | Last successful content-change metadata |
| `AGENTS.md` | OpenWiki-owned pointer block, if applicable |
| `CLAUDE.md` | OpenWiki-owned pointer block, if applicable |

OpenWiki rewrites only content between `<!-- OPENWIKI:START -->` and `<!-- OPENWIKI:END -->` in agent instruction files. Review the diff after every run.

## Customize The Brief

Edit `openwiki/INSTRUCTIONS.md`, or ask OpenWiki to edit it:

```bash
openwiki "Update openwiki/INSTRUCTIONS.md to prioritize the public API and skip internal tooling"
```

Use the brief for stable repository-specific scope, terminology, priorities, and exclusions. Use `.openwikiignore` for path-level read restrictions.

## Update

After meaningful repository changes:

```bash
openwiki --update
# Explicit and non-interactive:
openwiki code --update --print
```

`--init` and `--update` are mutually exclusive. Updates use repository history and diffs, preserve valid OpenWiki metadata, and avoid changing `.last-update.json` when documentation did not change.

For a focused request:

```bash
openwiki code --update "Refresh architecture and public API documentation"
```

## Interactive And One-Shot Use

```bash
openwiki
openwiki "Explain the current wiki structure"
openwiki -p "Summarize what you can do"
```

Bare `openwiki` stays open for follow-up messages. `-p` or `--print` runs once and exits; configure credentials first because non-interactive runs cannot prompt.

Interactive slash commands include `/provider`, `/model`, `/api-key`, `/langsmith-key`, `/init`, `/update`, and `/exit`.

## Visualize

```bash
openwiki visualize
openwiki visualize openwiki --port 4400 --no-open
```

The visualizer serves only on `127.0.0.1`; default port `4321` increments on conflict. It watches wiki edits and displays a graph beside a Markdown reader. The page loads graph, Markdown, and diagram libraries from a public CDN, so browser rendering requires internet access.

Stop the server with `Ctrl-C`.

## Mermaid Validation

OpenWiki validates generated Mermaid fences and converts invalid diagrams to readable `text` fences for later repair. For validation closer to GitHub rendering, install optional parser peers in the environment that runs OpenWiki:

```bash
npm install mermaid jsdom
```

## Automate Updates

Use the official example for the Git provider:

| Provider | Example destination |
| --- | --- |
| GitHub Actions | `.github/workflows/openwiki-update.yml` |
| GitLab CI | `.gitlab-ci.yml` or included pipeline file |
| Bitbucket | `bitbucket-pipelines.yml` plus a scheduled custom pipeline |

CI runs:

```bash
openwiki code --update --print
```

Set `OPENWIKI_PROVIDER`, `OPENWIKI_MODEL_ID`, and provider credentials as protected secrets or variables. `--update` can create missing docs in CI; `--init` is unnecessary. Review the official workflow before copying it, pin dependencies according to repository policy, and grant only permissions needed to open a documentation change.

For GitHub Copilot in local runs, OpenWiki can reuse `gh auth login` without persisting its token. In CI, configure `OPENWIKI_PROVIDER=copilot`, select an entitled `OPENWIKI_MODEL_ID`, and store a GitHub OAuth token as the protected `COPILOT_API_KEY` secret. Do not use a personal access token or the workflow's standard `GITHUB_TOKEN` for Copilot inference.

## Review Generated Changes

Check:

- No ignored or secret material appears in generated pages.
- Architecture, APIs, commands, and links match the source.
- `openwiki/INSTRUCTIONS.md` remains user-authored.
- Existing content outside OpenWiki markers in agent files remains unchanged.
- Generated Mermaid diagrams render or degrade to readable text.
- Documentation changes are scoped to relevant source changes.
