const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { build, Platform, Arch } = require("electron-builder");

const version = process.argv[2];
const local = process.argv[3] === "--local";
if (process.argv.length > (local ? 4 : 3))
  throw new Error("Only --local is supported after the version.");
const productName = local ? "WFHelper Beta Local" : "WFHelper Beta";
const output = `release/${local ? "beta-local" : "beta"}/${version}`;
if (!/^\d+\.\d+\.\d+-beta\.[1-9]\d*$/.test(version || "")) {
  throw new Error("usage: pnpm run dist:beta 0.1.0-beta.1");
}
if (process.platform !== "win32") throw new Error("This beta packager targets Windows x64.");
const root = path.resolve(__dirname, "..");
process.chdir(root);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const env = { ...process.env, npm_package_version: version };
function run(script, args = []) {
  execFileSync(process.execPath, [script, ...args], { stdio: "inherit", env });
}
async function main() {
  run("scripts/verify-onnx-models.mjs");
  run("node_modules/typescript/bin/tsc", ["-p", "tsconfig.main.json"]);
  run("scripts/bundle-preloads.js");
  run("node_modules/vite/bin/vite.js", ["build"]);
  const config = {
    ...pkg.build,
    appId: local ? "com.aurablacklight.wfhelper.beta.local" : "com.aurablacklight.wfhelper.beta",
    productName,
    directories: { output },
    extraMetadata: {
      name: local ? "wfhelper-beta-local" : "wfhelper-beta",
      version,
      productName,
      wfhelperDistribution: "friends-beta",
      wfhelperLocalUpdateTest: local,
    },
    nsis: {
      ...pkg.build.nsis,
      include: "build/beta-installer.nsh",
      artifactName: local
        ? "WFHelper-Beta-Local-${version}-Setup.${ext}"
        : "WFHelper-Beta-${version}-Setup.${ext}",
      uninstallDisplayName: productName,
      shortcutName: productName,
      runAfterFinish: !local,
    },
    publish: [
      {
        provider: "generic",
        url: local
          ? "http://127.0.0.1:18765/"
          : "https://github.com/aurablacklight/WFHelper/releases/download/friends-beta/",
        channel: "beta",
      },
    ],
    generateUpdatesFilesForAllChannels: false,
  };
  // An explicit file avoids electron-builder merging this feed into the
  // production publish entry from package.json.
  const configPath = path.join(root, ".tmp", "beta-builder.json");
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  await build({
    targets: Platform.WINDOWS.createTarget(["nsis"], Arch.x64),
    publish: "never",
    config: configPath,
  });
  console.log(`Beta ${version} built in ${output}. Nothing was uploaded.`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
