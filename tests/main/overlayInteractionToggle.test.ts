import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  OVERLAY_SAVE_PLACEMENT,
  OVERLAY_SAVE_SCALE,
  OVERLAY_SET_SETTINGS,
  RIVEN_SET_SIMILAR_AUCTIONS,
  RIVEN_SIMILAR_AUCTIONS,
} from "../../config/shared/ipcChannels";

interface FakePair {
  visible: boolean;
  restoreAfterUnfocus: ReturnType<typeof vi.fn>;
  isOverlayWindowVisible: () => boolean;
  setOverlayInteractiveMode: ReturnType<typeof vi.fn>;
}

type SettingsHandler = (event: unknown, next: unknown) => Promise<unknown>;

const state = vi.hoisted(() => {
  const pair = () => {
    const controller = {
      visible: false,
      restoreAfterUnfocus: vi.fn(),
      isOverlayWindowVisible: () => controller.visible,
      setOverlayInteractiveMode: vi.fn(),
      positionOverlayWindow: vi.fn(),
      getAnchorMeta: () => null,
    };
    return controller;
  };
  return {
    hotkeys: new Map<string, () => void>(),
    reward: pair(),
    planner: pair(),
    rivenVisible: false,
    rivenHiddenByUnfocus: false,
    rivenInteractive: false,
    setRivenInteractiveMode: vi.fn(),
    captureFocus: vi.fn(),
    returnFocus: vi.fn(() => true),
    push: vi.fn(),
    rivenPanelSend: vi.fn(),
    broadcast: vi.fn(),
    rivenGuard: vi.fn(),
    handlerGuards: new Map<string, unknown>(),
    handlers: new Map<string, unknown>(),
    lifecycleHeld: null as Promise<void> | null,
  };
});

vi.mock("electron", () => ({
  app: { on: vi.fn(), getAppPath: () => "D:/app" },
  BrowserWindow: { getAllWindows: () => [], fromWebContents: () => null },
  screen: {
    getPrimaryDisplay: () => ({ id: 1, workArea: { x: 0, y: 0, width: 1000, height: 500 } }),
  },
}));
vi.mock("../../services/logger", () => ({ withScope: () => ({ info: vi.fn(), warn: vi.fn() }) }));
vi.mock("../../ipc/overlay/editorIpc", () => ({ registerOverlayEditor: vi.fn() }));
vi.mock("../../ipc/ipcSecurity", () => ({
  assertLocalizedOverlaySender: vi.fn(),
  assertMainRendererSender: vi.fn(),
  assertOverlayRendererSender: vi.fn(),
  assertRivenOverlayRendererSender: state.rivenGuard,
  handleAuthorized: (channel: string, guard: unknown, handler: unknown) => {
    state.handlerGuards.set(channel, guard);
    state.handlers.set(channel, handler);
  },
  onAuthorized: vi.fn(),
}));
vi.mock("../../ipc/overlayI18n", () => ({ overlayMessages: vi.fn() }));
vi.mock("../../ipc/hotkeyRegistry", () => ({
  disposeAppHotkeys: vi.fn(),
  overlayHotkeyBackend: {
    register: (accelerator: string, callback: () => void) => {
      state.hotkeys.set(accelerator, callback);
      return true;
    },
    unregister: (accelerator: string) => state.hotkeys.delete(accelerator),
  },
}));
vi.mock("../../ipc/overlay/windows", () => ({ moveOverlayWindowBy: vi.fn() }));
vi.mock("../../ipc/popoutIpc", () => ({ broadcastToRenderers: state.broadcast }));
vi.mock("../../ipc/overlay/zOrder", () => ({ returnFocusToWarframe: state.returnFocus }));
vi.mock("../../ipc/tradeNotificationIpc", () => ({ hideTradeNotification: vi.fn() }));
vi.mock("../../services/atomicFile", () => ({ writeFileAtomicSync: vi.fn() }));
vi.mock("../../services/userDataPath", async () => {
  const os = await import("node:os");
  const path = await import("node:path");
  const dir = path.join(os.tmpdir(), `wfh-overlay-toggle-${process.pid}`);
  return { userDataPath: (name: string) => path.join(dir, name) };
});
vi.mock("../../services/acceleratorVk", () => ({ matchesAcceleratorInput: vi.fn() }));
vi.mock("../../services/eeLogPath", () => ({ resolveWarframeUiScale: vi.fn() }));
vi.mock("../../services/warframeStatus", () => ({ captureWarframeFocus: state.captureFocus }));
vi.mock("../../services/warframeLifecycle", () => ({
  configureWarframeLifecycle: async () => {
    await state.lifecycleHeld;
  },
}));
vi.mock("../../ipc/rivenOverlayIpc", () => ({
  isAnyRivenWindowVisible: () => state.rivenVisible,
  restoreRivenAfterUnfocus: () => {
    if (!state.rivenHiddenByUnfocus) return;
    state.rivenHiddenByUnfocus = false;
    state.rivenVisible = true;
  },
  isRivenInteractiveMode: () => state.rivenInteractive,
  setRivenInteractiveMode: state.setRivenInteractiveMode,
  onRivenManualRescan: vi.fn(),
  register: vi.fn(),
}));
vi.mock("../../ipc/rewardOverlayIpc", () => ({
  rewardWindowsController: state.reward,
  plannerWindowsController: state.planner,
  pushOverlayInteractionMode: state.push,
  register: vi.fn(),
}));
vi.mock("../../ipc/arbiOverlayIpc", () => ({ register: vi.fn() }));
vi.mock("../../ipc/context", () => ({
  default: {
    overlayWindow: { isDestroyed: () => false },
    plannerOverlayWindow: { isDestroyed: () => false },
    rivenOverlayLeftWindow: { isDestroyed: () => false },
    rivenOverlayRightWindow: null,
    overlayInteractiveMode: false,
    overlaySettings: {} as Record<string, unknown>,
  },
}));

