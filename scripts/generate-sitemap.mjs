#!/usr/bin/env node
// Generates sitemap.xml by scanning the repo root for publishable *.html pages.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = readFileSync(join(repoRoot, "CNAME"), "utf8").trim();

function lastModified(relPath) {
  const iso = execSync(`git log -1 --format=%cI -- "${relPath}"`, { cwd: repoRoot })
    .toString()
    .trim();
  return iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

const pages = readdirSync(repoRoot)
  .filter((name) => name.endsWith(".html"))
  .sort();

const urls = pages
  .map((page) => {
    const loc = page === "index.html" ? `https://${SITE_URL}/` : `https://${SITE_URL}/${page}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastModified(page)}</lastmod>\n  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(join(repoRoot, "sitemap.xml"), xml);
console.log(`Wrote sitemap.xml with ${pages.length} page(s).`);
