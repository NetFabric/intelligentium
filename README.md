# Intelliforge

**Intelliforge** is the official NetFabric marketplace for AI plugins — a curated vault of intelligence modules you can install, combine, and run across your agents, workflows, and automation systems.

---

## ✨ What’s Inside

Intelliforge provides a growing ecosystem of AI‑ready plugins, including:

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
Register Intelliforge as a marketplace in [APM](https://microsoft.github.io/apm/):

```bash
apm marketplace add netfabric/intelliforge
```

### 2. Explore the Catalog  
Browse the `plugins` folder to discover modules that extend your agents,
workflows, or automation pipelines.  

### 3. Install Plugins via APM  
Each plugin ships with an APM manifest for deterministic installation and
dependency management:

```bash
apm install <plugin-name>@intelliforge
```

---

## 🧩 Plugin Structure

Every Intelliforge module adheres to a consistent layout, enabling:

- predictable installation  
- clean dependency graphs  
- seamless composition across agents and workflows  

This consistency ensures that plugins remain interoperable and easy to automate.

---

## 🛠 Contributing

Contributions are welcome — new skills, agents, hooks, MCP servers, and tools
help expand the ecosystem. Follow the existing structure to ensure compatibility
with APM and the broader Intelliforge marketplace.
