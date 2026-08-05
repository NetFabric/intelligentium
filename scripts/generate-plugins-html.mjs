#!/usr/bin/env node
// Regenerates the plugin listing in index.html (JSON-LD ItemList, plugin count,
// and static plugin cards) from the apm.yml marketplace.packages block.
// Only the content between GENERATED:* markers is replaced.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import yaml from "js-yaml";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_OWNER = "NetFabric";
const REPO_NAME = "intelligentium";
const REPO_BRANCH = "main";

const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
  "Eight", "Nine", "Ten", "Eleven", "Twelve",
];

function numberWord(n) {
  return NUMBER_WORDS[n] ?? String(n);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function repoUrl(source) {
  const relPath = source.replace(/^\.\//, "");
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${REPO_BRANCH}/${relPath}`;
}

function gitLogDate(...revArgs) {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%aI", ...revArgs], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    return iso || null;
  } catch {
    return null;
  }
}

// Real release date: the tag created by plugin-releases.yml for this version,
// falling back to the last commit under the package's own source path.
function releaseDate(pkg) {
  const tag = pkg.tag_pattern?.replace("{version}", pkg.version);
  return (tag && gitLogDate(tag)) ?? gitLogDate("--", pkg.source) ?? null;
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function jsonField(key, value) {
  return `"${key}": ${JSON.stringify(value)}`;
}

function buildJsonLd(packages) {
  return packages
    .map((pkg, i) => {
      const fields = [
        jsonField("@type", "SoftwareSourceCode"),
        jsonField("position", i + 1),
        jsonField("name", pkg.name),
        jsonField("description", pkg.description),
        jsonField("keywords", pkg.tags.join(", ")),
        jsonField("codeRepository", repoUrl(pkg.source)),
      ];
      return `        { ${fields.join(", ")} }`;
    })
    .join(",\n");
}

function buildCards(packages) {
  return packages
    .map((pkg) => {
      const tags = pkg.tags
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("");
      const iso = releaseDate(pkg);
      const label = formatDate(iso);
      const dateLine = label
        ? `\n      <p class="plugin-date">Released ${escapeHtml(label)}</p>`
        : "";
      return [
        `    <a class="plugin" data-plugin data-name="${escapeHtml(pkg.name)}" data-tags="${escapeHtml(pkg.tags.join(","))}" data-date="${escapeHtml(iso ?? "")}" href="${repoUrl(pkg.source)}" target="_blank" rel="noopener">`,
        `      <h3><code>${escapeHtml(pkg.name)}</code><span class="plugin-version">v${escapeHtml(pkg.version)}</span></h3>${dateLine}`,
        `      <p>${escapeHtml(pkg.description)}</p>`,
        `      <div class="tags">`,
        `        ${tags}`,
        `      </div>`,
        `    </a>`,
      ].join("\n");
    })
    .join("\n");
}

function replaceBetweenMarkers(html, marker, replacement, { inline = false } = {}) {
  const sep = inline ? "" : "\\n";
  const re = new RegExp(
    `(<!-- GENERATED:${marker}:BEGIN[^>]*-->${sep})[\\s\\S]*?(${sep}[ \\t]*<!-- GENERATED:${marker}:END -->)`,
  );
  if (!re.test(html)) {
    throw new Error(`Markers for "${marker}" not found in index.html`);
  }
  return html.replace(re, `$1${replacement}$2`);
}

function main() {
  const apmYml = yaml.load(readFileSync(join(repoRoot, "apm.yml"), "utf8"));
  const packages = apmYml.marketplace?.packages ?? [];
  if (packages.length === 0) {
    throw new Error("No marketplace.packages found in apm.yml");
  }

  const indexPath = join(repoRoot, "index.html");
  let html = readFileSync(indexPath, "utf8");

  html = replaceBetweenMarkers(html, "plugin-jsonld", buildJsonLd(packages));
  html = replaceBetweenMarkers(
    html,
    "plugin-count",
    `${numberWord(packages.length)} plugins`,
    { inline: true },
  );
  html = replaceBetweenMarkers(html, "plugin-cards", buildCards(packages));

  writeFileSync(indexPath, html);
  console.log(`Updated index.html with ${packages.length} plugin(s).`);
}

main();
