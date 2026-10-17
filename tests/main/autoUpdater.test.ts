import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

type MockUpdater = EventEmitter & {
  checkForUpdates: Mock;
  downloadUpdate: Mock;
  quitAndInstall: Mock;
};

const h = vi.hoisted(() => ({
  updater: null as unknown as MockUpdater,
}));

vi.mock("electron", () => ({ app: { isPackaged: true } }));
vi.mock("electron-updater", async () => {
  const { EventEmitter: Emitter } = await import("node:events");
  h.updater = Object.assign(new Emitter(), {
    checkForUpdates: vi.fn(async () => undefined),
    downloadUpdate: vi.fn(async () => undefined),
    quitAndInstall: vi.fn(),
  });
  return { autoUpdater: h.updater };
});
vi.mock("electron-log/main", () => ({ default: {} }));
vi.mock("../../services/logger", () => ({
  withScope: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock("../../services/appLifecycle", () => ({ markQuitting: vi.fn() }));
vi.mock("../../config/runtime/distribution", () => ({ FRIENDS_BETA: true }));

type Updater = typeof import("../../services/autoUpdater");

const realExecPath = process.execPath;
const realResourcesPath = process.resourcesPath;
const realPlatform = process.platform;
let appDir: string;

function placeApp(installed: boolean): void {
  appDir = fs.mkdtempSync(path.join(os.tmpdir(), "wfh-updater-"));
  const resources = path.join(appDir, "resources");
  fs.mkdirSync(resources);
  fs.writeFileSync(
    path.join(resources, "app-update.yml"),
    "provider: generic\nurl: https://example.invalid/\n",
  );
  if (installed) fs.writeFileSync(path.join(appDir, "Uninstall WFHelper Beta.exe"), "");
  Object.defineProperty(process, "execPath", {
    value: path.join(appDir, "WFHelper Beta.exe"),
    configurable: true,
  });
  Object.defineProperty(process, "resourcesPath", { value: resources, configurable: true });
}

async function start(installed = true): Promise<Updater> {
  placeApp(installed);
  vi.resetModules();
  const updater = await import("../../services/autoUpdater");
  updater.initialize(null as never);
  return updater;
}

const info = { version: "0.1.0-beta.5" };

describe("auto-updater", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(process, "execPath", { value: realExecPath, configurable: true });
    Object.defineProperty(process, "platform", { value: realPlatform, configurable: true });
    Object.defineProperty(process, "resourcesPath", {
      value: realResourcesPath,
      configurable: true,
    });
    fs.rmSync(appDir, { recursive: true, force: true });
  });

  it("keeps a finished download ready when a background check reports the same version", async () => {
    const updater = await start();
    h.updater.emit("update-available", info);
    h.updater.downloadUpdate.mockImplementationOnce(async () => {
      h.updater.emit("update-downloaded", info);
    });
    await updater.downloadUpdate();
    expect(updater.getUpdateState().status).toBe("downloaded");

    // The startup check lands after the download finished.
    h.updater.emit("checking-for-update");
    h.updater.emit("update-available", info);

    expect(updater.getUpdateState().status).toBe("downloaded");
  });

  it("skips automatic checks while an update is downloaded", async () => {
    const updater = await start();
    h.updater.emit("update-available", info);
    h.updater.emit("update-downloaded", info);
    const checks = h.updater.checkForUpdates;
    checks.mockClear();

    await updater.checkForUpdates("startup");

    expect(checks).not.toHaveBeenCalled();
    expect(updater.getUpdateState().status).toBe("downloaded");
  });

  it("does not offer updates from a copy that was never installed", async () => {
    // The uninstaller check is NSIS-specific, so it only runs on Windows.
    Object.defineProperty(process, "platform", { value: "win32", configurable: true });
    const updater = await start(false);

    expect(updater.getUpdateState().status).toBe("disabled");
    expect(updater.getUpdateState().message).toMatch(/installed/i);
    await updater.checkForUpdates("startup");
    expect(h.updater.checkForUpdates).not.toHaveBeenCalled();
  });
});
