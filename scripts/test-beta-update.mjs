import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { _electron as electron } from "@playwright/test";
import { closeNativeElectron } from "./native-electron.cjs";

const require = createRequire(import.meta.url);
const asar = require("@electron/asar");
const root = path.resolve(".tmp", "beta-update-test");
const installDir = path.join(root, "installed");
// NSIS restarts through Windows, which does not retain a test launcher's
// environment overrides. Use the local distribution's real, separate profile.
const profile = path.join(process.env.APPDATA, "WFHelper Beta Local");
const executable = path.join(installDir, "WFHelper Beta Local.exe");
const builds = path.resolve("release", "beta-local");
const fromVersion = process.argv[2] || "0.1.0-beta.1";
const toVersion = process.argv[3] || "0.1.0-beta.2";
for (const version of [fromVersion, toVersion]) assert.match(version, /^\d+\.\d+\.\d+-beta\.\d+$/);
const first = path.join(builds, fromVersion, `WFHelper-Beta-Local-${fromVersion}-Setup.exe`);
const feed = path.join(builds, toVersion);
assert.ok(
  fs.existsSync(first) && fs.existsSync(path.join(feed, "beta.yml")),
  "Build both local betas first.",
);
fs.mkdirSync(profile, { recursive: true });
const inventoryFile = path.join(profile, "inventory.json");
const inventoryBefore = fs.existsSync(inventoryFile) ? fs.readFileSync(inventoryFile) : null;
const env = {
  ...process.env,
  WFHELPER_DISABLE_KEYBOARD_HOOK: "1",
  WFHELPER_DISABLE_DBWIN: "1",
  WFHELPER_EE_LOG: path.join(root, "EE.log"),
};
delete env.WF_DISABLE_AUTO_UPDATE;
delete env.WFHELPER_USER_DATA;
delete env.ELECTRON_RUN_AS_NODE;
const requests = [];
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname.slice(1));
  if (!name || path.basename(name) !== name || !/\.(yml|exe|blockmap)$/.test(name)) {
    res.writeHead(404).end();
    return;
  }
  const file = path.join(feed, name);
  if (!fs.existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  const size = fs.statSync(file).size;
  const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || "");
  const start = range ? Number(range[1]) : 0;
  const end = range && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (start > end || start >= size) {
    res.writeHead(416).end();
    return;
  }
  requests.push({ name, range: req.headers.range || null });
  res.writeHead(range ? 206 : 200, {
    "Content-Length": end - start + 1,
    "Content-Type": name.endsWith("yml") ? "text/yaml" : "application/octet-stream",
    "Cache-Control": "no-store",
    ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(file, { start, end }).pipe(res);
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(18765, "127.0.0.1", resolve);
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(fn, timeout = 120_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await wait(1000);
  }
  throw new Error("Timed out waiting for beta update.");
}
async function launch() {
  return electron.launch({
    executablePath: executable,
    env,
    args: ["--no-sandbox"],
    timeout: 60_000,
  });
}
async function pageFor(app) {
  let page;
  await until(() => {
    page = app.windows().find((p) => p.url().includes("renderer/dist/index.html"));
    return !!page;
  }, 60_000);
  return page;
}
let app;
try {
  if (!process.argv.includes("--installed")) {
    console.log(`Installing ${fromVersion} into the isolated local-test directory.`);
    await new Promise((resolve, reject) => {
      const installer = spawn(first, ["/S", "/currentuser", `/D=${installDir}`], {
        env,
        windowsHide: true,
      });
      installer.on("error", reject);
      installer.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`Installer exited ${code}`)),
      );
    });
  }
  app = await launch();
  let page = await pageFor(app);
  await page.evaluate(() => {
    localStorage.setItem("setup-completed-v2", "1");
    localStorage.setItem("beta-update-test-marker", "keep-this-through-update");
  });
  await page.reload();
  assert.equal(await page.locator("[data-app-version]").innerText(), `v${fromVersion}`);
  console.log("Clicking Check updates against the localhost feed.");
  await page.locator(".update-pill").click();
  const download = page.getByRole("button", { name: `Download ${toVersion}`, exact: true });
  await download.waitFor({ state: "visible", timeout: 60_000 });
  await page.screenshot({ path: path.join(root, "update-available.png") });
  await download.click();
  const restart = page.getByRole("button", { name: "Restart & install", exact: true });
  await restart.waitFor({ state: "visible", timeout: 120_000 });
  await page.screenshot({ path: path.join(root, "update-downloaded.png") });
  console.log(`Downloaded ${toVersion}; clicking Restart & install.`);
  await restart.click();
  app = null;
  await until(() => {
    try {
      asar.uncacheAll();
      return (
        JSON.parse(asar.extractFile(path.join(installDir, "resources", "app.asar"), "package.json"))
          .version === toVersion
      );
    } catch {
      return false;
    }
  });
  console.log(`Installed package is ${toVersion}; verifying the restarted app.`);
  // NSIS starts a normal app without Playwright's inspector. Confirm that restart,
  // then stop only this test installation and reopen it for UI assertions.
  const findRestart =
    "$p = Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $env:LOCAL_BETA_EXE -and $_.CommandLine -notmatch '--type=' }; $p | Select-Object -ExpandProperty ProcessId";
  let restarted;
  await until(() => {
    restarted = execFileSync("powershell.exe", ["-NoProfile", "-Command", findRestart], {
      encoding: "utf8",
      windowsHide: true,
      env: { ...env, LOCAL_BETA_EXE: executable },
    }).trim();
    return /^\d+$/.test(restarted);
  });
  await wait(3000);
  execFileSync("taskkill", ["/PID", restarted, "/T", "/F"], { windowsHide: true });
  app = await launch();
  page = await pageFor(app);
  assert.equal(await page.locator("[data-app-version]").innerText(), `v${toVersion}`);
  assert.equal(await page.evaluate(() => localStorage.getItem("setup-completed-v2")), "1");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("beta-update-test-marker")),
    "keep-this-through-update",
  );
  if (process.argv.includes("--check-fork-sidebar")) {
    assert.equal(await page.locator("#sidebar [data-community-link]").count(), 0);
    await app.evaluate(({ shell }) => {
      globalThis.feedbackUrls = [];
      shell.openExternal = async (url) => {
        globalThis.feedbackUrls.push(url);
      };
    });
    await page.locator("#sidebar [data-feedback-open]").click();
    await until(async () => (await app.evaluate(() => globalThis.feedbackUrls)).length > 0);
    assert.deepEqual(await app.evaluate(() => globalThis.feedbackUrls), [
      "https://github.com/aurablacklight/WFHelper/issues/new/choose",
    ]);
    console.log("PASS: updated sidebar removes community buttons and Feedback opens the fork.");
  }
  await page.locator(".update-pill").click();
  await until(
    async () => (await page.getByText("Up To Date", { exact: true }).count()) > 0,
    15_000,
  );
  if (inventoryBefore) assert.deepEqual(fs.readFileSync(inventoryFile), inventoryBefore);
  await page.screenshot({ path: path.join(root, `updated-${toVersion}.png`) });
  console.log(
    `PASS: ${fromVersion} -> ${toVersion} installed and restarted; visible version and saved profile survived.`,
  );
} finally {
  if (app) await closeNativeElectron(app);
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  fs.writeFileSync(path.join(root, "requests.json"), JSON.stringify(requests, null, 2));
}
