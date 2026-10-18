import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";

import type { OverlaySettings } from "../../config/runtime/overlaySettings";
import ctx from "../../ipc/context";
import {
  OVERLAY_KINDS,
  broadcastToOverlays,
  configureOverlayBoundsPersistence,
  destroyOverlayWindows,
  isOverlayInteractive,
  liveOverlayWindows,
  markOverlayReady,
  overlayBoundsPatch,
  overlayKindOf,
  overlayPlacementRect,
  overlayWindow,
  overlayWindowSlot,
  registerOverlay,
  rememberOverlayWindowBounds,
  repositionOverlay,
  type OverlayAdapter,
  type OverlayKind,
} from "../../ipc/overlay/registry";

function fakeWindow(id: number) {
  let destroyed = false;
  return {
    webContents: { id, send: vi.fn() },
    isDestroyed: () => destroyed,
    destroy: vi.fn(() => {
      destroyed = true;
    }),
  };
}

type FakeWindow = ReturnType<typeof fakeWindow>;

function fakeAdapter(overrides: Partial<OverlayAdapter> = {}) {
  return {
    reposition: vi.fn(),
    placementRect: vi.fn(() => ({ x: 1, y: 2, width: 3, height: 4 })),
    send: vi.fn(),
    isInteractive: vi.fn(() => false),
    ...overrides,
  };
}

function openAll(): Record<OverlayKind, FakeWindow> {
  const windows = Object.fromEntries(
    OVERLAY_KINDS.map((kind, index) => [kind, fakeWindow(index + 10)]),
  ) as Record<OverlayKind, FakeWindow>;
  for (const kind of OVERLAY_KINDS) {
    overlayWindowSlot(kind).setOverlayWindow(windows[kind] as unknown as BrowserWindow);
  }
  return windows;
}

beforeEach(() => {
  for (const kind of OVERLAY_KINDS) overlayWindowSlot(kind).setOverlayWindow(null);
});

describe("overlay registry", () => {
  // The main window's close used to destroy only the reward and riven windows.
  it("tears down the window of every kind", () => {
    const windows = openAll();

    destroyOverlayWindows();

    for (const kind of OVERLAY_KINDS) expect(windows[kind].destroy).toHaveBeenCalledOnce();
    expect(liveOverlayWindows()).toEqual([]);
  });

  it("skips windows already destroyed", () => {
    const windows = openAll();
    windows.planner.destroy();
    windows.planner.destroy.mockClear();

    destroyOverlayWindows();

    expect(windows.planner.destroy).not.toHaveBeenCalled();
    expect(windows.arbiSummary.destroy).toHaveBeenCalledOnce();
  });

  it("stores each kind's window where ctx and the e2e specs read it", () => {
    const windows = openAll();

    expect(ctx.overlayWindow).toBe(windows.reward);
    expect(ctx.plannerOverlayWindow).toBe(windows.planner);
    expect(ctx.rivenOverlayLeftWindow).toBe(windows.rivenLeft);
    expect(ctx.rivenOverlayRightWindow).toBe(windows.rivenRight);
    expect(ctx.arbiSummaryWindow).toBe(windows.arbiSummary);
    expect(ctx.tradeNotificationWindow).toBe(windows.tradeNotification);
  });

  it("names the kind that owns a sender, live windows only", () => {
    const windows = openAll();

    expect(overlayKindOf(windows.rivenRight.webContents.id)).toBe("rivenRight");
    expect(overlayKindOf(999)).toBeNull();
    windows.rivenRight.destroy();
    expect(overlayKindOf(windows.rivenRight.webContents.id)).toBeNull();
    expect(overlayWindow("rivenRight")).toBeNull();
  });

  it("routes per-kind questions to the adapter of that kind", () => {
    const reward = fakeAdapter({ isInteractive: () => true });
    const arbi = fakeAdapter({ placementRect: () => ({ x: 9, y: 9, width: 9, height: 9 }) });
    registerOverlay("reward", reward);
    registerOverlay("arbiSummary", arbi);

    repositionOverlay("arbiSummary");

    expect(arbi.reposition).toHaveBeenCalledOnce();
    expect(reward.reposition).not.toHaveBeenCalled();
    expect(overlayPlacementRect("arbiSummary")).toEqual({ x: 9, y: 9, width: 9, height: 9 });
    expect(isOverlayInteractive("reward")).toBe(true);
    expect(isOverlayInteractive("arbiSummary")).toBe(false);
  });

  it("broadcasts to every kind once", () => {
    const adapters = OVERLAY_KINDS.map((kind) => {
      const adapter = fakeAdapter();
      registerOverlay(kind, adapter);
      return adapter;
    });

    broadcastToOverlays("channel", { a: 1 });

    for (const adapter of adapters) {
      expect(adapter.send).toHaveBeenCalledExactlyOnceWith("channel", { a: 1 });
    }
  });

  it("marks ready only through the adapter of the sender's kind", () => {
    const windows = openAll();
    const planner = fakeAdapter({ markReady: vi.fn(() => true) });
    const reward = fakeAdapter({ markReady: vi.fn(() => true) });
    registerOverlay("planner", planner);
    registerOverlay("reward", reward);
    registerOverlay("arbiSummary", fakeAdapter());

    expect(markOverlayReady(windows.planner.webContents.id)).toBe(true);
    expect(planner.markReady).toHaveBeenCalledExactlyOnceWith(windows.planner.webContents.id);
    expect(reward.markReady).not.toHaveBeenCalled();
    expect(markOverlayReady(windows.arbiSummary.webContents.id)).toBe(false);
    expect(markOverlayReady(999)).toBe(false);
  });
});

describe("overlay bounds persistence", () => {
  it("saves bounds and retires the drag hint on live moves, except for the arbi summary", () => {
    const current = { overlayWindowBounds: {} } as unknown as OverlaySettings;

    expect(overlayBoundsPatch(current, "arbiSummary", { x: 30, y: 40 })).toEqual({
      overlayWindowBounds: { arbiSummary: { x: 30, y: 40 } },
    });
    expect(overlayBoundsPatch(current, "reward", { x: 10, y: 20, displayId: "1" })).toEqual({
      overlayDragHintDismissed: true,
      overlayWindowBounds: { reward: { x: 10, y: 20, displayId: "1" } },
    });
  });

  it("preserves custom dimensions and other kinds when only the position changes", () => {
    const current = {
      overlayWindowBounds: {
        reward: { x: 10, y: 20, width: 1100, height: 200 },
        planner: { x: 5, y: 6 },
      },
    } as unknown as OverlaySettings;

    expect(overlayBoundsPatch(current, "reward", { x: 30, y: 40 }).overlayWindowBounds).toEqual({
      reward: { x: 30, y: 40, width: 1100, height: 200 },
      planner: { x: 5, y: 6 },
    });
  });

  it("hands each window move to the configured writer as a patch", () => {
    const write = vi.fn();
    configureOverlayBoundsPersistence(write);

    rememberOverlayWindowBounds("planner", { x: 1, y: 2 });

    expect(write).toHaveBeenCalledOnce();
    const patch = write.mock.calls[0]![0] as (current: OverlaySettings) => unknown;
    expect(patch({ overlayWindowBounds: {} } as unknown as OverlaySettings)).toEqual({
      overlayDragHintDismissed: true,
      overlayWindowBounds: { planner: { x: 1, y: 2 } },
    });
  });
});
