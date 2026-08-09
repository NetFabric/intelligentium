---
name: openwiki
description: "Install, verify, configure, and use the OpenWiki CLI for agent-maintained repository or personal documentation. Use when: checking whether OpenWiki is installed; installing or updating the openwiki npm package; running openwiki --init or --update; generating a codebase wiki; building a personal wiki; configuring model providers, credentials, connectors, CI updates, .openwikiignore, or the visualizer; troubleshooting PATH, Node.js, better-sqlite3, provider, or non-interactive failures. DO NOT USE FOR: editing arbitrary wikis unrelated to OpenWiki; DeepWiki; generic documentation generators; implementing Open Knowledge Format consumers or producers directly (use the okf skill)."
---

# OpenWiki

OpenWiki is a Node.js CLI that generates and maintains linked Markdown documentation for coding agents and humans. Code mode writes `openwiki/` in a repository; personal mode writes `~/.openwiki/wiki` from configured sources.

## Anatomy

| File | Purpose | Target Size |
| --- | --- | --- |
| `SKILL.md` | Detection, routing, and quick reference | <100 lines |
| `references/installation.md` | Prerequisites, install, verify, update, uninstall | <200 lines |
| `references/code-mode.md` | Repository generation, updates, visualization, CI | <200 lines |
| `references/personal-mode.md` | Personal wiki, connectors, auth, schedules | <200 lines |
| `references/configuration-and-troubleshooting.md` | Providers, secrets, telemetry, common failures | <200 lines |

## Check Installation

```bash
command -v openwiki
npm list -g --depth=0 openwiki
openwiki --help
```

| Result | Meaning |
| --- | --- |
| All succeed | Installed, registered globally, and executable |
| npm lists it but command lookup fails | Installed; global npm executable directory is missing from `PATH` |
| Command resolves but help fails | Broken install, unsupported Node.js, or native dependency problem |
| Nothing resolves | Not installed globally; follow [installation.md](references/installation.md) |

OpenWiki does not document `--version`; do not use it as the installation test. Use `npm list -g openwiki` for the installed package version and `openwiki --help` for runtime health.

## Quick Start

```bash
node --version                    # Current package requires Node.js >=22
npm install -g openwiki
openwiki --help
openwiki --init                  # Run from a repository root
openwiki visualize               # Browse ./openwiki locally
openwiki --update                # Refresh after code changes
```

The first interactive run asks for a model provider, model, credentials, and optional LangSmith tracing. It stores local configuration in `~/.openwiki/.env`.

To reuse a local GitHub Copilot subscription without another inference key:

```bash
gh auth status
export OPENWIKI_PROVIDER=copilot
export OPENWIKI_MODEL_ID=gpt-5.5
openwiki code --init
```

OpenWiki reads the active GitHub CLI OAuth token for the current process but does not copy it into `~/.openwiki/.env`. Use `COPILOT_API_KEY` only for CI or another headless environment, and only with a GitHub OAuth token; classic and fine-grained personal access tokens do not work.

## Route The Task

| Goal | Load |
| --- | --- |
| Check, install, update, uninstall, or repair `PATH` | [installation.md](references/installation.md) |
| Generate or maintain repository documentation | [code-mode.md](references/code-mode.md) |
| Build a personal wiki or ingest external sources | [personal-mode.md](references/personal-mode.md) |
| Configure providers, secrets, telemetry, or diagnose failures | [configuration-and-troubleshooting.md](references/configuration-and-troubleshooting.md) |

## Core Commands

| Command | Purpose |
| --- | --- |
| `openwiki --init` | Initialize code-mode docs for the current repository |
| `openwiki --update` | Refresh code-mode docs |
| `openwiki` | Interactive code-mode chat |
| `openwiki -p "request"` | One-shot non-interactive run |
| `openwiki personal --init` | Initialize the personal wiki |
| `openwiki visualize [path]` | Serve a local graph and Markdown reader |
| `openwiki auth [provider]` | Show auth status or authenticate a connector |
| `openwiki ingest <source|all>` | Ingest configured personal sources |
| `openwiki --help` | Show current commands and flags |

## Safety Defaults

1. Create `.openwikiignore` before the first code run to exclude secrets, generated output, and irrelevant paths.
2. Never commit `~/.openwiki/.env` or copy credentials into connector configuration.
3. Review generated `openwiki/` content and OpenWiki-owned blocks in `AGENTS.md` or `CLAUDE.md` before committing.
4. Preconfigure provider credentials for `--print` and CI; non-interactive runs cannot prompt.
5. Treat the launch blog as historical context when it conflicts with current docs or package metadata.

## Sources

| Source | Role |
| --- | --- |
| [Official documentation](https://docs.langchain.com/oss/openwiki/overview) | Current user guidance |
| [OpenWiki repository](https://github.com/langchain-ai/openwiki) | Package metadata, examples, and implementation |
| [GitHub Copilot provider PR](https://github.com/langchain-ai/openwiki/pull/192) | Copilot authentication, models, routing, and endpoint behavior |
| [Launch post](https://www.langchain.com/blog/introducing-openwiki-an-open-source-agent-for-repo-documentation) | Motivation and original workflow |

## Reference Files

| File | Load When |
| --- | --- |
| [references/installation.md](references/installation.md) | Detecting, installing, updating, uninstalling, or repairing the CLI |
| [references/code-mode.md](references/code-mode.md) | Generating repository docs, visualizing, customizing, or automating updates |
| [references/personal-mode.md](references/personal-mode.md) | Configuring personal sources, authentication, ingestion, or schedules |
| [references/configuration-and-troubleshooting.md](references/configuration-and-troubleshooting.md) | Selecting providers, managing secrets, controlling telemetry, or fixing failures |