import fs from "node:fs";
import path from "node:path";

import ctx from "../../ipc/context";
import { registerOverlay } from "../../ipc/overlay/registry";
import {
  OVERLAY_SETTINGS_DEFAULTS,
  OVERLAY_SETTINGS_FILE_NAME,
} from "../../config/runtime/overlaySettings";
import { userDataPath } from "../../services/userDataPath";
import {
  loadOverlaySettings,
  register,
  setOverlayHotkeysActive,
  toggleOverlayInteractionMode,
} from "../../ipc/overlayIpc";

function writeSavedSettings(settings: Record<string, unknown>): void {
  const file = userDataPath(OVERLAY_SETTINGS_FILE_NAME);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings));
}

// One riven panel open: the registry hands it the setting overlayIpc shares.
registerOverlay("rivenLeft", {
  reposition: vi.fn(),
  placementRect: vi.fn(() => ({ x: 0, y: 0, width: 1, height: 1 })),
  send: state.rivenPanelSend,
  isInteractive: () => state.rivenInteractive,
});

const pair = [state.reward, state.planner] as FakePair[];

beforeEach(() => {
  for (const controller of pair) {
    controller.visible = false;
    controller.setOverlayInteractiveMode.mockClear();
  }
  state.rivenVisible = false;
  state.rivenHiddenByUnfocus = false;
  state.rivenInteractive = false;
  state.setRivenInteractiveMode.mockClear();
  state.captureFocus.mockClear();
  state.returnFocus.mockClear();
  ctx.overlayInteractiveMode = false;
});

