import { getOverlayDescriptor } from "../config/shared/overlayLayout";
import ctx from "./context";

import { createOverlayWindowsController } from "./overlay/windows";
import {
  controllerAdapter,
  overlayWindowSlot,
  registerOverlay,
  rememberOverlayWindowBounds,
} from "./overlay/registry";
import { registerZOrderSubscriber, syncUnfocusHide } from "./overlay/zOrder";
import { withScope } from "../services/logger";
import { hardenBrowserWindowNavigation } from "../services/windowSecurity";
import { isArbiSummaryOverlayEnabled } from "../config/runtime/overlaySettings";
import { buildArbiSummaryPayload } from "../config/shared/arbiSummary";
import type { ArbiRunRecord } from "../config/shared/arbiTypes";
import { ARBI_OPEN_RUN, ARBI_SUMMARY_DATA } from "../config/shared/ipcChannels";

import { BrowserWindow, app, screen } from "electron";
import path from "node:path";
import { listen } from "./routeHandlers";
import { overlayRoutes } from "../config/shared/overlayIpcRoutes";

const { arbiSummary } = overlayRoutes;

const log = withScope("arbiOverlayIpc");

const APP_ROOT = app.getAppPath();
const ARBI_SUMMARY_WINDOW_FILE = path.join(APP_ROOT, "renderer", "arbi-overlay.html");

const AUTO_HIDE_MS = 60_000;
const WIN_W = getOverlayDescriptor("arbiSummary").canvas.width;
const WIN_H = getOverlayDescriptor("arbiSummary").canvas.height;

export const arbiSummaryWindowsController = createOverlayWindowsController({
  app,
  BrowserWindow,
  screen,
  ctx,
  ...overlayWindowSlot("arbiSummary"),
  getOverlayInteractiveMode: () => false,
  setOverlayInteractiveModeState: () => {},
  persistBoundsWhenPassive: true,
  // Click-through is never wanted here, and on X11 it cannot be undone.
  neverClickThrough: true,
  log,
  hardenBrowserWindowNavigation,
  overlayWindowFile: ARBI_SUMMARY_WINDOW_FILE,
  windowLabel: "arbi summary window",
  windowTitle: "WFHelper Arbitration Summary",
  preloadFileName: "preload-arbi.js",
  placement: "top-right",
  displayMode: "primary",
  windowWidth: WIN_W,
  windowHeight: WIN_H,
  minWindowWidth: WIN_W,
  minWindowHeight: WIN_H,
  transparent: true,
  hasShadow: false,
  windowStateKey: "arbiSummary",
  onWindowBoundsChanged: rememberOverlayWindowBounds,
});

// Never click-through, so it always takes a drag; its renderer reports arbiSummary.ready.
registerOverlay(
  "arbiSummary",
  controllerAdapter(arbiSummaryWindowsController, () => true, { reportsReady: false }),
);

registerZOrderSubscriber({
  isActive: () =>
    arbiSummaryWindowsController.isOverlayWindowVisible() ||
    arbiSummaryWindowsController.isHiddenByUnfocus(),
  sync: (warframeFocused, foreground) => {
    syncUnfocusHide("arbi summary", [arbiSummaryWindowsController], warframeFocused, foreground);
  },
});

function hideArbiSummary(): void {
  arbiSummaryWindowsController.clearOverlayAutoHideTimer();
  arbiSummaryWindowsController.hideOverlayWindow();
}

export function maybeShowArbiSummary(run: ArbiRunRecord): void {
  if (!isArbiSummaryOverlayEnabled(ctx.overlaySettings)) return;
  const payload = buildArbiSummaryPayload(run);
  if (!payload) return;

  log.info(
    `[ArbiSummary] showing overlay for ${payload.id} (${payload.node}, ${payload.rotations} rotations)`,
  );
  arbiSummaryWindowsController.createOverlayWindow();
  arbiSummaryWindowsController.sendOverlayEvent(ARBI_SUMMARY_DATA, payload);
  arbiSummaryWindowsController.scheduleOverlayAutoHide(AUTO_HIDE_MS);
}

export function register(): void {
  listen(arbiSummary.ready, (event) => {
    arbiSummaryWindowsController.markRendererReady(event.sender.id);
  });

  listen(arbiSummary.close, () => {
    hideArbiSummary();
  });

  listen(arbiSummary.openDetails, (_event, rawRunId: unknown) => {
    const runId = typeof rawRunId === "string" ? rawRunId : "";
    hideArbiSummary();

    const main = ctx.mainWindow;
    if (!main || main.isDestroyed()) return;
    if (main.isMinimized()) main.restore();
    main.show();
    main.focus();
    if (runId) main.webContents.send(ARBI_OPEN_RUN, runId);
  });
}
