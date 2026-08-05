# Intelligentium

**Intelligentium** is the official NetFabric marketplace for AI plugins — a curated marketplace of intelligence modules you can install, combine, and run across your agents, workflows, and automation systems.

🌐 **Website:** [intelligentium.ai](https://intelligentium.ai/)

---

## ✨ What’s Inside

Intelligentium provides a growing ecosystem of AI‑ready plugins, including:

- **Skills** — reusable capabilities your agents can call  
- **Agents** — autonomous or semi‑autonomous units  
- **Hooks** — event‑driven extensions  
- **MCP Servers** — Model Context Protocol services  
- **Tools** — standalone utilities exposed as plugin modules  

All plugins follow a predictable, deterministic structure, making installation,
composition, and integration straightforward.

---

## 🚀 Getting Started

### 1. Add the Marketplace

Register Intelligentium as a marketplace in [APM](https://microsoft.github.io/apm/):

```bash
apm marketplace add netfabric/intelligentium
```

### 2. Explore the Catalog

Browse the `plugins` folder to discover modules that extend your agents,
workflows, or automation pipelines.

| Plugin | Description |
| --- | --- |
| [math-foundations](plugins/math-foundations) | Core abstract math skills for angles, trigonometry, vectors, and coordinate system conversions |
| [math-rotation](plugins/math-rotation) | Abstract math skills for 3D rotation representations, quaternion algebra, and interpolation on manifolds |
| [math-geodesy](plugins/math-geodesy) | Abstract math skills for geodetic coordinates, reference ellipsoids, and datum transformations |
| [dotnet](plugins/dotnet) | C# and .NET skills for modern language best practices and generic math over `System.Numerics` |
| [apm-authoring](plugins/apm-authoring) | Skills for authoring, consuming, and publishing APM packages, plus configuring apm-action CI workflows |
| [agent-authoring](plugins/agent-authoring) | Skills for authoring AGENTS.md project-context files, SKILL.md agent skills, converting data to/from TOON (Token-Oriented Object Notation), and following Markdown formatting best practices |
| [agentic-discovery](plugins/agentic-discovery) | Skill for the Agentic Resource Discovery (ARD) open specification for publishing and discovering AI capabilities |
| [ucp](plugins/ucp) | Skills for implementing (business/merchant) and consuming (platform/agent) the Universal Commerce Protocol (UCP) for agentic commerce discovery, checkout, and payments |

### 3. Install Plugins via APM

Each plugin ships with an APM manifest for deterministic installation and
dependency management:

```bash
apm install <plugin-name>@intelligentium
```

---

## 🔎 Agentic Resource Discovery (ARD)

Intelligentium publishes an [ARD](https://github.com/agentic-resource-discovery/spec) v0.9 catalog so agents and registries can discover its plugins/skills programmatically:

```text
https://intelligentium.ai/.well-known/ai-catalog.json
```

The catalog is generated from `apm.yml` via `npm run generate:ard` (see [scripts/generate-ai-catalog.mjs](scripts/generate-ai-catalog.mjs)) and kept in sync automatically by CI — on every push to `main` and on same-repo pull requests — whenever `apm.yml` or a plugin's `SKILL.md` changes.

---

## 🧩 Plugin Structure

Every Intelligentium module adheres to a consistent layout, enabling:

- predictable installation  
- clean dependency graphs  
- seamless composition across agents and workflows  

This consistency ensures that plugins remain interoperable and easy to automate.

---

## 🛠 Contributing

Contributions are welcome — new skills, agents, hooks, MCP servers, and tools
help expand the ecosystem. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
repository layout and the steps to add a skill or plugin. Coding agents working
in this repo should also read [AGENTS.md](AGENTS.md).
