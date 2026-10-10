import fs from "node:fs";
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const zero = /^0+$/;
const explicitBase = process.argv.find((arg) => arg.startsWith("--base="))?.slice(7);
const refs = explicitBase
  ? [["HEAD", git("rev-parse", "HEAD"), "base", git("rev-parse", explicitBase)]]
  : fs
      .readFileSync(0, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => line.trim().split(/\s+/));
const changed = new Set();
for (const [, localSha, , remoteSha] of refs) {
  if (!localSha || zero.test(localSha)) continue;
  let base = remoteSha;
  if (!base || zero.test(base)) {
    try {
      base = git("merge-base", localSha, "refs/remotes/origin/HEAD");
    } catch {
      base = execFileSync("git", ["hash-object", "-t", "tree", "--stdin"], {
        input: "",
        encoding: "utf8",
      }).trim();
    }
  }
  for (const file of git("diff", "--name-only", "-z", base, localSha).split("\0").filter(Boolean))
    changed.add(file);
}
const files = [...changed].filter((file) => fs.existsSync(file));
const e2e = new Set(files.filter((file) => /^e2e\/.*\.spec\.ts$/.test(file)));
if (
  [...changed].some((file) =>
    /^(src|services|ipc|config|renderer)\/|^main\.ts$|^preload/.test(file),
  )
)
  e2e.add("e2e/smoke.spec.ts");
if ([...changed].some((file) => /Sidebar\.svelte$|src\/config\/links\.ts$/.test(file)))
  e2e.add("e2e/feedback.spec.ts");
if ([...changed].some((file) => /buildAdvisor|BuildsView|BuildModPreview/.test(file)))
  e2e.add("e2e/builds.spec.ts");
if (
  [...changed].some((file) =>
    /^e2e\/(electronTestHarness|electronArtifacts|mainWindow)\.ts$/.test(file),
  )
) {
  e2e.add("e2e/harness-diagnostics.spec.ts");
  e2e.add("e2e/smoke.spec.ts");
}
console.log(
  `Local push checks: ${changed.size} changed files; focused UI specs: ${[...e2e].join(", ") || "none"}. Full suite runs in CI.`,
);
if (process.argv.includes("--list") || changed.size === 0) process.exit(0);
function run(script, args = []) {
  console.log(`Checking: ${script} ${args.join(" ")}`);
  try {
    execFileSync(process.execPath, [script, ...args], { stdio: "inherit" });
  } catch (error) {
    process.exit(error.status || 1);
  }
}
const formatted = files.filter((file) =>
  /\.(ts|svelte|css|json|mjs|cjs|js|md|yml|yaml)$/.test(file),
);
if (formatted.length)
  run("node_modules/prettier/bin/prettier.cjs", ["--check", "--ignore-unknown", ...formatted]);
const linted = files.filter(
  (file) =>
    /\.(ts|svelte|js)$/.test(file) &&
    /^(src|tests|e2e|config|ipc|services|renderer|backend\/worker\/(src|test))\/|^(main|preload[^/]*|playwright\.config)\.ts$/.test(
      file,
    ),
);
if (linted.length) run("node_modules/eslint/bin/eslint.js", linted);
if (![...changed].some((file) => /\.(ts|svelte|js|mjs|cjs|json)$/.test(file))) process.exit(0);
for (const config of [
  "tsconfig.json",
  "tsconfig.main.json",
  "tsconfig.tests.json",
  "tsconfig.e2e.json",
])
  run("node_modules/typescript/bin/tsc", ["-p", config, "--noEmit"]);
run("node_modules/svelte-check/bin/svelte-check", ["--tsconfig", "tsconfig.json"]);
run("node_modules/vitest/vitest.mjs", ["run"]);
if (process.platform === "win32" && e2e.size) {
  run("node_modules/typescript/bin/tsc", ["-p", "tsconfig.main.json"]);
  run("scripts/bundle-preloads.js");
  run("node_modules/vite/bin/vite.js", ["build"]);
  run("scripts/hidden-desktop.mjs", [
    process.execPath,
    "node_modules/@playwright/test/cli.js",
    "test",
    "--config",
    "playwright.config.ts",
    ...e2e,
  ]);
}
console.log("Local push checks passed; full platform and UI coverage remains in CI.");
