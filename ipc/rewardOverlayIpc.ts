import { getOverlayDescriptor } from "../config/shared/overlayLayout";
import fs from "node:fs";
import path from "node:path";
import { BrowserWindow, screen, app } from "electron";
import ctx from "./context";

import { createOverlayScanController } from "./overlay/scan";
import { createRelicSelectionController } from "./overlay/relicSelection";
import {
  canRaiseOverlayWindows,
  registerZOrderSubscriber,
  returnFocusToWarframe,
  syncUnfocusHide,
  syncOverlayWindowZOrder,
} from "./overlay/zOrder";
import { createOverlayWindowsController } from "./overlay/windows";
import {
  controllerAdapter,
  overlayKindOf,
  overlayWindow,
  overlayWindowSlot,
  registerOverlay,
  rememberOverlayWindowBounds,
} from "./overlay/registry";
import { isRivenInteractiveMode } from "./rivenOverlayIpc";
import { withScope } from "../services/logger";
import { hardenBrowserWindowNavigation } from "../services/windowSecurity";
import { userDataPath } from "../services/userDataPath";

import { isNativeWayland } from "../services/linuxDisplayBackend";
import * as relicService from "../services/relicService";
import {
  captureSourceMeta,
  detectRelicSelectionEra,
  scanRewardsDetailed,
} from "../services/rewardScanner";
import { fetchPriceBySlug, getCachedPriceBySlug } from "../services/wfmStatsPrice";
import * as warframeStatus from "../services/warframeStatus";
import {
  isRelicRecommendationOverlayEnabled,
  isRelicRewardsOverlayEnabled,
  overlaysStartInteractive,
} from "../config/runtime/overlaySettings";
import { OVERLAY_INTERACTION_MODE } from "../config/shared/ipcChannels";
import { REWARD_OVERLAY_CANVAS } from "../config/shared/rewardOverlayLayout";
import { handle, listen } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";
import { overlayRoutes } from "../config/shared/overlayIpcRoutes";

const { api } = mainWindowRoutes;
const { overlay } = overlayRoutes;

const log = withScope("rewardOverlayIpc");

const rewardScanner = {
  captureSourceMeta,
  detectRelicSelectionEra,
  scanRewardsDetailed,
};

const wfmStatsPrice = {
  fetchPriceBySlug,
  getCachedPriceBySlug,
};

const APP_ROOT = app.getAppPath();
const OVERLAY_WINDOW_FILE = path.join(APP_ROOT, "renderer", "overlay.html");
const PRICE_CACHE_FILE = userDataPath("snapshot-cache.json");

export const rewardWindowsController = createOverlayWindowsController({
  app,
  BrowserWindow,
  screen,
  ctx,
  ...overlayWindowSlot("reward"),
  log,
  hardenBrowserWindowNavigation,
  overlayWindowFile: OVERLAY_WINDOW_FILE,
  // fits a card whose set-part chips (30px icons) wrap to two rows + best bar
  windowHeight: REWARD_OVERLAY_CANVAS.height,
  windowTitle: "WFHelper Relic Rewards",
  windowStateKey: "reward",
  onWindowBoundsChanged: rememberOverlayWindowBounds,
  onPresentationEnd: () => endOverlayInteractionWhenIdle(),
  canRaise: canRaiseOverlayWindows,
});

export const plannerWindowsController = createOverlayWindowsController({
  app,
  BrowserWindow,
  screen,
  ctx,
  ...overlayWindowSlot("planner"),
  getOverlayInteractiveMode: () => ctx.overlayInteractiveMode,
  setOverlayInteractiveModeState: (enabled) => {
    ctx.overlayInteractiveMode = !!enabled;
  },
  log,
  hardenBrowserWindowNavigation,
  overlayWindowFile: OVERLAY_WINDOW_FILE,
  placement: "top-right",
  windowWidth: getOverlayDescriptor("planner").canvas.width,
  windowHeight: getOverlayDescriptor("planner").canvas.height,
  fileSearch: "mode=planner",
  transparent: true,
  windowTitle: "WFHelper Relic Planner",
  windowStateKey: "planner",
  onWindowBoundsChanged: rememberOverlayWindowBounds,
  onPresentationEnd: () => endOverlayInteractionWhenIdle(),
  canRaise: canRaiseOverlayWindows,
});

