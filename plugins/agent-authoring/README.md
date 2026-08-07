# agent-authoring

Skills for authoring AGENTS.md project-context files, SKILL.md agent skills, GitHub Copilot CLI custom agents, Claude Code custom subagents, graph-pattern multi-agent squads/swarms, choosing which AI model an agent should use, building apps with the GitHub Copilot SDK, automating Copilot CLI in GitHub Actions, converting data to/from TOON (Token-Oriented Object Notation) to cut LLM token usage, and following Markdown formatting best practices.

## Skills

| Skill | Description |
| --- | --- |
| [agent-graph-orchestration](.apm/skills/agent-graph-orchestration) | Design and scaffold multi-agent squads/swarms using the graph orchestration pattern, delegating node authoring to the target harness's agent-authoring skill |
| [agents-md](.apm/skills/agents-md) | Author and maintain AGENTS.md files — the open, tool-agnostic format for giving coding agents project context |
| [claude-code-custom-agents](.apm/skills/claude-code-custom-agents) | Create and maintain Claude Code custom subagents (.claude/agents/*.md files) |
| [copilot-cli-custom-agents](.apm/skills/copilot-cli-custom-agents) | Create and maintain GitHub Copilot CLI custom agents (.agent.md files) |
| [copilot-github-actions](.apm/skills/copilot-github-actions) | Automate GitHub Copilot CLI in GitHub Actions workflows |
| [copilot-sdk](.apm/skills/copilot-sdk) | Embed the GitHub Copilot agent runtime into your own application using the Copilot SDK |
| [create-skill](.apm/skills/create-skill) | Create or update AI agent skills (SKILL.md + reference files) for any harness that supports the format |
| [markdown-best-practices](.apm/skills/markdown-best-practices) | Write and review Markdown files for consistent, correctly-rendering formatting |
| [mermaid-diagrams](.apm/skills/mermaid-diagrams) | Author Mermaid diagrams in `mermaid`-fenced markdown code blocks, covering every stable (non-experimental) diagram type |
| [model-selection](.apm/skills/model-selection) | Choose and tune which AI model a custom agent, subagent, or squad node should use, across Copilot CLI, Claude Code, and VS Code custom agents |
| [toon](.apm/skills/toon) | Convert data to/from TOON (Token-Oriented Object Notation) for lower-token LLM context |

## Install

```bash
apm install agent-authoring@intelligentium
```

Part of the [Intelligentium](../../README.md) marketplace.