describe("overlay interaction hotkey", () => {
  it("focuses the overlays it turns interactive, and only then", () => {
    state.reward.visible = true;

    toggleOverlayInteractionMode("hotkey");

    expect(ctx.overlayInteractiveMode).toBe(true);
    expect(state.captureFocus).toHaveBeenCalledOnce();
    expect(state.reward.setOverlayInteractiveMode).toHaveBeenCalledWith(true, { focus: true });
    expect(state.returnFocus).not.toHaveBeenCalled();
  });

  // setFocusable(false) hands the foreground down the z-order, so the return to
  // the game has to come after it or that hand-off undoes it.
  it("hands focus back to the game after the overlays went passive", () => {
    state.reward.visible = true;
    ctx.overlayInteractiveMode = true;

    toggleOverlayInteractionMode("hotkey");

    expect(ctx.overlayInteractiveMode).toBe(false);
    expect(state.returnFocus).toHaveBeenCalledOnce();
    expect(state.returnFocus.mock.invocationCallOrder[0]).toBeGreaterThan(
      state.reward.setOverlayInteractiveMode.mock.invocationCallOrder.at(-1)!,
    );
  });

  it("a riven-only toggle leaves the hidden reward pair passive", () => {
    state.rivenVisible = true;

    toggleOverlayInteractionMode("hotkey");

    expect(state.setRivenInteractiveMode).toHaveBeenCalledWith(true);
    expect(ctx.overlayInteractiveMode).toBe(false);
    for (const controller of pair) {
      expect(controller.setOverlayInteractiveMode).not.toHaveBeenCalled();
    }
  });

  it("brings riven panels hidden for unfocus back interactive", () => {
    state.rivenHiddenByUnfocus = true;

    toggleOverlayInteractionMode("hotkey");

    expect(state.rivenVisible).toBe(true);
    expect(state.setRivenInteractiveMode).toHaveBeenCalledWith(true);
  });

  it("does nothing while no overlay is on screen", () => {
    expect(toggleOverlayInteractionMode("hotkey")).toBeNull();

    expect(state.captureFocus).not.toHaveBeenCalled();
    expect(state.returnFocus).not.toHaveBeenCalled();
    expect(ctx.overlayInteractiveMode).toBe(false);
  });
});

describe("overlay interaction launch flag", () => {
  it("runs the same toggle as the interaction hotkey", () => {
    ctx.overlaySettings = {
      ...OVERLAY_SETTINGS_DEFAULTS,
      interactionHotkeyEnabled: true,
      interactionHotkey: "Control+Tab",
    } as unknown as typeof ctx.overlaySettings;
    state.reward.visible = true;
    setOverlayHotkeysActive(true);

    state.hotkeys.get("Control+Tab")!();

    expect(ctx.overlayInteractiveMode).toBe(true);
    setOverlayHotkeysActive(false);
  });

  it("reports the mode the overlays on screen switched to", () => {
    state.reward.visible = true;

    expect(toggleOverlayInteractionMode("launch-flag")).toBe(true);
    expect(toggleOverlayInteractionMode("launch-flag")).toBe(false);
  });
});

