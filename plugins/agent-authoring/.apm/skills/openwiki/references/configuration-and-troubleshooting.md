# OpenWiki Configuration And Troubleshooting

## Model Providers

The interactive setup wizard is the preferred configuration path. It stores defaults and credentials in `~/.openwiki/.env`; process environment values take precedence.

| Provider | Primary credential |
| --- | --- |
| OpenAI | `OPENAI_API_KEY` |
| OpenAI with ChatGPT login | Browser OAuth |
| Anthropic | `ANTHROPIC_API_KEY` |
| Gemini AI Studio | `GEMINI_API_KEY` |
| Gemini Enterprise | Google ADC plus `GOOGLE_CLOUD_PROJECT` |
| AWS Bedrock | AWS default chain or explicit Bedrock credentials |
| GitHub Copilot | GitHub CLI session or `COPILOT_API_KEY` OAuth token |
| OpenRouter | `OPENROUTER_API_KEY` |
| Baseten, Fireworks, Nebius, NVIDIA | Provider API key |
| OpenAI-compatible endpoint | API key, base URL, and model ID |

Set a provider and model non-interactively:

```bash
export OPENWIKI_PROVIDER=openai
export OPENWIKI_MODEL_ID=gpt-5.6-terra
```

Never place real credentials in committed shell scripts. Use the local protected environment file or a secret manager in CI.

## OpenAI-Compatible Endpoints

```bash
export OPENWIKI_PROVIDER=openai-compatible
export OPENAI_COMPATIBLE_API_KEY=local-placeholder
export OPENAI_COMPATIBLE_BASE_URL=http://localhost:11434/v1
export OPENWIKI_MODEL_ID=your-model-name
openwiki --init
```

OpenWiki requires the API-key variable even when a local endpoint ignores its value. Ollama and LM Studio must expose OpenAI-compatible chat completions at the configured URL.

## GitHub Copilot

GitHub Copilot support was added in [OpenWiki PR #192](https://github.com/langchain-ai/openwiki/pull/192). It uses provider ID `copilot` and the OpenAI-compatible Copilot API at `https://api.githubcopilot.com`.

For local use, authenticate a Copilot-enabled GitHub account and initialize OpenWiki:

```bash
gh auth login
gh auth status
export OPENWIKI_PROVIDER=copilot
export OPENWIKI_MODEL_ID=gpt-5.5
openwiki code --init
```

During interactive onboarding, select **GitHub Copilot**. OpenWiki detects an active GitHub CLI session; press Enter to reuse it, or Tab to run `gh auth login`. The token remains in the GitHub CLI credential store and is resolved only for the current OpenWiki process. A token-free saved configuration is sufficient:

```dotenv
OPENWIKI_PROVIDER="copilot"
OPENWIKI_MODEL_ID="gpt-5.5"
```

The bundled Copilot model list includes GPT, Claude, and Gemini options, but actual availability depends on the account's Copilot plan and entitlements. Use the onboarding model picker or `/model`, and choose another listed model if the API rejects one. GPT-5-family models use the Responses API; other Copilot models use chat completions.

For CI or another headless environment, set `COPILOT_API_KEY` to a GitHub OAuth token. Classic and fine-grained personal access tokens are rejected by the Copilot API for this integration. The standard GitHub Actions `GITHUB_TOKEN` is not a substitute for a Copilot OAuth token.

For GitHub Enterprise Cloud data residency or a proxy, override the endpoint; OpenWiki derives the GitHub CLI hostname from this URL:

```bash
export COPILOT_BASE_URL=https://your-tenant.ghe.com/api/copilot
```

## Secrets And Tracing

Local secrets are stored in `~/.openwiki/.env` with restricted permissions. Optional LangSmith tracing uses:

```bash
export LANGSMITH_API_KEY=your-key
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=openwiki
```

In interactive mode, `/api-key` changes the active provider key and `/langsmith-key` changes or clears tracing credentials using masked prompts.

## Telemetry

Anonymous aggregate telemetry is enabled by default. Disable it with either variable:

```bash
export OPENWIKI_TELEMETRY_DISABLED=1
# Or the cross-tool convention:
export DO_NOT_TRACK=1
```

Inspect a run's exact telemetry payload locally:

```bash
openwiki --telemetry-file=./openwiki-telemetry.json --update
```

Review the file before sharing it and remove it when no longer needed.

## Failure Matrix

| Symptom | Check | Resolution |
| --- | --- | --- |
| `openwiki: command not found` | `npm list -g openwiki`, `npm prefix -g` | Add the package manager's executable directory to `PATH` or reinstall |
| Unsupported engine error | `node --version`, `npm view openwiki engines` | Install a compatible Node.js release; currently Node.js 22+ |
| `better-sqlite3` build failure on Windows | Package manager and Build Tools | Prefer npm/pnpm; if Bun must compile, install the C++ workload |
| Non-interactive credential failure | `OPENWIKI_PROVIDER`, model, provider key | Preconfigure all values; `--print` and CI cannot prompt |
| Provider authentication failure | Correct credential kind and endpoint | Reauthenticate; do not use a PAT for Copilot's headless token |
| Local model connection failure | Base URL, running server, model ID | Start the server and verify its OpenAI-compatible endpoint |
| pnpm global-bin error | `pnpm setup` | Apply printed shell changes and start a new shell |
| No wiki changes after update | Source diff and `.last-update.json` | A no-op is expected when relevant documentation did not change |
| Missing files in docs | `.openwikiignore` and brief | Adjust deliberate exclusions; do not expose private paths merely for coverage |
| Visualizer page incomplete | Internet access and CDN filtering | Allow required public CDN assets or read Markdown directly |
| Port conflict | Visualizer output | Use the incremented port or pass `--port <port>` |

## Debugging Sequence

1. Run `node --version` and ensure it satisfies `npm view openwiki engines`.
2. Run `npm list -g --depth=0 openwiki` and `openwiki --help`.
3. Confirm the command runs from the intended repository root and mode.
4. Check provider, model, and credential variable names without printing secret values.
5. Retry with `--debug` for full credential and error diagnostics.
6. Use `--dry-run` to inspect what would run without invoking the agent when supported by the installed version.
7. Consult `openwiki --help` because installed CLI behavior may be newer than this skill.

Do not paste debug output publicly until credentials, file paths, repository names, URLs, and personal connector data have been reviewed and redacted.
