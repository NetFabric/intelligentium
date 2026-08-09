# OpenWiki Installation

## Prerequisites

The current published package metadata requires Node.js 22 or newer. Verify the live registry requirement before installation because it may change.

```bash
node --version
npm --version
npm view openwiki engines --json
```

| Check | Required outcome |
| --- | --- |
| `node --version` | Satisfies the package's current `engines.node` range |
| `npm --version` | npm is available, normally bundled with Node.js |
| Registry lookup | Resolves the official `openwiki` package |

## Check Whether It Is Installed

Use three independent checks because command discovery, package registration, and runtime health can fail separately.

### macOS And Linux

```bash
command -v openwiki
npm list -g --depth=0 openwiki
openwiki --help
```

### PowerShell

```powershell
Get-Command openwiki -ErrorAction SilentlyContinue
npm list -g --depth=0 openwiki
openwiki --help
```

| Observation | Diagnosis |
| --- | --- |
| Command path, npm entry, and help output | Healthy global installation |
| npm entry only | Global package exists but its executable directory is not on `PATH` |
| Command path only | Executable may come from another package manager or stale install |
| Help emits Node engine or module error | Runtime or dependency mismatch |
| All checks fail | Install OpenWiki |

OpenWiki has no documented `--version` flag. Read the installed version with:

```bash
npm list -g --depth=0 openwiki
```

Compare it with the registry without installing:

```bash
npm view openwiki version
```

## Install Globally

Use npm, the official quickstart path:

```bash
npm install -g openwiki
openwiki --help
```

Or use pnpm:

```bash
pnpm setup                 # Run once if the global bin directory is not configured
pnpm add -g openwiki
openwiki --help
```

On Windows, prefer npm or pnpm. Bun may compile the native `better-sqlite3` dependency and require Visual Studio Build Tools with the Desktop development with C++ workload.

## Repair PATH

If npm lists OpenWiki but the shell cannot find it:

```bash
npm prefix -g
```

On macOS and Linux, global executables normally live under the returned prefix's `bin/` directory. Add that directory to the shell's `PATH`, start a new shell, then rerun:

```bash
command -v openwiki
openwiki --help
```

For pnpm, initialize its home and follow the printed shell instructions:

```bash
pnpm setup
```

Do not guess or hard-code a global directory; Node version managers and package-manager configurations move it.

## Update

```bash
npm install -g openwiki@latest
npm list -g --depth=0 openwiki
openwiki --help
```

With pnpm:

```bash
pnpm update -g openwiki
openwiki --help
```

Updating the CLI does not update a generated wiki. Run `openwiki --update` separately inside each repository, or `openwiki personal --update` for the personal wiki.

## Uninstall

```bash
npm uninstall -g openwiki
```

Or:

```bash
pnpm remove -g openwiki
```

Uninstalling the package does not remove generated repository `openwiki/` directories or user data under `~/.openwiki/`. Delete those only when explicitly requested and after checking for credentials, connector data, and documentation that must be retained.

## Installation Validation

```bash
node --version
npm list -g --depth=0 openwiki
openwiki --help
```

Do not initialize a repository merely to test installation: `openwiki --init` writes documentation and modifies OpenWiki-owned blocks in root agent instruction files.