describe("linux interactive overlay setting", () => {
  const realPlatform = process.platform;
  let saveSettings: SettingsHandler;

  const setPlatform = (value: string) =>
    Object.defineProperty(process, "platform", { value, configurable: true });

  beforeAll(() => {
    register();
    saveSettings = state.handlers.get(OVERLAY_SET_SETTINGS) as SettingsHandler;
  });

  beforeEach(() => {
    setPlatform("linux");
    ctx.overlaySettings = {} as typeof ctx.overlaySettings;
    state.push.mockClear();
  });

  afterEach(() => {
    setPlatform(realPlatform);
  });

  it("switches the open overlays both ways without taking focus", async () => {
    state.reward.visible = true;

    await saveSettings({}, { linuxOverlaysInteractive: true });

    expect(ctx.overlayInteractiveMode).toBe(true);
    for (const controller of pair) {
      expect(controller.setOverlayInteractiveMode).toHaveBeenCalledExactlyOnceWith(true, {
        focus: false,
      });
    }
    expect(state.setRivenInteractiveMode).toHaveBeenCalledExactlyOnceWith(true, { focus: false });
    expect(state.push).toHaveBeenCalledOnce();

    await saveSettings({}, { linuxOverlaysInteractive: false });

    expect(ctx.overlayInteractiveMode).toBe(false);
    expect(state.reward.setOverlayInteractiveMode).toHaveBeenLastCalledWith(false, {
      focus: false,
    });
    expect(state.setRivenInteractiveMode).toHaveBeenLastCalledWith(false, { focus: false });
    expect(state.captureFocus).not.toHaveBeenCalled();
    expect(state.returnFocus).not.toHaveBeenCalled();
  });

  it("leaves the overlays alone when a save keeps the setting", async () => {
    ctx.overlaySettings = { linuxOverlaysInteractive: true } as typeof ctx.overlaySettings;

    await saveSettings({}, { linuxOverlaysInteractive: true, overlayScale: 1 });

    for (const controller of pair)
      expect(controller.setOverlayInteractiveMode).not.toHaveBeenCalled();
    expect(state.setRivenInteractiveMode).not.toHaveBeenCalled();
  });

  // The planner is pre-warmed before any overlay opens; a stale passive mode there
  // makes X11 rebuild it on its first show.
  it("starts in the saved mode before the first overlay opens", () => {
    writeSavedSettings({ linuxOverlaysInteractive: true });

    loadOverlaySettings();
    expect(ctx.overlayInteractiveMode).toBe(true);

    setPlatform("win32");
    loadOverlaySettings();
    expect(ctx.overlayInteractiveMode).toBe(false);
    writeSavedSettings({});
  });

  it("does nothing on Windows", async () => {
    setPlatform("win32");

    await saveSettings({}, { linuxOverlaysInteractive: true });

    expect(ctx.overlayInteractiveMode).toBe(false);
    for (const controller of pair)
      expect(controller.setOverlayInteractiveMode).not.toHaveBeenCalled();
    expect(state.setRivenInteractiveMode).not.toHaveBeenCalled();
  });
});

describe("riven similar auctions setting", () => {
  let saveSettings: SettingsHandler;
  let setFromOverlay: SettingsHandler;

  beforeAll(() => {
    if (!state.handlers.has(OVERLAY_SET_SETTINGS)) register();
    saveSettings = state.handlers.get(OVERLAY_SET_SETTINGS) as SettingsHandler;
    setFromOverlay = state.handlers.get(RIVEN_SET_SIMILAR_AUCTIONS) as SettingsHandler;
  });

  beforeEach(() => {
    ctx.overlaySettings = { rivenSimilarAuctionsShown: true } as typeof ctx.overlaySettings;
    state.rivenPanelSend.mockClear();
    state.broadcast.mockClear();
  });

  it("only the riven overlay may set it, and only to a boolean", async () => {
    expect(state.handlerGuards.get(RIVEN_SET_SIMILAR_AUCTIONS)).toBe(state.rivenGuard);
    for (const invalid of ["false", 0, 1, null, undefined, {}]) {
      await expect(setFromOverlay({}, invalid)).rejects.toThrow(/boolean/);
    }
    expect(ctx.overlaySettings.rivenSimilarAuctionsShown).toBe(true);
    expect(state.rivenPanelSend).not.toHaveBeenCalled();
    expect(state.broadcast).not.toHaveBeenCalled();
  });

  it("saves the overlay's flip and pushes it to every window", async () => {
    await expect(setFromOverlay({}, false)).resolves.toBe(false);

    expect(ctx.overlaySettings.rivenSimilarAuctionsShown).toBe(false);
    expect(state.rivenPanelSend).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, false);
    expect(state.broadcast).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, false);
  });

  it("pushes a change saved from the main window, and only a change", async () => {
    await setFromOverlay({}, true);
    state.rivenPanelSend.mockClear();
    state.broadcast.mockClear();

    await saveSettings({}, { rivenSimilarAuctionsShown: true, overlayScale: 1 });
    expect(state.rivenPanelSend).not.toHaveBeenCalled();
    expect(state.broadcast).not.toHaveBeenCalled();

    await saveSettings({}, { rivenSimilarAuctionsShown: false });
    expect(state.rivenPanelSend).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, false);
    expect(state.broadcast).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, false);
  });
  it("pushes a save that undoes a flip the windows already got", async () => {
    await setFromOverlay({}, false);
    state.rivenPanelSend.mockClear();
    state.broadcast.mockClear();

    // A full form saved after the flip still carries the value the form loaded with.
    await saveSettings({}, { rivenSimilarAuctionsShown: true });
    expect(state.rivenPanelSend).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, true);
    expect(state.broadcast).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, true);
  });

  // Each queued write announces its own before and after, so no module-level copy of
  // what the windows were last sent is needed.
  it("pushes a flip that lands while a stale form save is still in flight", async () => {
    let release: () => void = () => {};
    state.lifecycleHeld = new Promise<void>((resolve) => {
      release = resolve;
    });
    const form = saveSettings(
      {},
      { warframeLifecycleEnabled: true, rivenSimilarAuctionsShown: true },
    );
    const flip = setFromOverlay({}, false);
    await Promise.resolve();
    expect(state.rivenPanelSend).not.toHaveBeenCalled();

    release();
    await Promise.all([form, flip]);
    state.lifecycleHeld = null;

    expect(ctx.overlaySettings.rivenSimilarAuctionsShown).toBe(false);
    expect(state.rivenPanelSend).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, false);
    expect(state.broadcast).toHaveBeenCalledExactlyOnceWith(RIVEN_SIMILAR_AUCTIONS, false);
  });
});

