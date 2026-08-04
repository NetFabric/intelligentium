#!/usr/bin/env node
// Creates a GitHub Release per plugin package for any apm.yml version bump
// that hasn't been tagged yet. Release notes list the commits under that
// plugin's own path (plugins/<name>) since its previous release tag.
// Tags follow each package's tag_pattern (e.g. "math-foundations-v0.2.0").
// Requires: git history (fetch-depth: 0) and an authenticated `gh` CLI.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function git(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function gh(args) {
  return execFileSync("gh", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function tagExists(tag) {
  try {
    git(["rev-parse", "-q", "--verify", `refs/tags/${tag}`]);
    return true;
  } catch {
    return false;
  }
}

// Highest existing release tag for this package (semver-sorted), or null if none yet.
function previousTag(tagPattern) {
  const glob = tagPattern.replace("{version}", "*");
  const raw = git(["tag", "-l", glob, "--sort=-v:refname"]);
  const tags = raw.split("\n").filter(Boolean);
  return tags[0] ?? null;
}

function commitLog(range, pathspec) {
  const args = ["log", "--no-merges", "--pretty=format:- %s (%h)"];
  if (range) args.push(range);
  args.push("--", pathspec);
  try {
    return git(args);
  } catch {
    return "";
  }
}

function main() {
  const apmYml = yaml.load(readFileSync(join(repoRoot, "apm.yml"), "utf8"));
  const packages = apmYml.marketplace?.packages ?? [];
  const defaultTagPattern = apmYml.marketplace?.build?.tagPattern ?? "v{version}";
  if (packages.length === 0) {
    throw new Error("No marketplace.packages found in apm.yml");
  }

  for (const pkg of packages) {
    const tagPattern = pkg.tag_pattern ?? defaultTagPattern;
    const tag = tagPattern.replace("{version}", pkg.version);

    if (tagExists(tag)) {
      console.log(`skip ${tag}: already released`);
      continue;
    }

    const pathspec = pkg.source.replace(/^\.\//, "");
    const prevTag = previousTag(tagPattern);
    const range = prevTag ? `${prevTag}..HEAD` : "";
    const commits = commitLog(range, pathspec);

    if (!commits) {
      console.log(`skip ${tag}: no commits under ${pathspec} since ${prevTag ?? "the initial commit"}`);
      continue;
    }

    const notesHeader = prevTag
      ? `Commits for \`${pathspec}\` since [${prevTag}](../../releases/tag/${prevTag}):`
      : `Commits for \`${pathspec}\`:`;
    const notes = `${notesHeader}\n\n${commits}\n`;

    git(["tag", "-a", tag, "-m", `${pkg.name} v${pkg.version}`]);
    git(["push", "origin", tag]);
    gh(["release", "create", tag, "--title", `${pkg.name} v${pkg.version}`, "--notes", notes]);
    console.log(`released ${tag}`);
  }
}

main();
