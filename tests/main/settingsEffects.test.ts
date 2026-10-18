import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  OVERLAY_SETTINGS_DEFAULTS,
  type OverlaySettings,
} from "../../config/runtime/overlaySettings";
import type { OverlaySettingsListener } from "../../ipc/overlay/settings";

const effects = vi.hoisted(() => ({
  arbi: vi.fn(),
  pt: vi.fn(),
  mission: vi.fn(),
  createTray: vi.fn(),
  destroyTray: vi.fn(),
  ocr: vi.fn(),
  presence: vi.fn(),
  inventory: vi.fn(),
  zoom: vi.fn(),
}));

vi.mock("../../ipc/trayIpc", () => ({
  createTray: effects.createTray,
  destroyTray: effects.destroyTray,
}));
vi.mock("../../ipc/mainWindowZoom", () => ({ applyMainWindowZoom: effects.zoom }));
vi.mock("../../services/arbiRunTracker", () => ({ setArbiTrackingEnabled: effects.arbi }));
vi.mock("../../services/profitTakerTracker", () => ({ setPtTrackingEnabled: effects.pt }));
vi.mock("../../services/missionRewards", () => ({ setTrackingEnabled: effects.mission }));
vi.mock("../../services/wfmPresence", () => ({ setOptions: effects.presence }));
vi.mock("../../services/inventorySync", () => ({ apply: effects.inventory }));
vi.mock("../../services/rewardScanDebug", () => ({ setOcrDebugDumpsEnabled: effects.ocr }));

import { registerSettingsEffects } from "../../ipc/settingsEffects";

const base = {
  ...OVERLAY_SETTINGS_DEFAULTS,
  arbiTrackingEnabled: true,
  missionTrackingEnabled: true,
  keepRunningOnClose: true,
  ocrDebugImagesEnabled: false,
} as unknown as OverlaySettings;

function subscribed() {
  const listeners: Array<{ listener: OverlaySettingsListener; atStartup: boolean }> = [];
  registerSettingsEffects((listener, options) => {
    listeners.push({ listener, atStartup: options?.atStartup === true });
  });
  return {
    startup: () => {
      for (const { listener, atStartup } of listeners) {
        if (atStartup) listener({ previous: null, next: base });
      }
    },
    change: (patch: Partial<OverlaySettings>) => {
      for (const { listener } of listeners)
        listener({ previous: base, next: { ...base, ...patch } });
    },
  };
}

const allEffects = () => Object.values(effects);

beforeEach(() => {
  for (const effect of allEffects()) effect.mockClear();
});

describe("settings effects", () => {
  it("apply the loaded settings once at startup", () => {
    subscribed().startup();

    expect(effects.arbi).toHaveBeenCalledExactlyOnceWith(true);
    expect(effects.pt).toHaveBeenCalledExactlyOnceWith(true);
    expect(effects.mission).toHaveBeenCalledExactlyOnceWith(true);
    expect(effects.createTray).toHaveBeenCalledOnce();
    expect(effects.destroyTray).not.toHaveBeenCalled();
    expect(effects.ocr).toHaveBeenCalledExactlyOnceWith(false);
    expect(effects.presence).toHaveBeenCalledOnce();
    // Startup runs these from their own owners once the window and data sources exist.
    expect(effects.inventory).not.toHaveBeenCalled();
    expect(effects.zoom).not.toHaveBeenCalled();
  });

  it("run only the effect whose setting changed, once", () => {
    const { change } = subscribed();

    change({ arbiTrackingEnabled: false });
    expect(effects.arbi).toHaveBeenCalledExactlyOnceWith(false);
    expect(effects.pt).toHaveBeenCalledExactlyOnceWith(false);
    for (const effect of allEffects().filter((e) => e !== effects.arbi && e !== effects.pt)) {
      expect(effect).not.toHaveBeenCalled();
    }

    change({ keepRunningOnClose: false });
    expect(effects.destroyTray).toHaveBeenCalledOnce();
    change({ autoInventorySyncEnabled: false });
    expect(effects.inventory).toHaveBeenCalledExactlyOnceWith("settings");
    change({ uiScale: 1.2 });
    expect(effects.zoom).toHaveBeenCalledOnce();
    change({ wfmStatusHoldMinutes: 30 });
    expect(effects.presence).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ holdMinutes: 30 }),
    );
  });

  // A drag saves on every move; none of these subsystems care.
  it("leave everything alone for a window bounds write", () => {
    subscribed().change({
      overlayWindowBounds: { reward: { x: 5, y: 6 } },
      overlayDragHintDismissed: true,
    } as Partial<OverlaySettings>);

    for (const effect of allEffects()) expect(effect).not.toHaveBeenCalled();
  });
});
