#!/usr/bin/env node
// Runs one CI shard of the built e2e suite, with spec files split by measured duration.
// Playwright's own --shard cuts the alphabetical file list into equal test counts, which
// put most of the slow market, overlay and layout specs in one shard.
//   node scripts/e2e-shard.mjs --shard=2/3 [extra playwright args]
// Refresh e2e/shard-timings.json with: node scripts/e2e-shard-timings.mjs <ci run id>
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** Longest file first onto the lightest shard. Ties break by name so every shard
 *  computes the same split. Files without a timing count as the median. */
export function assignShards(files, timings, total) {
  const known = files.map((file) => timings[file]).filter((value) => Number.isFinite(value));
  const sorted = [...known].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 1;
  const weight = (file) => (Number.isFinite(timings[file]) ? timings[file] : median);
  const shards = Array.from({ length: total }, () => ({ files: [], seconds: 0 }));
  const order = [...files].sort((a, b) => weight(b) - weight(a) || a.localeCompare(b));
  for (const file of order) {
    const lightest = shards.reduce((best, shard) => (shard.seconds < best.seconds ? shard : best));
    lightest.files.push(file);
    lightest.seconds += weight(file);
  }
  for (const shard of shards) shard.files.sort();
  return shards;
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const [flag, ...rest] = process.argv.slice(2);
  const match = /^--shard=(\d+)\/(\d+)$/.exec(flag ?? "");
  const current = match ? Number(match[1]) : 0;
  const total = match ? Number(match[2]) : 0;
  if (!match || current < 1 || current > total) {
    console.error("usage: node scripts/e2e-shard.mjs --shard=<current>/<total> [playwright args]");
    process.exit(2);
  }
  const e2eDir = path.join(root, "e2e");
  const files = fs.readdirSync(e2eDir).filter((name) => name.endsWith(".spec.ts"));
  const timings = JSON.parse(fs.readFileSync(path.join(e2eDir, "shard-timings.json"), "utf8"));
  const shards = assignShards(files, timings, total);
  shards.forEach((shard, index) =>
    console.log(
      `shard ${index + 1}/${total}: ${shard.files.length} files, ~${Math.round(shard.seconds)}s of tests`,
    ),
  );
  const mine = shards[current - 1].files;
  console.log(`running shard ${current}: ${mine.join(", ")}`);
  if (mine.length === 0) return;
  // playwright.config.ts narrows testMatch to this list. Passing file filters on the
  // command line instead would be regexes, where one name can match another.
  const child = spawn(
    process.execPath,
    [
      "scripts/hidden-desktop.mjs",
      process.execPath,
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config",
      "playwright.config.ts",
      ...rest,
    ],
    { cwd: root, stdio: "inherit", env: { ...process.env, WFH_E2E_FILES: mine.join(",") } },
  );
  child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
