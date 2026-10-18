import type { BrowserWindow } from "electron";

import ctx from "../context";
import { OVERLAY_LAYOUT_KINDS, type OverlayLayoutKind } from "../../config/shared/overlayLayout";
import type {
  OverlaySavedWindowBounds,
  OverlaySettings,
  OverlayWindowKey,
} from "../../config/runtime/overlaySettings";
import type { createOverlayWindowsController } from "./windows";

/** One overlay the game screen can show: each has its own window and saved layout. */
export type OverlayKind = OverlayLayoutKind;
export const OVERLAY_KINDS = OVERLAY_LAYOUT_KINDS;

type OverlayWindow = BrowserWindow;

/** Window handles stay on ctx, where e2e specs and the ctx log read them. */
const WINDOW_SLOT = {
  reward: "overlayWindow",
  planner: "plannerOverlayWindow",
  rivenLeft: "rivenOverlayLeftWindow",
  rivenRight: "rivenOverlayRightWindow",
  arbiSummary: "arbiSummaryWindow",
  tradeNotification: "tradeNotificationWindow",
} as const satisfies Record<OverlayKind, keyof typeof ctx>;

type WindowSlot = (typeof WINDOW_SLOT)[OverlayKind];

export interface OverlayPlacementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  zoomFactor?: number;
}

/** What the module that owns an overlay kind answers for it. */
export interface OverlayAdapter {
  reposition(): void;
  placementRect(): OverlayPlacementRect;
  send(channel: string, payload: unknown): void;
  /** Whether the overlay takes clicks and drags right now. */
  isInteractive(): boolean;
  /** Only kinds whose renderer reports OVERLAY_READY have one. */
  markReady?(senderId: number): boolean;
}

const adapters = new Map<OverlayKind, OverlayAdapter>();

export function registerOverlay(kind: OverlayKind, adapter: OverlayAdapter): void {
  adapters.set(kind, adapter);
}

function rawWindow(kind: OverlayKind): OverlayWindow | null {
  return ctx[WINDOW_SLOT[kind]];
}

/** The live window for a kind, or null when it is closed or destroyed. */
export function overlayWindow(kind: OverlayKind): OverlayWindow | null {
  const win = rawWindow(kind);
  return win && !win.isDestroyed() ? win : null;
}

/** The getter and setter a window controller stores its handle through. */
export function overlayWindowSlot(kind: OverlayKind) {
  const slot: WindowSlot = WINDOW_SLOT[kind];
  return {
    getOverlayWindow: () => ctx[slot],
    setOverlayWindow: (win: OverlayWindow | null) => {
      ctx[slot] = win;
    },
  };
}

export function overlayKindOf(webContentsId: number): OverlayKind | null {
  return (
    OVERLAY_KINDS.find((kind) => overlayWindow(kind)?.webContents.id === webContentsId) ?? null
  );
}

export function liveOverlayWindows(): OverlayWindow[] {
  return OVERLAY_KINDS.map(overlayWindow).filter((win): win is OverlayWindow => win !== null);
}

export function repositionOverlay(kind: OverlayKind): void {
  adapters.get(kind)?.reposition();
}

export function overlayPlacementRect(kind: OverlayKind): OverlayPlacementRect | null {
  return adapters.get(kind)?.placementRect() ?? null;
}

export function sendToOverlay(kind: OverlayKind, channel: string, payload: unknown): void {
  adapters.get(kind)?.send(channel, payload);
}

export function broadcastToOverlays(channel: string, payload: unknown): void {
  for (const kind of OVERLAY_KINDS) sendToOverlay(kind, channel, payload);
}

export function isOverlayInteractive(kind: OverlayKind): boolean {
  return adapters.get(kind)?.isInteractive() ?? false;
}

/** False when no overlay that reports readiness owns the sender. */
export function markOverlayReady(senderId: number): boolean {
  const kind = overlayKindOf(senderId);
  const markReady = kind ? adapters.get(kind)?.markReady : undefined;
  return markReady ? markReady(senderId) : false;
}

export function destroyOverlayWindows(): void {
  for (const win of liveOverlayWindows()) win.destroy();
}

type OverlayWindowsController = Pick<
  ReturnType<typeof createOverlayWindowsController>,
  | "positionOverlayWindow"
  | "getAnchorMeta"
  | "getOverlayBoundsForActiveDisplay"
  | "sendOverlayEvent"
  | "markRendererReady"
>;

/** The adapter for a kind drawn by createOverlayWindowsController. */
export function controllerAdapter(
  controller: OverlayWindowsController,
  isInteractive: () => boolean,
  options: { reportsReady?: boolean } = {},
): OverlayAdapter {
  return {
    reposition: () => controller.positionOverlayWindow(controller.getAnchorMeta()),
    placementRect: () => controller.getOverlayBoundsForActiveDisplay(),
    send: (channel, payload) => controller.sendOverlayEvent(channel, payload),
    isInteractive,
    ...(options.reportsReady === false
      ? {}
      : { markReady: (senderId: number) => controller.markRendererReady(senderId) }),
  };
}

type BoundsPersistence = (
  patch: (current: OverlaySettings) => Partial<OverlaySettings>,
) => void | Promise<unknown>;

let persistBounds: BoundsPersistence | null = null;

export function configureOverlayBoundsPersistence(persist: BoundsPersistence): void {
  persistBounds = persist;
}

/** A move or resize of an overlay window, merged into what was saved for it. */
export function overlayBoundsPatch(
  current: OverlaySettings,
  key: OverlayWindowKey,
  bounds: OverlaySavedWindowBounds,
): Partial<OverlaySettings> {
  return {
    ...(key === "arbiSummary" ? {} : { overlayDragHintDismissed: true }),
    overlayWindowBounds: {
      ...(current.overlayWindowBounds || {}),
      [key]: { ...current.overlayWindowBounds?.[key], ...bounds },
    },
  };
}

export function rememberOverlayWindowBounds(
  key: OverlayWindowKey,
  bounds: OverlaySavedWindowBounds,
): void {
  void persistBounds?.((current) => overlayBoundsPatch(current, key, bounds));
}