// Placement and scale saves used to assign ctx directly, skipping the queue and the normaliser.
describe("overlay placement writes", () => {
  type PlacementHandler = (event: unknown, key: unknown, value: unknown) => Promise<unknown>;
  let savePlacement: PlacementHandler;
  let saveScale: PlacementHandler;
  let saveSettings: SettingsHandler;

  beforeAll(() => {
    if (!state.handlers.has(OVERLAY_SET_SETTINGS)) register();
    savePlacement = state.handlers.get(OVERLAY_SAVE_PLACEMENT) as PlacementHandler;
    saveScale = state.handlers.get(OVERLAY_SAVE_SCALE) as PlacementHandler;
    saveSettings = state.handlers.get(OVERLAY_SET_SETTINGS) as SettingsHandler;
  });

  beforeEach(() => {
    ctx.overlaySettings = { ...OVERLAY_SETTINGS_DEFAULTS } as unknown as typeof ctx.overlaySettings;
  });

  it("waits for a settings save in flight, then lands on top of it", async () => {
    let release: () => void = () => {};
    state.lifecycleHeld = new Promise<void>((resolve) => {
      release = resolve;
    });
    const form = saveSettings({}, { warframeLifecycleEnabled: true });
    const placed = savePlacement({}, "planner", { xFrac: 0.5, yFrac: 0.25 });
    await Promise.resolve();
    expect(ctx.overlaySettings.overlayWindowBounds?.planner).toBeUndefined();

    release();
    await expect(placed).resolves.toEqual({ ok: true });
    await form;
    state.lifecycleHeld = null;

    expect(ctx.overlaySettings.warframeLifecycleEnabled).toBe(true);
    expect(ctx.overlaySettings.overlayWindowBounds?.planner).toEqual({
      x: 500,
      y: 125,
      displayId: "1",
    });
  });

  it("keeps a saved size when only the position moves", async () => {
    await saveSettings(
      {},
      { overlayWindowBounds: { reward: { x: 1, y: 2, width: 900, height: 200 } } },
    );

    await savePlacement({}, "reward", { xFrac: 0.1, yFrac: 0.2 });

    expect(ctx.overlaySettings.overlayWindowBounds?.reward).toEqual({
      x: 100,
      y: 100,
      displayId: "1",
      width: 900,
      height: 200,
    });
  });

  it("saves a scale normalised, and only for a window that scales", async () => {
    await expect(saveScale({}, "rivenRight", 1.234)).resolves.toEqual({ ok: true });
    expect(ctx.overlaySettings.overlayWindowScales).toEqual({ rivenRight: 1.23 });

    await expect(saveScale({}, "tradeNotification", 1.2)).resolves.toEqual({ ok: false });
    expect(ctx.overlaySettings.overlayWindowScales).toEqual({ rivenRight: 1.23 });
  });
});