const isPairInteractive = () => ctx.overlayInteractiveMode;
registerOverlay("reward", controllerAdapter(rewardWindowsController, isPairInteractive));
registerOverlay("planner", controllerAdapter(plannerWindowsController, isPairInteractive));

const unfocusHideControllers = [rewardWindowsController, plannerWindowsController];

function isRewardPairShown(): boolean {
  return unfocusHideControllers.some(
    (controller) => controller.isOverlayWindowVisible() || controller.isHiddenByUnfocus(),
  );
}

export function pushOverlayInteractionMode(): void {
  const payload = { interactive: !!ctx.overlayInteractiveMode };
  for (const controller of unfocusHideControllers) {
    controller.sendOverlayEvent(OVERLAY_INTERACTION_MODE, payload);
  }
}

function resetOverlayInteraction(source: string): void {
  const start = overlaysStartInteractive(ctx.overlaySettings, process.platform);
  if (ctx.overlayInteractiveMode === start) return;
  ctx.overlayInteractiveMode = start;
  for (const controller of unfocusHideControllers) controller.setOverlayInteractiveMode(start);
  if (!start && !isRivenInteractiveMode()) returnFocusToWarframe();
  pushOverlayInteractionMode();
  log.info(`[OverlayInteraction] mode=${start ? "interactive" : "passive"} source=${source}`);
}

function endOverlayInteractionWhenIdle(): void {
  if (!isRewardPairShown()) resetOverlayInteraction("dismissed");
}

function presentPairOverlay(
  controller: typeof rewardWindowsController,
  pushOverlayThemeVars: () => void,
  place: () => void = () => controller.createOverlayWindow(),
): void {
  if (!isRewardPairShown()) resetOverlayInteraction("new-overlay");
  place();
  controller.setOverlayInteractiveMode(ctx.overlayInteractiveMode);
  pushOverlayInteractionMode();
  pushOverlayThemeVars();
}

registerZOrderSubscriber({
  isActive: isRewardPairShown,
  sync: (warframeFocused, foreground) => {
    syncUnfocusHide("reward overlays", unfocusHideControllers, warframeFocused, foreground);
    // A click on an interactive overlay takes focus from the game on linux.
    const keepRaised =
      process.platform === "win32"
        ? canRaiseOverlayWindows()
        : warframeFocused || ctx.overlayInteractiveMode;
    syncOverlayWindowZOrder(rewardWindowsController, overlayWindow("reward"), keepRaised);
    syncOverlayWindowZOrder(plannerWindowsController, overlayWindow("planner"), keepRaised);
  },
});

let scanController = createOverlayScanController({
  log,
  rewardScanner,
  ctx,
  windows: rewardWindowsController,
  warframeStatus,
});

const relicSelectionController = createRelicSelectionController({
  log,
  ctx,
  windows: plannerWindowsController,
  relicService,
  rewardScanner,
  wfmStatsPrice,
  warframeStatus,
  fs,
  cacheFilePath: PRICE_CACHE_FILE,
});

export function warmPlannerOverlayWindow(): void {
  if (!isRelicRecommendationOverlayEnabled(ctx.overlaySettings)) return;
  if (overlayWindow("planner")) return;
  plannerWindowsController.createOverlayWindow({ show: false });
}

export function onRelicRewardTrigger(
  source: string,
  stalenessMs: number,
  pushOverlayThemeVars: () => void,
  bringOverlayToWarframeDisplayIfAvailable: () => Promise<void>,
): void {
  if (!isRelicRewardsOverlayEnabled(ctx.overlaySettings)) {
    log.info(`[OverlayRoute] reward overlay disabled; source=${source}`);
    return;
  }
  log.info(`[OverlayRoute] trigger=reward source=${source}`);
  void bringOverlayToWarframeDisplayIfAvailable();
  // An EE.log trigger shows the card with its own result only: shown now it repaints the
  // last round's cards, and the capture 650 ms later reads them back as this round's.
  presentPairOverlay(rewardWindowsController, pushOverlayThemeVars, () =>
    rewardWindowsController.createOverlayWindow({ show: source !== "eelog" }),
  );
  scanController.onRelicRewardTrigger(source, stalenessMs);
}

export function notifyRewardUiReady(): void {
  scanController.notifyRewardUiReady();
}

export function notifyRewardScreenClosed(stalenessMs: number): void {
  scanController.notifyRewardScreenClosed(stalenessMs);
}

