# OpenWiki Personal Mode

## Initialize

```bash
openwiki personal --init
```

Personal mode writes the synthesized wiki to `~/.openwiki/wiki` and stores global instructions in `~/.openwiki/INSTRUCTIONS.md`. Onboarding configures the model provider, optional LangSmith tracing, sources, templates, ingestion notes, and optional schedules.

| Path | Contents |
| --- | --- |
| `~/.openwiki/wiki/` | Personal Markdown wiki |
| `~/.openwiki/INSTRUCTIONS.md` | Global personal-wiki brief |
| `~/.openwiki/onboarding.json` | Preferences, source instances, notes, schedules |
| `~/.openwiki/connectors/<source>/raw/` | Deterministically fetched source data and manifests |
| `~/.openwiki/.env` | Provider and connector secrets |

## Supported Sources

| Source | Authentication |
| --- | --- |
| Local git repositories | Local paths |
| Gmail | Google OAuth |
| Notion | Hosted MCP OAuth |
| Slack | App client credentials plus OAuth and HTTPS callback |
| X/Twitter | OAuth 2.0 with PKCE |
| Web search | `TAVILY_API_KEY` |
| Hacker News | None |

Multiple instances of one source are supported, such as `web-search-1` and `web-search-2`.

## Authenticate Connectors

List supported providers and status:

```bash
openwiki auth
```

Run browser authentication where required:

```bash
openwiki auth notion
openwiki auth gmail
openwiki auth x
openwiki auth slack
```

Advanced auth helpers:

```bash
openwiki auth configure <provider> --force
openwiki auth tools <provider>
```

Slack OAuth may require an HTTPS callback tunnel:

```bash
openwiki ngrok start
openwiki ngrok start https://your-domain.ngrok.app
```

Never put secret values in connector configuration. OpenWiki references environment-variable names and stores local secrets in `~/.openwiki/.env`.

## Ingest Sources

```bash
openwiki ingest all
openwiki ingest web-search
openwiki ingest web-search-2
```

An ingestion run first writes raw connector data, then source-specific agent runs synthesize wiki updates. Refresh all configured personal sources with:

```bash
openwiki personal --update
openwiki personal --update "Refresh the wiki from configured connectors"
```

Use interactive personal chat for follow-ups:

```bash
openwiki personal
```

## Visualize

```bash
openwiki visualize ~/.openwiki/wiki
```

The visualizer binds to loopback only. It still loads browser libraries from a public CDN.

## Manage Schedules On macOS

OpenWiki can install personal-source schedules as user LaunchAgents under `~/Library/LaunchAgents/`; logs go under `~/.openwiki/logs/`.

```bash
openwiki cron list
openwiki cron pause <source|all>
openwiki cron resume <source|all>
openwiki cron delete <source|all>
```

Deleting a schedule unloads its LaunchAgent and removes schedule metadata. It does not delete authentication, connector configuration, raw data, or wiki content.

## Data And Credential Boundaries

- `~/.openwiki` should be user-only (`0o700`); `~/.openwiki/.env` should be `0o600`.
- Review each connector's permissions and data scope before authentication.
- Keep connector raw data out of source repositories and backups that lack equivalent protection.
- Revoke OAuth grants at the provider when a connector is no longer used.
- Remove saved local tokens only after confirming which source instances depend on them.
- Treat personal wiki output as sensitive because synthesis may combine information from several sources.
