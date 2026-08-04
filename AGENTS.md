## Project overview

Intelligentium is NetFabric's [APM](https://microsoft.github.io/apm/) marketplace: `plugins/<name>/` packages, each bundling one or more Copilot skills (`SKILL.md` + `references/`), installable via `apm install <plugin>@intelligentium`. Root [apm.yml](apm.yml) lists every package under `marketplace.packages`. This repo also dogfoods itself: root `apm.yml`'s `dependencies.apm` list installs a subset of its own packages into `.agents/skills/` so this workspace's own Copilot can use them (check that list, not this doc, for which packages are currently self-installed). `plugins/<name>/.apm/skills/<skill>/` is always the real source — `.agents/skills/<skill>/` for a self-installed package is apm-installed, hash-locked output, not a hand-authored master.

## Setup commands

- Install script deps: `npm install`
- Requires the `apm` CLI on PATH (see https://microsoft.github.io/apm/ for install)

## Build commands

- Rebuild marketplace manifest: `apm pack` → writes `.claude-plugin/marketplace.json`
- Rebuild ARD catalog: `npm run generate:ard` → writes `.well-known/ai-catalog.json`
- Rebuild sitemap: `npm run generate:sitemap` → writes `sitemap.xml` from every root `*.html` page
- `apm pack` is the only one you still need to run and commit by hand. The ARD catalog and sitemap are fully automated by `.github/workflows/ard-catalog.yml` and `.github/workflows/sitemap.yml` respectively: each regenerates and auto-commits/pushes its output (`.well-known/ai-catalog.json` / `sitemap.xml`) on push to `main`, and on same-repo PR branches too (so neither drifts while a PR is open); fork PRs can't be auto-pushed to (`GITHUB_TOKEN` has no write access there) so those jobs fail loudly instead, telling the contributor to run the matching `npm run generate:*` command locally.
- `apm compile` only processes instructions/prompts/agents; skill-only plugins report "No instruction files found" — expected, not an error.
- Per-plugin GitHub Releases are automated: `.github/workflows/plugin-releases.yml` runs `npm run release:plugins` on every push to `main` that touches `apm.yml`. For each `marketplace.packages` entry whose `version` has no matching tag yet (tag named per that package's `tag_pattern`, e.g. `dotnet-v0.7.0`), it tags the commit, pushes it, and runs `gh release create` with notes listing the commits under that plugin's own `plugins/<name>` path since its previous release tag. Bump a package's `version` in root `apm.yml` (and its own `plugins/<name>/apm.yml`) to trigger its next release.

## Conventions

- Every `plugins/<name>/` package must have its own `plugins/<name>/README.md` (name, description, a table of its skills with links under `.apm/skills/<skill>`, and the `apm install <name>@intelligentium` command). Add it when creating a new plugin, and update it whenever skills are added, removed, or renamed in an existing plugin.
- Plugin `scripts/` folders (automation shipped inside a skill) must be Python-only in this marketplace — this is an Intelligentium-specific normalization to minimize runtime dependencies and keep skill behavior deterministic across consumers. This does **not** apply to the generic `create-skill` skill's own guidance (which permits any language) or to this repo's own build tooling under root [scripts/](scripts/) (Node.js, unaffected).
- `apm plugin init <name>` scaffolds a **nested** `<name>/<name>/` folder — flatten with `mv "<name>/<name>"/* "<name>/"`.
- Never hand-author `plugin.json` — delete it and let `apm pack` synthesize it from `apm.yml`.
- SKILL.md frontmatter `description` fields are not valid standalone YAML (they contain unescaped `USE FOR:` colons) — parse them with the regexes in [scripts/generate-ai-catalog.mjs](scripts/generate-ai-catalog.mjs), not `yaml.load` on the raw frontmatter block.
- Never write a literal `#` preceded by whitespace inside an unquoted YAML description (apm.yml or SKILL.md frontmatter) — it starts a real YAML comment and silently truncates the rest of the value for any strict parser. Reword instead (e.g. "colon-prefixed directives" not "`#:`").
- If you edit a skill belonging to a package listed under root `apm.yml`'s `dependencies.apm` (this repo installs those on itself), **reinstall after publishing**: commit + push the `plugins/<name>` change to `main`, then run `apm install --target copilot` to refresh `.agents/skills/` and relock `apm.lock.yaml`; commit those resulting diffs too. `apm install` resolves this self-dependency from the GitHub remote at a pinned commit — it does **not** read local uncommitted `plugins/` changes, and running it before pushing will silently revert any direct edit you made under `.agents/skills/` back to the last-published version.

## Directory map

```
apm.yml                        # marketplace.packages: source of truth for published plugins
plugins/<name>/apm.yml         # plugin manifest (name, version, tags, targets)
plugins/<name>/.apm/skills/<skill>/SKILL.md   # real source of truth for every skill
.agents/skills/<skill>/        # apm-installed output for packages in root apm.yml's dependencies.apm (self-dependency); reinstall after publishing, don't hand-edit as source
.well-known/ai-catalog.json    # generated — ARD v0.9 catalog, do not hand-edit
sitemap.xml                    # generated — do not hand-edit
.claude-plugin/marketplace.json # generated by `apm pack`, do not hand-edit
scripts/generate-ai-catalog.mjs # ARD catalog generator
scripts/generate-sitemap.mjs   # sitemap.xml generator
scripts/release-plugins.mjs    # per-plugin GitHub Release automation
.github/workflows/ard-catalog.yml # regenerates + commits ai-catalog.json on push
.github/workflows/sitemap.yml  # regenerates + commits sitemap.xml on push
.github/workflows/plugin-releases.yml # tags + creates a GitHub Release per plugin version bump
```

## PR instructions

- Title: short, imperative summary.
- Run `apm pack` and `npm run generate:ard` before committing; commit any resulting diffs.
- If the change touches `*.html`, also run `npm run generate:sitemap` and commit the resulting `sitemap.xml` diff.
- If the change touched a skill in a package listed under root `apm.yml`'s `dependencies.apm`, also run `apm install --target copilot` after this PR is merged to `main` (self-dependency reinstall) and commit the `.agents/skills/` + `apm.lock.yaml` diffs in a follow-up.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the full walkthrough on adding skills/plugins.

## Security considerations

- No secrets belong in this repo — it's a public marketplace of Markdown/YAML content.
- `.github/workflows/ard-catalog.yml` pushes to `main` using the default `GITHUB_TOKEN`; don't broaden its `permissions` beyond `contents: write`.
- Treat `.claude-plugin/marketplace.json` and `.well-known/ai-catalog.json` as generated output — always regenerate via the commands above rather than editing by hand.