export function onRelicSelectionTrigger(
  source: string,
  pushOverlayThemeVars: () => void,
  bringOverlayToWarframeDisplayIfAvailable: () => Promise<void>,
): void {
  if (!isRelicRecommendationOverlayEnabled(ctx.overlaySettings)) {
    log.info(`[OverlayRoute] planner overlay disabled; source=${source}`);
    return;
  }
  log.info(`[OverlayRoute] trigger=planner source=${source}`);
  void bringOverlayToWarframeDisplayIfAvailable();
  presentPairOverlay(plannerWindowsController, pushOverlayThemeVars);
  void relicSelectionController.onRelicSelectionTrigger(source);
}

/** Planner rows cached from the previous relic database would outlive it by their TTL. */
export function onRelicDatabaseChanged(): void {
  relicSelectionController.onRelicDatabaseChanged();
}

export function setActiveMissionTag(tag: string): void {
  relicSelectionController.setActiveMissionTag?.(tag);
}

export function onRelicSelectionClose(): void {
  relicSelectionController.resetMissionTier?.();
  // Hide first even when nothing is on screen: a planner hidden for unfocus
  // would otherwise come back for a picker that no longer exists.
  const wasVisible = plannerWindowsController.isOverlayWindowVisible();
  plannerWindowsController.clearOverlayAutoHideTimer();
  plannerWindowsController.hideOverlayWindow();
  if (!wasVisible) return;
  log.info("[OverlayClose] planner closed via Dialog::SendResult");
}

export function register(pushOverlayThemeVars: () => void): void {
  listen(overlay.reportContentHeight, (event, height: unknown) => {
    if (overlayKindOf(event.sender.id) !== "reward") return;
    if (typeof height !== "number" || !Number.isFinite(height) || height <= 0 || height > 10_000)
      return;
    rewardWindowsController.fitOverlayContentHeight(height);
  });

  listen(overlay.close, (event) => {
    rewardWindowsController.clearOverlayAutoHideTimer();
    plannerWindowsController.clearOverlayAutoHideTimer();
    relicSelectionController.suppressReopenForClose?.();

    if (overlayKindOf(Number(event?.sender?.id || 0)) === "planner") {
      plannerWindowsController.hideOverlayWindow();
    } else {
      rewardWindowsController.hideOverlayWindow();
    }
    if (isRewardPairShown()) resetOverlayInteraction("close-button");
  });

  handle(overlay.getDragHint, async () => {
    // Native Wayland delivers no global hotkeys, so only the Settings switch unlocks overlays.
    const viaSettings = isNativeWayland();
    return {
      hotkey:
        !viaSettings && ctx.overlaySettings.interactionHotkeyEnabled
          ? String(ctx.overlaySettings.interactionHotkey || "")
          : null,
      dismissed: ctx.overlaySettings.overlayDragHintDismissed === true,
      viaSettings,
    };
  });

  handle(overlay.getPrice, async (_event, slug: unknown) => {
    if (typeof slug === "string") {
      const cached = wfmStatsPrice.getCachedPriceBySlug(slug);
      if (cached != null) return cached;
      const snapshot = relicSelectionController.getSnapshotPrice(slug);
      if (snapshot != null) return snapshot;
    }
    return wfmStatsPrice.fetchPriceBySlug(slug);
  });

  listen(api.toggleOverlay, () => {
    if (!isRelicRewardsOverlayEnabled(ctx.overlaySettings)) return;
    rewardWindowsController.clearOverlayAutoHideTimer();
    if (!overlayWindow("reward")) {
      presentPairOverlay(rewardWindowsController, pushOverlayThemeVars);
    } else if (rewardWindowsController.isOverlayWindowVisible()) {
      rewardWindowsController.hideOverlayWindow();
    } else {
      presentPairOverlay(rewardWindowsController, pushOverlayThemeVars, () =>
        rewardWindowsController.positionOverlayWindow(rewardWindowsController.getAnchorMeta()),
      );
      rewardWindowsController.showOverlayWindowInactive();
    }
  });

  listen(api.simulateRelicTrigger, () => {
    onRelicRewardTrigger("simulate", 0, pushOverlayThemeVars, async () => {});
  });

  listen(api.pushRelicFilters, (_event, rawFilters: unknown) => {
    relicSelectionController.setDesktopFilters(rawFilters);
  });
}
