// Drive the real installed WFHelper Beta through a live friends-beta update, launched
// the way a taskbar pin launches it. Unlike test-beta-update.mjs this uses the
// installed app, its real profile and the public feed, so it updates this machine.
//
//   node scripts/test-installed-update.mjs 0.1.0-beta.4 0.1.0-beta.5
//
// Close Warframe first: the app reads the game session when it is running.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import asar from "@electron/asar";
import { _electron as electron } from "@playwright/test";

const [fromVersion, toVersion] = process.argv.slice(2);
if (!fromVersion || !toVersion) {
  throw new Error("usage: node scripts/test-installed-update.mjs <installed> <published>");
}
const outDir = path.resolve(".tmp", "installed-update-test");
const pin = path.join(
  process.env.APPDATA,
  "Microsoft/Internet Explorer/Quick Launch/User Pinned/TaskBar/WFHelper Beta.lnk",
);
const installDir = path.join(process.env.LOCALAPPDATA, "Programs", "WFHelper Beta");
const installedExe = path.join(installDir, "WFHelper Beta.exe");
// Tools that run inside Electron export this; the beta would then start as plain Node.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

fs.mkdirSync(outDir, { recursive: true });
const log = [];
function note(line) {
  const stamped = `${new Date().toISOString()} ${line}`;
  log.push(stamped);
  console.log(stamped);
}
function ps(command) {
  return execFileSync("powershell.exe", ["-NoProfile", "-Command", command], {
    encoding: "utf8",
    windowsHide: true,
    env,
  }).trim();
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check, timeout = 180_000) {
  const end = Date.now() + timeout;
  while (!(await check())) {
    if (Date.now() > end) throw new Error("timed out");
    await wait(1000);
  }
}
const launchTarget = () =>
  fs.existsSync(pin)
    ? ps(`(New-Object -ComObject WScript.Shell).CreateShortcut('${pin}').TargetPath`)
    : installedExe;
function installedVersion() {
  asar.uncacheAll();
  const packageJson = asar.extractFile(
    path.join(installDir, "resources", "app.asar"),
    "package.json",
  );
  return JSON.parse(packageJson.toString()).version;
}
function betaProcesses() {
  return ps(
    "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'WFHelper Beta.exe' -and $_.CommandLine -notmatch '--type=' } | ForEach-Object { \"$($_.ProcessId)|$($_.ExecutablePath)\" }",
  )
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({ pid: line.split("|")[0], path: line.split("|")[1] }));
}
function stopBeta() {
  for (const proc of betaProcesses())
    execFileSync("taskkill", ["/PID", proc.pid, "/T", "/F"], { windowsHide: true });
}
async function launch() {
  const app = await electron.launch({ executablePath: launchTarget(), env, timeout: 90_000 });
  let page;
  await until(() => {
    page = app.windows().find((window) => window.url().includes("renderer/dist/index.html"));
    return Boolean(page);
  }, 90_000);
  await page.locator("[data-app-version]").waitFor({ timeout: 90_000 });
  return { app, page };
}

let app;
try {
  if (ps("Get-Process Warframe.x64 -ErrorAction SilentlyContinue")) {
    throw new Error("Warframe is running; close it first.");
  }
  note(`launch target: ${launchTarget()}`);
  if (path.resolve(launchTarget()).toLowerCase() !== installedExe.toLowerCase()) {
    throw new Error(`the taskbar pin does not open the installed app (${installedExe})`);
  }
  note(`installed package before: ${installedVersion()}`);
  stopBeta();
  await wait(2000);

  let page;
  ({ app, page } = await launch());
  const shown = await page.locator("[data-app-version]").innerText();
  note(`app shows ${shown}`);
  if (shown !== `v${fromVersion}`) throw new Error(`expected v${fromVersion}`);

  // Like a user who waits a moment: the startup check opens the dialog on its own.
  await wait(12_000);
  const dialog = page.locator('[role="dialog"][aria-label^="What"]');
  const opened = await dialog.isVisible();
  note(`update dialog opened by the startup check: ${opened}`);
  if (!opened) await page.locator(".update-pill").click();
  const download = page.getByRole("button", { name: `Download ${toVersion}`, exact: true });
  await download.waitFor({ timeout: 60_000 });
  note(`release notes: ${JSON.stringify(await page.locator(".update-notes").innerText())}`);
  await page.screenshot({ path: path.join(outDir, "1-update-available.png") });

  await download.click();
  const restart = page.getByRole("button", { name: "Restart & install", exact: true });
  await restart.waitFor({ timeout: 300_000 });
  await page.screenshot({ path: path.join(outDir, "2-downloaded.png") });
  await restart.click();
  app = null;

  await until(() => {
    try {
      return installedVersion() === toVersion;
    } catch {
      return false;
    }
  }, 300_000);
  note(`installed package after: ${installedVersion()}`);
  let relaunched = [];
  await until(() => (relaunched = betaProcesses()).length > 0, 120_000);
  note(`installer relaunched: ${relaunched.map((proc) => proc.path).join(", ")}`);
  note(`launch target after update: ${launchTarget()}`);
  await wait(4000);
  stopBeta();
  await wait(2000);

  if (fs.existsSync(pin)) {
    ps(`Start-Process -FilePath '${pin}'`);
    let viaPin = [];
    await until(() => (viaPin = betaProcesses()).length > 0, 60_000);
    note(`opening the pinned shortcut started: ${viaPin.map((proc) => proc.path).join(", ")}`);
    await wait(8000);
    stopBeta();
    await wait(2000);
  }

  ({ app, page } = await launch());
  const after = await page.locator("[data-app-version]").innerText();
  note(`relaunched app shows ${after}`);
  await page.locator(".update-pill").click();
  await until(
    async () => (await page.getByText("Up To Date", { exact: true }).count()) > 0,
    30_000,
  );
  await page.screenshot({ path: path.join(outDir, "3-updated.png") });
  if (after !== `v${toVersion}`) throw new Error(`expected v${toVersion} after the update`);
  note(
    `PASS: ${fromVersion} -> ${toVersion}; the pinned app opens the update and reports Up To Date`,
  );
} catch (error) {
  note(`FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (app) await app.close().catch(() => undefined);
  fs.writeFileSync(path.join(outDir, "log.txt"), `${log.join("\n")}\n`);
}
