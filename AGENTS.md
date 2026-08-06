# AGENTS.md

## Project overview

Intelligentium is NetFabric's [APM](https://microsoft.github.io/apm/) marketplace: `plugins/<name>/` packages, each bundling one or more Copilot skills (`SKILL.md` + `references/`), installable via `apm install <plugin>@intelligentium`. Root [apm.yml](apm.yml) lists every package under `marketplace.packages`. This repo also dogfoods itself: root `apm.yml`'s `dependencies.apm` list installs a subset of its own packages into `.agents/skills/` so this workspace's own Copilot can use them (check that list, not this doc, for which packages are currently self-installed). `plugins/<name>/.apm/skills/<skill>/` is always the real source — `.agents/skills/<skill>/` for a self-installed package is apm-installed, hash-locked output, not a hand-authored master.

## Setup commands

- Install script deps: `npm install`
- Requires the `apm` CLI on PATH (see <https://microsoft.github.io/apm/> for install)

## Build commands

- Rebuild marketplace manifest: `apm pack` → writes `.claude-plugin/marketplace.json`
- Rebuild ARD catalog: `npm run generate:ard` → writes `.well-known/ai-catalog.json`
- Rebuild sitemap: `npm run generate:sitemap` → writes `sitemap.xml` from every root `*.html` page
- Rebuild the website plugin listing: `npm run generate:plugins` → rewrites the `GENERATED:plugin-*` marker regions inside [index.html](index.html) (JSON-LD `ItemList`, plugin count copy, and the static plugin cards) from root `apm.yml`'s `marketplace.packages`
- `apm pack` is the only one you still need to run and commit by hand. The ARD catalog, sitemap, and plugin listing are fully automated by `.github/workflows/ard-catalog.yml`, `.github/workflows/sitemap.yml`, and `.github/workflows/plugin-listing.yml` respectively: each regenerates and auto-commits/pushes its output (`.well-known/ai-catalog.json` / `sitemap.xml` / `index.html`) on push to `main`, and on same-repo PR branches too (so none of them drift while a PR is open); fork PRs can't be auto-pushed to (`GITHUB_TOKEN` has no write access there) so those jobs fail loudly instead, telling the contributor to run the matching `npm run generate:*` command locally.
- `.github/workflows/self-deps-sync.yml` automates the self-dependency reinstall too: on every push to `main` touching `apm.yml` or a self-installed package's `plugins/<name>/**` path, it runs `apm update --yes --target copilot` and auto-commits/pushes the refreshed `.agents/skills/` + `apm.lock.yaml`. This keeps the drift window (during which `apm pack`'s hash check can fail) down to one CI run instead of an indefinite manual step.
- Never hand-edit the content between an `<!-- GENERATED:plugin-*:BEGIN -->` / `:END -->` marker pair in [index.html](index.html) — add or change a package under root `apm.yml`'s `marketplace.packages` instead and run `npm run generate:plugins`.
- `apm compile` only processes instructions/prompts/agents; skill-only plugins report "No instruction files found" — expected, not an error.
- Per-plugin GitHub Releases are automated: `.github/workflows/plugin-releases.yml` runs `npm run release:plugins` on every push to `main` that touches `apm.yml`. For each `marketplace.packages` entry whose `version` has no matching tag yet (tag named per that package's `tag_pattern`, e.g. `dotnet-v0.7.0`), it tags the commit, pushes it, and runs `gh release create` with notes listing the commits under that plugin's own `plugins/<name>` path since its previous release tag. Bump a package's `version` in root `apm.yml` (and its own `plugins/<name>/apm.yml`) to trigger its next release.

## Conventions

- Every `plugins/<name>/` package must have its own `plugins/<name>/README.md` (name, description, a table of its skills with links under `.apm/skills/<skill>`, and the `apm install <name>@intelligentium` command). Add it when creating a new plugin, and update it whenever skills are added, removed, or renamed in an existing plugin.
- Plugin `scripts/` folders (automation shipped inside a skill) must be Python-only in this marketplace — this is an Intelligentium-specific normalization to minimize runtime dependencies and keep skill behavior deterministic across consumers. This does **not** apply to the generic `create-skill` skill's own guidance (which permits any language) or to this repo's own build tooling under root [scripts/](scripts/) (Node.js, unaffected).
- `apm plugin init <name>` scaffolds a **nested** `<name>/<name>/` folder — flatten with `mv "<name>/<name>"/* "<name>/"`.
- Never hand-author `plugin.json` — delete it and let `apm pack` synthesize it from `apm.yml`.
- Every SKILL.md frontmatter `description` value must be double-quoted (`description: "..."`) — trigger-phrase descriptions routinely contain colons ("USE FOR:", "DO NOT USE FOR:") that an unquoted YAML plain scalar misparses as a new mapping key, which strict parsers reject outright (`bad indentation of a mapping entry` / `mapping values are not allowed in this context`). This was previously assumed "tolerated" because apm's own frontmatter reader was regex-based, not `yaml.load` — that assumption was wrong (other tooling strict-parses this frontmatter and fails), so quote every description; [scripts/generate-ai-catalog.mjs](scripts/generate-ai-catalog.mjs) now parses frontmatter with real `yaml.load`, not regex.
- Never let a literal `#` preceded by whitespace fall outside the quotes in a YAML description (apm.yml or SKILL.md frontmatter) — it starts a real YAML comment and silently truncates the rest of the value for any strict parser. Reword instead (e.g. "colon-prefixed directives" not "`#:`").
- If you edit a skill belonging to a package listed under root `apm.yml`'s `dependencies.apm` (this repo installs those on itself), the reinstall after publishing is automated: `.github/workflows/self-deps-sync.yml` runs `apm update --yes --target copilot` (not `apm install`) and commits the refreshed `.agents/skills/` + `apm.lock.yaml` for you once the `plugins/<name>` change lands on `main`. These self-dependencies are unpinned (no `#tag`/`#sha`), so `apm install` alone just replays whatever commit is already cached in `apm.lock.yaml` and silently no-ops (exit 0, no file changes) even after a new commit lands — only `apm update` re-resolves to the latest pushed ref. Never hand-edit `.agents/skills/` directly: it's apm-installed, hash-locked output, and a direct edit only survives until the next `apm update` (local or CI) overwrites it back to the last-published version.

## Directory map

```text
apm.yml                        # marketplace.packages: source of truth for published plugins
plugins/<name>/apm.yml         # plugin manifest (name, version, tags, targets)
plugins/<name>/.apm/skills/<skill>/SKILL.md   # real source of truth for every skill
.agents/skills/<skill>/        # apm-installed output for packages in root apm.yml's dependencies.apm (self-dependency); reinstall after publishing, don't hand-edit as source
.well-known/ai-catalog.json    # generated — ARD v0.9 catalog, do not hand-edit
sitemap.xml                    # generated — do not hand-edit
.claude-plugin/marketplace.json # generated by `apm pack`, do not hand-edit
scripts/generate-ai-catalog.mjs # ARD catalog generator
scripts/generate-sitemap.mjs   # sitemap.xml generator
scripts/generate-plugins-html.mjs # index.html plugin listing generator (JSON-LD + cards)
scripts/release-plugins.mjs    # per-plugin GitHub Release automation
.github/workflows/ard-catalog.yml # regenerates + commits ai-catalog.json on push
.github/workflows/sitemap.yml  # regenerates + commits sitemap.xml on push
.github/workflows/plugin-listing.yml # regenerates + commits index.html plugin listing on push
.github/workflows/plugin-releases.yml # tags + creates a GitHub Release per plugin version bump
.github/workflows/self-deps-sync.yml # runs `apm update --yes --target copilot` + commits .agents/skills and apm.lock.yaml on push
```

## PR instructions

- Title: short, imperative summary.
- All Markdown files touched by a PR must be free of linting problems — fix them using the `markdown-best-practices` skill before committing.
- Run `apm pack` and `npm run generate:ard` before committing; commit any resulting diffs.
- If the change touches root `apm.yml`'s `marketplace.packages`, also run `npm run generate:plugins` and commit the resulting `index.html` diff.
- If the change touches `*.html`, also run `npm run generate:sitemap` and commit the resulting `sitemap.xml` diff.
- If the change touches a skill in a package listed under root `apm.yml`'s `dependencies.apm`, no manual follow-up is needed — `.github/workflows/self-deps-sync.yml` reinstalls it (`apm update --yes --target copilot`) and commits the `.agents/skills/` + `apm.lock.yaml` diffs automatically once this PR merges to `main`.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the full walkthrough on adding skills/plugins.

## Security considerations

- No secrets belong in this repo — it's a public marketplace of Markdown/YAML content.
- `.github/workflows/ard-catalog.yml`, `.github/workflows/sitemap.yml`, `.github/workflows/plugin-listing.yml`, and `.github/workflows/self-deps-sync.yml` push to `main` using the default `GITHUB_TOKEN`; don't broaden their `permissions` beyond `contents: write`.
- Treat `.claude-plugin/marketplace.json`, `.well-known/ai-catalog.json`, `sitemap.xml`, and the `GENERATED:plugin-*` marker regions inside [index.html](index.html) as generated output — always regenerate via the commands above rather than editing by hand.
