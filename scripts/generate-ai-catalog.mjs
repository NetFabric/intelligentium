#!/usr/bin/env node
// Generates .well-known/ai-catalog.json (ARD v0.9) from the apm.yml marketplace block.
// One catalog entry per plugin package; multi-skill plugins nest a sub-catalog of their skills.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_OWNER = "NetFabric";
const REPO_NAME = "intelliforge";
const REPO_BRANCH = "main";
const HOST_DOMAIN = "github.com";

function rawUrl(relPath) {
  return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${relPath}`;
}

// Splits a "USE FOR: a; b; c. DO NOT USE FOR: ..." style description into short query phrases.
// Splits only on ";" (not ".") since items can contain abbreviations like "vs." or "e.g.".
function representativeQueries(description, max = 4) {
  const useForMatch = description.match(/USE FOR:\s*(.*?)(?:\s*DO NOT USE FOR:|$)/s);
  const source = useForMatch ? useForMatch[1] : description;
  return source
    .split(";")
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .slice(0, max);
}

// SKILL.md frontmatter descriptions contain unescaped "USE FOR:" colons, which
// make them invalid plain YAML scalars — so name/description are pulled with
// targeted regexes instead of a full YAML parse of the frontmatter block.
function readSkillEntry(pluginName, skillDir, skillsRoot) {
  const skillPath = join(skillsRoot, skillDir, "SKILL.md");
  const raw = readFileSync(skillPath, "utf8");
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${skillPath}`);
  }
  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*([\s\S]*)$/m);
  if (!nameMatch || !descriptionMatch) {
    throw new Error(`Missing name/description frontmatter in ${skillPath}`);
  }
  const name = nameMatch[1].trim();
  const description = descriptionMatch[1].trim();
  const relPath = `plugins/${pluginName}/.apm/skills/${skillDir}/SKILL.md`;

  return {
    identifier: `urn:air:${HOST_DOMAIN}:${REPO_OWNER.toLowerCase()}:${pluginName}:${name}`,
    displayName: name,
    type: "application/ai-skill+md",
    url: rawUrl(relPath),
    description,
    representativeQueries: representativeQueries(description),
  };
}

function buildPluginEntry(pkg) {
  const pluginRoot = join(repoRoot, pkg.source.replace(/^\.\//, ""));
  const skillsRoot = join(pluginRoot, ".apm", "skills");
  const skillDirs = existsSync(skillsRoot)
    ? readdirSync(skillsRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];

  const base = {
    identifier: `urn:air:${HOST_DOMAIN}:${REPO_OWNER.toLowerCase()}:${pkg.name}`,
    displayName: pkg.name,
    description: pkg.description,
    tags: pkg.tags,
    version: pkg.version,
  };

  if (skillDirs.length === 0) {
    throw new Error(`Plugin "${pkg.name}" has no skills under ${skillsRoot}`);
  }

  if (skillDirs.length === 1) {
    const skillEntry = readSkillEntry(pkg.name, skillDirs[0], skillsRoot);
    return {
      ...base,
      type: "application/ai-skill+md",
      url: skillEntry.url,
      representativeQueries: skillEntry.representativeQueries,
    };
  }

  const entries = skillDirs.map((dir) => readSkillEntry(pkg.name, dir, skillsRoot));
  return {
    ...base,
    type: "application/ai-catalog+json",
    data: {
      specVersion: "1.0",
      entries,
    },
  };
}

function main() {
  const apmYml = yaml.load(readFileSync(join(repoRoot, "apm.yml"), "utf8"));
  const packages = apmYml.marketplace?.packages ?? [];
  if (packages.length === 0) {
    throw new Error("No marketplace.packages found in apm.yml");
  }

  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: "NetFabric Intelliforge",
      identifier: `did:web:${REPO_OWNER.toLowerCase()}.github.io:${REPO_NAME}`,
      documentationUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    },
    entries: packages.map(buildPluginEntry),
  };

  const outPath = join(repoRoot, ".well-known", "ai-catalog.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Wrote ${catalog.entries.length} entries to ${outPath}`);
}

main();
