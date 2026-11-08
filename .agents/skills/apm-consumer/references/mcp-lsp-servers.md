# APM Consumer — MCP & LSP Servers

## MCP Servers Overview

APM writes per-harness MCP config at `apm install`. Direct deps install automatically; transitive MCP servers are blocked unless explicitly declared or `--trust-transitive-mcp` is passed.

## MCP — String Form (Registry)

```yaml
dependencies:
  mcp:
    - io.github.github/github-mcp-server
    - io.github.modelcontextprotocol/server-filesystem
```

Uses the public MCP registry. The string is the registry name (`<namespace>/<server>`).

## MCP — Object Form

### Registry Reference with Overrides

```yaml
dependencies:
  mcp:
    - name: io.github.github/github-mcp-server
      tools: ["repos", "issues"]        # restrict exposed tools (default: ["*"])
      version: "1.2.0"                  # pin to a specific server version
      env:
        GITHUB_TOKEN: "${GITHUB_TOKEN}"
```

### Self-Defined stdio Server

```yaml
- name: my-local-server
  registry: false
  transport: stdio
  command: ./bin/my-server             # single binary path; use args for extra args
  args: ["--port", "3000"]
  env:
    API_KEY: "${MY_API_KEY}"
```

### Self-Defined HTTP/Remote Server

```yaml
- name: my-remote-server
  registry: false
  transport: http                       # or: sse, streamable-http
  url: https://my-server.example.com/mcp
  headers:
    Authorization: "Bearer ${MY_TOKEN}"
  # Harness-specific extra keys pass through verbatim:
  oauth:
    clientId: "<client-id>"
    callbackPort: 3118
```

### Validation Rules for Self-Defined Servers

| Condition | Requirement |
|-----------|-------------|
| `registry: false` | `transport` is required |
| `transport: stdio` | `command` is required (single binary, no embedded spaces unless `args` also present) |
| `transport: http/sse/streamable-http` | `url` is required |

## Variable References in `env` and `headers`

| Syntax | Copilot (VS Code) | Claude | Codex/Gemini/Cursor |
|--------|-------------------|--------|---------------------|
| `${VAR}` | Translated to `${env:VAR}` | Resolved at install time | Resolved at install time |
| `${env:VAR}` | Native pass-through | Resolved at install time | Resolved at install time |
| `${input:<id>}` | VS Code runtime prompt | Not supported | Not supported |
| `${{ secrets.KEY }}` | Left untouched | Left untouched | Left untouched |

**Recommendation:** Use `${VAR}` or `${env:VAR}` for cross-harness compatibility. `${input:...}` only works in VS Code Copilot.

## Where MCP Config Is Written

| Target | Config File |
|--------|------------|
| `copilot` | `.github/mcp.json` (project) or `~/.copilot/mcp.json` (user) |
| `claude` | `.claude/settings.json` (merged under `mcpServers`) |
| `cursor` | `.cursor/mcp.json` |
| `codex` | `.codex/mcp.json` |
| `gemini` | `.gemini/settings.json` |
| `kiro` | `.kiro/settings/mcp.json` |
| `opencode` | `.opencode/mcp.json` |
| `windsurf` | `.windsurf/mcp_config.json` |

## LSP Servers

APM writes LSP config for Claude Code and GitHub Copilot CLI. Other harnesses are ignored.

### LSP — String Form

```yaml
dependencies:
  lsp:
    - gopls
```

String-form entries are resolved from transitive packages or plugin `.lsp.json` files.

### LSP — Object Form

```yaml
dependencies:
  lsp:
    - name: pyright
      command: pyright-langserver
      args: ["--stdio"]
      extensionToLanguage:
        ".py": python
        ".pyi": python
      transport: stdio                  # stdio (default) or socket
      env:
        PYTHONPATH: "./src"
      startupTimeout: 10000
      restartOnCrash: true
      maxRestarts: 3
```

### LSP Object Fields

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Server identifier; alphanumeric, `@`, `_`, `/`, `-` |
| `command` | Yes | Binary on `$PATH` or relative path; no `..` segments |
| `extensionToLanguage` | Yes | Non-empty map: `".py": python` |
| `args` | No | CLI arguments list |
| `transport` | No | `stdio` (default) or `socket` |
| `env` | No | Environment variables for the server process |
| `initializationOptions` | No | Passed during LSP initialization |
| `settings` | No | Passed via `workspace/didChangeConfiguration` |
| `startupTimeout` | No | Max ms to wait for startup |
| `shutdownTimeout` | No | Max ms for graceful shutdown |
| `restartOnCrash` | No | Auto-restart on crash |
| `maxRestarts` | No | Restart limit before giving up |

### Where LSP Config Is Written

| Target | Config File |
|--------|------------|
| `claude` | `.lsp.json` (project scope) or `~/.claude.json` (user scope) |
| `copilot` | `.github/lsp.json` (project) or `~/.copilot/lsp-config.json` (user) |
