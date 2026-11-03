#!/usr/bin/env node
// Rewrites e2e/shard-timings.json from a finished CI run's e2e logs, as seconds of test
// time per spec file (retries included, since they cost the shard the same time).
//   node scripts/e2e-shard-timings.mjs <run id>
// Pick a green run on main where every e2e shard ran. Needs the gh CLI.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** Sums Playwright list-reporter durations per spec file from e2e-windows job logs. */
export function parseShardTimings(log) {
  const pattern =
    /^e2e-windows \(\d+\).*\s(?:ok|x|✘)\s+\d+\s+e2e[/\\]([\w.-]+\.spec\.ts):\d+:\d+ .*\((\d+(?:\.\d+)?)(ms|s|m)\)\s*$/;
  const seconds = {};
  for (const line of log.split(/\r?\n/)) {
    const match = pattern.exec(line);
    if (!match) continue;
    const scale = match[3] === "m" ? 60 : match[3] === "ms" ? 0.001 : 1;
    seconds[match[1]] = (seconds[match[1]] ?? 0) + Number(match[2]) * scale;
  }
  return Object.fromEntries(
    Object.entries(seconds)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([file, value]) => [file, Math.max(1, Math.round(value))]),
  );
}

function main() {
  const runId = process.argv[2];
  if (!/^\d+$/.test(runId ?? "")) {
    console.error("usage: node scripts/e2e-shard-timings.mjs <ci run id>");
    process.exit(2);
  }
  const log = execFileSync("gh", ["run", "view", runId, "-R", "aurablacklight/WFHelper", "--log"], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  const timings = parseShardTimings(log);
  const count = Object.keys(timings).length;
  if (count === 0) throw new Error(`run ${runId} has no e2e-windows test lines`);
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  fs.writeFileSync(
    path.join(root, "e2e", "shard-timings.json"),
    `${JSON.stringify(timings, null, 2)}\n`,
  );
  console.log(`wrote timings for ${count} spec files from run ${runId}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
