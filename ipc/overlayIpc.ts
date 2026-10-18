import { registerOverlayEditor } from "./overlay/editorIpc";
import ctx from "./context";
import {
  assertLocalizedOverlaySender,
  assertMainRendererSender,
  assertOverlayRendererSender,
  assertRivenOverlayRendererSender,
  handleAuthorized,
  onAuthorized,
} from "./ipcSecurity";
import { overlayMessages } from "./overlayI18n";
import { disposeAppHotkeys, overlayHotkeyBackend } from "./hotkeyRegistry";
import {
  changedOverlaySettingKeys,
  createOverlaySettingsController,
  overlaySettingsChanged,
  type OverlaySettingsChange,
} from "./overlay/settings";
import { moveOverlayWindowBy } from "./overlay/windows";
import { broadcastToRenderers } from "./popoutIpc";
import { returnFocusToWarframe } from "./overlay/zOrder";
import { hideTradeNotification } from "./tradeNotificationIpc";
import {
  OVERLAY_KINDS,
  broadcastToOverlays,
  configureOverlayBoundsPersistence,
  isOverlayInteractive,
  markOverlayReady,
  overlayKindOf,
  overlayPlacementRect,
  overlayWindow,
  repositionOverlay,
  sendToOverlay,
  type OverlayKind,
} from "./overlay/registry";
import { writeFileAtomicSync } from "../services/atomicFile";
import { userDataPath } from "../services/userDataPath";
import { asRecord } from "../config/shared/objectValidation";
import { withScope } from "../services/logger";
import { matchesAcceleratorInput } from "../services/acceleratorVk";
import { resolveWarframeUiScale } from "../services/eeLogPath";
import * as warframeStatus from "../services/warframeStatus";
import { configureWarframeLifecycle } from "../services/warframeLifecycle";
import * as rivenOverlayIpc from "./rivenOverlayIpc";
import * as rewardOverlayIpc from "./rewardOverlayIpc";
import * as arbiOverlayIpc from "./arbiOverlayIpc";
import {
  isArbiSummaryOverlayEnabled,
  isRelicRecommendationOverlayEnabled,
  isRelicRewardsOverlayEnabled,
  isRivenOverlayEnabled,
  isScalableOverlayWindow,
  isTradeNotificationOverlayEnabled,
  OVERLAY_SETTINGS_DEFAULTS,
  OVERLAY_SETTINGS_FILE_NAME,
  OVERLAY_WINDOW_KEYS,
  overlaysStartInteractive,
  type OverlaySettings,
  type OverlayWindowKey,
} from "../config/runtime/overlaySettings";
import { clampNumber } from "../config/shared/numeric";
import {
  OVERLAY_THEME_VARS,
  OVERLAY_GET_SETTINGS,
  OVERLAY_GET_DETECTED_UI_SCALE,
  OVERLAY_GET_MESSAGES,
  OVERLAY_GET_THEME_VARS,
  OVERLAY_SET_SETTINGS,
  OVERLAY_THEME_UPDATED,
  OVERLAY_DRAG_MOVE,
  OVERLAY_READY,
  OVERLAY_PLACEMENT_LAYOUT,
  OVERLAY_SAVE_PLACEMENT,
  OVERLAY_SAVE_SCALE,
  RIVEN_SET_SIMILAR_AUCTIONS,
  RIVEN_SIMILAR_AUCTIONS,
} from "../config/shared/ipcChannels";
import {
  OVERLAY_FORWARDED_COLOR_VARS,
  OVERLAY_FORWARDED_CSS_VARS,
  OVERLAY_FORWARDED_EFFECT_VARS,
  OVERLAY_FORWARDED_FONT_VARS,
  OVERLAY_OPACITY_CSS_VARS,
} from "../config/shared/themeCssVars";
import { isOverlayOpacityPercent } from "../config/shared/overlayOpacity";

const log = withScope("overlayIpc");

import { app, BrowserWindow, screen, type WebContents } from "electron";
import fs from "node:fs";

async function bringOverlayToWarframeDisplayIfAvailable(): Promise<void> {
  try {
    const rwc = rewardOverlayIpc.rewardWindowsController;
    const pwc = rewardOverlayIpc.plannerWindowsController;
    const status = await warframeStatus.getStatus({ force: true });
    if (status?.focusedDisplayId) {
      const anchor = { sourceDisplayId: String(status.focusedDisplayId) };
      rwc.setAnchorMeta(anchor);
      pwc.setAnchorMeta(anchor);
      rwc.positionOverlayWindow(rwc.getAnchorMeta());
      pwc.positionOverlayWindow(pwc.getAnchorMeta());
    }
  } catch {
    // best effort
  }
}

function setOverlayInteractionMode(enabled: boolean, source = "unknown", focus = true): void {
  const rwc = rewardOverlayIpc.rewardWindowsController;
  const pwc = rewardOverlayIpc.plannerWindowsController;
  const next = !!enabled;
  const rewardExists = overlayWindow("reward") !== null;
  const plannerExists = overlayWindow("planner") !== null;
  if (ctx.overlayInteractiveMode === next && (rewardExists || plannerExists)) {
    if (rewardExists) rwc.setOverlayInteractiveMode(next, { focus });
    if (plannerExists) pwc.setOverlayInteractiveMode(next, { focus });
    rewardOverlayIpc.pushOverlayInteractionMode();
    return;
  }

  ctx.overlayInteractiveMode = next;
  if (rewardExists) rwc.setOverlayInteractiveMode(next, { focus });
  if (plannerExists) pwc.setOverlayInteractiveMode(next, { focus });
  rewardOverlayIpc.pushOverlayInteractionMode();
  log.info(`[OverlayInteraction] mode=${next ? "interactive" : "passive"} source=${source}`);
}

// The player is in Settings, so the overlays change mode without taking focus.
function applyOverlayInteractionSetting({ previous, next: settings }: OverlaySettingsChange): void {
  const next = overlaysStartInteractive(settings, process.platform);
  if (next === overlaysStartInteractive(previous, process.platform)) return;
  setOverlayInteractionMode(next, "settings", false);
  rivenOverlayIpc.setRivenInteractiveMode(next, { focus: false });
}

/** The mode the overlays on screen switched to, or null when none was on screen. */
function toggleOverlayInteractionMode(source = "unknown"): boolean | null {
  rewardOverlayIpc.rewardWindowsController.restoreAfterUnfocus();
  rewardOverlayIpc.plannerWindowsController.restoreAfterUnfocus();
  rivenOverlayIpc.restoreRivenAfterUnfocus();
  const plannerVisible = rewardOverlayIpc.plannerWindowsController.isOverlayWindowVisible();
  const rewardVisible = rewardOverlayIpc.rewardWindowsController.isOverlayWindowVisible();
  const rivenLeftExists = overlayWindow("rivenLeft") !== null;
  const anyRivenVisible = rivenOverlayIpc.isAnyRivenWindowVisible();

  const anyActive = plannerVisible || rewardVisible || (anyRivenVisible && rivenLeftExists);

  if (!anyActive) {
    return null;
  }

  const next = anyRivenVisible
    ? !rivenOverlayIpc.isRivenInteractiveMode()
    : !ctx.overlayInteractiveMode;
  if (next) warframeStatus.captureWarframeFocus();
  if (anyRivenVisible) {
    rivenOverlayIpc.setRivenInteractiveMode(next);
  }
  if (plannerVisible || rewardVisible) setOverlayInteractionMode(next, source);
  // After the flip: going unfocusable hands the foreground down the z-order first.
  if (!next) returnFocusToWarframe();
  return next;
}

const OVERLAY_THEME_VAR_ALLOWLIST: ReadonlySet<string> = new Set(OVERLAY_FORWARDED_CSS_VARS);
const OVERLAY_COLOR_VAR_SET: ReadonlySet<string> = new Set(OVERLAY_FORWARDED_COLOR_VARS);
const OVERLAY_FONT_VAR_SET: ReadonlySet<string> = new Set(OVERLAY_FORWARDED_FONT_VARS);
const OVERLAY_EFFECT_VAR_SET: ReadonlySet<string> = new Set(OVERLAY_FORWARDED_EFFECT_VARS);
const SAFE_COLOR_FUNCTION_RE = /^(?:rgb|rgba|hsl|hsla|oklch)\(\s*[-+0-9.%\s,/]+\)$/i;
const SAFE_HEX_COLOR_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const SAFE_FONT_STACK_RE = /^[a-z0-9\s"',-]{1,120}$/i;
const SAFE_COLOR_REF_RE =
  /^var\(--(?:bg-(?:deep|base|surface|raised|hover)|accent(?:-dim|-bright|-glow)?|text-(?:primary|secondary|muted)|success|warning|danger|info|border(?:-strong)?)\)$/;
const SAFE_COLOR_MIX_RE =
  /^color-mix\(in srgb, var\(--(?:bg-(?:deep|base|surface|raised|hover)|border(?:-strong)?)\) (?:[1-9]\d?|100)%, transparent\)$/;

function boundedCssLength(value: string, min: number, max: number): boolean {
  const match = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(value);
  if (!match) return false;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= min && n <= max;
}

function isSafeOverlayColor(value: string): boolean {
  return (
    value.length <= 96 && (SAFE_HEX_COLOR_RE.test(value) || SAFE_COLOR_FUNCTION_RE.test(value))
  );
}

function isSafeOverlayFontValue(value: string): boolean {
  if (!SAFE_FONT_STACK_RE.test(value)) return false;
  return !/url|expression/i.test(value);
}

function isSafeOverlayEffectValue(key: string, value: string): boolean {
  if (key === "--overlay-opacity" || OVERLAY_OPACITY_CSS_VARS.includes(key)) {
    return isOverlayOpacityPercent(value);
  }
  if (key.startsWith("--radius-")) return boundedCssLength(value, 0, 3);
  if (key === "--ui-backdrop-blur") {
    return value === "none" || /^blur\((?:[1-9]|1\d|2[0-4])px\)$/.test(value);
  }
  if (key === "--ui-panel-shadow") return value === "none";
  if (
    key === "--ui-panel-bg" ||
    key === "--ui-panel-border" ||
    key === "--ui-control-bg" ||
    key === "--ui-control-border"
  ) {
    return (
      value === "transparent" || SAFE_COLOR_REF_RE.test(value) || SAFE_COLOR_MIX_RE.test(value)
    );
  }
  return false;
}

function isSafeOverlayThemeValue(key: string, value: string): boolean {
  if (/[;{}]/.test(value)) return false;
  if (OVERLAY_COLOR_VAR_SET.has(key)) return isSafeOverlayColor(value);
  if (OVERLAY_FONT_VAR_SET.has(key)) {
    if (
      key === "--font-heading-size" ||
      key === "--font-body-size" ||
      key === "--font-small-size"
    ) {
      return boundedCssLength(value, 0.3, 5);
    }
    return isSafeOverlayFontValue(value);
  }
  if (OVERLAY_EFFECT_VAR_SET.has(key)) return isSafeOverlayEffectValue(key, value);
  return false;
}

function sanitizeOverlayThemeVars(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};

  const input = raw as Record<string, unknown>;
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!OVERLAY_THEME_VAR_ALLOWLIST.has(key)) continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (!isSafeOverlayThemeValue(key, trimmed)) continue;
    sanitized[key] = trimmed;
  }
  return sanitized;
}

const RIVEN_KINDS = ["rivenLeft", "rivenRight"] as const satisfies readonly OverlayKind[];
// The overlays the interaction hotkey switches between click-through and interactive.
const INTERACTION_TOGGLE_KINDS: ReadonlySet<OverlayKind | null> = new Set<OverlayKind>([
  "reward",
  "planner",
  ...RIVEN_KINDS,
]);

function pushOverlayThemeVars(): void {
  if (!ctx.overlayThemeVars || Object.keys(ctx.overlayThemeVars).length === 0) return;
  broadcastToOverlays(OVERLAY_THEME_VARS, { ...ctx.overlayThemeVars });
}

function shareRivenSimilarAuctions(shown: boolean): void {
  for (const kind of RIVEN_KINDS) sendToOverlay(kind, RIVEN_SIMILAR_AUCTIONS, shown);
  broadcastToRenderers(RIVEN_SIMILAR_AUCTIONS, shown);
}

function onRelicRewardTrigger(source = "manual", stalenessMs = 0): void {
  rewardOverlayIpc.onRelicRewardTrigger(
    source,
    stalenessMs,
    pushOverlayThemeVars,
    bringOverlayToWarframeDisplayIfAvailable,
  );
}

const OVERLAY_SETTINGS_FILE = userDataPath(OVERLAY_SETTINGS_FILE_NAME);

const settingsController = createOverlaySettingsController({
  log,
  fs,
  writeFileAtomic: writeFileAtomicSync,
  globalShortcut: overlayHotkeyBackend,
  ctx,
  settingsFile: OVERLAY_SETTINGS_FILE,
  defaults: OVERLAY_SETTINGS_DEFAULTS,
  onRelicRewardTrigger,
  onToggleOverlayInteractionMode: toggleOverlayInteractionMode,
  onRivenRescanTrigger: rivenOverlayIpc.onRivenManualRescan,
  configureWarframeLifecycle,
});

configureOverlayBoundsPersistence((patch) =>
  settingsController
    .updateOverlaySettings(patch)
    .catch((error: unknown) => log.warn("[OverlayPlacement] window bounds not saved:", error)),
);

function onRelicSelectionTrigger(source: string): void {
  rewardOverlayIpc.onRelicSelectionTrigger(
    source,
    pushOverlayThemeVars,
    bringOverlayToWarframeDisplayIfAvailable,
  );
}

function onRelicSelectionClose(): void {
  rewardOverlayIpc.onRelicSelectionClose();
}

const AVAILABILITY_KEYS = [
  "relicRewardsOverlayEnabled",
  "relicRecommendationOverlayEnabled",
  "tradeNotificationOverlayEnabled",
  "rivenOverlayEnabled",
  "arbiSummaryOverlayEnabled",
  "tradeRepHotkeyEnabled",
  "tradeRepHotkey",
] as const satisfies readonly (keyof OverlaySettings)[];

function applyOverlayAvailabilitySettings(change: OverlaySettingsChange): void {
  const { previous, next: settings } = change;
  if (!previous || !overlaySettingsChanged(change, AVAILABILITY_KEYS)) return;
  if (!isRelicRewardsOverlayEnabled(settings)) {
    rewardOverlayIpc.rewardWindowsController.clearOverlayAutoHideTimer();
    rewardOverlayIpc.rewardWindowsController.hideOverlayWindow();
  }

  if (!isRelicRecommendationOverlayEnabled(settings)) {
    rewardOverlayIpc.plannerWindowsController.clearOverlayAutoHideTimer();
    rewardOverlayIpc.plannerWindowsController.hideOverlayWindow();
  }

  const repSettingsChanged =
    previous.tradeRepHotkeyEnabled !== settings.tradeRepHotkeyEnabled ||
    previous.tradeRepHotkey !== settings.tradeRepHotkey;
  if (!isTradeNotificationOverlayEnabled(settings) || repSettingsChanged) {
    hideTradeNotification();
  }

  if (!isRivenOverlayEnabled(settings)) {
    rivenOverlayIpc.onRivenSessionClose();
  }

  if (!isArbiSummaryOverlayEnabled(settings)) {
    arbiOverlayIpc.arbiSummaryWindowsController.hideOverlayWindow();
  }
}

const HOTKEY_KEYS = [
  "hotkey",
  "hotkeyEnabled",
  "interactionHotkey",
  "interactionHotkeyEnabled",
  "rivenRescanHotkey",
  "rivenRescanHotkeyEnabled",
] as const satisfies readonly (keyof OverlaySettings)[];

// Written by the overlays themselves, which already sit where these say.
const OVERLAY_WRITTEN_KEYS: ReadonlySet<keyof OverlaySettings> = new Set([
  "overlayWindowBounds",
  "overlayDragHintDismissed",
  "rivenSimilarAuctionsShown",
] as const);

function repositionAfterSettingsChange(change: OverlaySettingsChange): void {
  if (!changedOverlaySettingKeys(change).some((key) => !OVERLAY_WRITTEN_KEYS.has(key))) return;
  for (const kind of ["reward", "planner", ...RIVEN_KINDS] as const) repositionOverlay(kind);
}

// Each overlay effect runs once per write that changes what it follows, whoever wrote it.
settingsController.onOverlaySettingsChanged((change) => {
  if (overlaySettingsChanged(change, HOTKEY_KEYS)) settingsController.registerOverlayHotkey();
});
settingsController.onOverlaySettingsChanged(applyOverlayAvailabilitySettings);
settingsController.onOverlaySettingsChanged(applyOverlayInteractionSetting);
settingsController.onOverlaySettingsChanged(repositionAfterSettingsChange);
settingsController.onOverlaySettingsChanged((change) => {
  if (!overlaySettingsChanged(change, ["rivenSimilarAuctionsShown"])) return;
  const shown = change.next.rivenSimilarAuctionsShown !== false;
  if (shown !== (change.previous?.rivenSimilarAuctionsShown !== false)) {
    shareRivenSimilarAuctions(shown);
  }
});

function moveInteractiveOverlayWindow(sender: WebContents, rawDelta: unknown): void {
  const win = BrowserWindow.fromWebContents(sender);
  if (!win || win.isDestroyed()) return;

  const kind = overlayKindOf(win.webContents.id);
  if (!kind || !isOverlayInteractive(kind)) return;

  const delta = asRecord(rawDelta) ?? {};
  const dx = Math.round(Number(delta.dx));
  const dy = Math.round(Number(delta.dy));
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
  // Deltas arrive batched per animation frame, so a fast flick can be large.
  if (Math.abs(dx) > 1000 || Math.abs(dy) > 1000) return;
  if (dx === 0 && dy === 0) return;

  moveOverlayWindowBy(win, dx, dy);
}

function register(): void {
  if (process.platform === "win32") {
    // The game-only keyboard hook stops matching once an overlay takes focus.
    const attachInteractionShortcut = (win: BrowserWindow) => {
      win.webContents.on("before-input-event", (event, input) => {
        if (
          !win.isFocused() ||
          !ctx.overlaySettings.interactionHotkeyEnabled ||
          input.type !== "keyDown" ||
          input.isAutoRepeat ||
          !INTERACTION_TOGGLE_KINDS.has(overlayKindOf(win.webContents.id))
        )
          return;
        if (!matchesAcceleratorInput(ctx.overlaySettings.interactionHotkey, input)) return;
        event.preventDefault();
        toggleOverlayInteractionMode("overlay-keyboard");
      });
    };
    app.on("browser-window-created", (_event, win) => attachInteractionShortcut(win));
    BrowserWindow.getAllWindows().forEach(attachInteractionShortcut);
  }
  const overlayEditor = registerOverlayEditor(settingsController.commitOverlaySettings);
  rivenOverlayIpc.register();
  rewardOverlayIpc.register(pushOverlayThemeVars);
  arbiOverlayIpc.register();

  handleAuthorized(OVERLAY_GET_SETTINGS, assertMainRendererSender, async () => {
    return { ...ctx.overlaySettings };
  });

  handleAuthorized(OVERLAY_GET_DETECTED_UI_SCALE, assertMainRendererSender, async () => {
    return resolveWarframeUiScale();
  });

  handleAuthorized(OVERLAY_GET_THEME_VARS, assertLocalizedOverlaySender, async () => {
    return { ...(ctx.overlayThemeVars || {}) };
  });

  handleAuthorized(OVERLAY_GET_MESSAGES, assertLocalizedOverlaySender, async () => {
    return overlayMessages();
  });

  onAuthorized(OVERLAY_DRAG_MOVE, assertOverlayRendererSender, (event, rawDelta: unknown) => {
    moveInteractiveOverlayWindow(event.sender, rawDelta);
  });

  onAuthorized(OVERLAY_READY, assertOverlayRendererSender, (event) => {
    const senderId = event.sender.id;
    if (!markOverlayReady(senderId)) {
      log.warn(`[OverlayWindow] ready signal from unknown overlay sender ${senderId}`);
    }
  });

  handleAuthorized(
    OVERLAY_SET_SETTINGS,
    assertMainRendererSender,
    async (_event, nextSettings: unknown) => {
      const incoming = asRecord(nextSettings) ?? {};
      const importsLayouts = "rewardLayout" in incoming || "overlayLayouts" in incoming;
      if (importsLayouts) overlayEditor.assertIdle();
      const settings = await settingsController.updateOverlaySettings(
        (current) => {
          // A new global scale replaces every per-window one.
          const nextScale = clampNumber(incoming.overlayScale, 0.75, 1.5, NaN);
          const scaleChanged = Number.isFinite(nextScale) && nextScale !== current.overlayScale;
          return scaleChanged ? { ...incoming, overlayWindowScales: {} } : incoming;
        },
        importsLayouts ? () => overlayEditor.assertIdle() : undefined,
      );
      if (importsLayouts) overlayEditor.refresh();
      return settings;
    },
  );

  handleAuthorized(
    RIVEN_SET_SIMILAR_AUCTIONS,
    assertRivenOverlayRendererSender,
    async (_event, shown: unknown) => {
      if (typeof shown !== "boolean") throw new Error("Similar auctions setting must be a boolean");
      const settings = await settingsController.updateOverlaySettings({
        rivenSimilarAuctionsShown: shown,
      });
      return settings.rivenSimilarAuctionsShown;
    },
  );

  onAuthorized(OVERLAY_THEME_UPDATED, assertMainRendererSender, (_event, rawVars: unknown) => {
    const sanitized = sanitizeOverlayThemeVars(rawVars);
    ctx.overlayThemeVars = sanitized;
    log.info(`[OverlayTheme] updated vars=${Object.keys(sanitized).length}`);
    if (Object.keys(sanitized).length > 0) {
      pushOverlayThemeVars();
    }
  });

  handleAuthorized(OVERLAY_PLACEMENT_LAYOUT, assertMainRendererSender, async () => {
    const area = screen.getPrimaryDisplay().workArea;
    const rel = (rect: { x: number; y: number; width: number; height: number }) => ({
      x: rect.x - area.x,
      y: rect.y - area.y,
      width: rect.width,
      height: rect.height,
    });
    const userScale = (key: OverlayWindowKey) =>
      isScalableOverlayWindow(key)
        ? clampNumber(
            (ctx.overlaySettings.overlayWindowScales || {})[key] ??
              ctx.overlaySettings.overlayScale,
            0.75,
            1.5,
            1,
          )
        : 1;
    const placement = (kind: OverlayKind) => {
      const rect = overlayPlacementRect(kind);
      if (!rect) throw new Error(`No placement for overlay ${kind}`);
      return { ...rel(rect), scale: userScale(kind) };
    };
    return {
      area: { width: area.width, height: area.height },
      overlays: Object.fromEntries(OVERLAY_KINDS.map((kind) => [kind, placement(kind)])),
    };
  });

  const placementKeys = new Set<OverlayWindowKey>(OVERLAY_WINDOW_KEYS);
  handleAuthorized(
    OVERLAY_SAVE_PLACEMENT,
    assertMainRendererSender,
    async (_event, rawKey: unknown, rawPos: unknown) => {
      const key = placementKeys.has(rawKey as OverlayWindowKey)
        ? (rawKey as OverlayWindowKey)
        : null;
      const pos = asRecord(rawPos);
      if (!key || !pos) return { ok: false };
      const xFrac = clampNumber(pos.xFrac, 0, 1, NaN);
      const yFrac = clampNumber(pos.yFrac, 0, 1, NaN);
      if (!Number.isFinite(xFrac) || !Number.isFinite(yFrac)) return { ok: false };

      const display = screen.getPrimaryDisplay();
      const area = display.workArea;
      const position = {
        x: Math.round(area.x + xFrac * area.width),
        y: Math.round(area.y + yFrac * area.height),
        displayId: String(display.id),
      };
      try {
        await settingsController.updateOverlaySettings((current) => ({
          overlayWindowBounds: {
            ...(current.overlayWindowBounds || {}),
            [key]: { ...current.overlayWindowBounds?.[key], ...position },
          },
        }));
      } catch (error) {
        log.warn(`[OverlayPlacement] ${key} not saved:`, error);
        return { ok: false };
      }
      log.info(`[OverlayPlacement] saved ${key} -> ${position.x},${position.y}`);
      return { ok: true };
    },
  );

  handleAuthorized(
    OVERLAY_SAVE_SCALE,
    assertMainRendererSender,
    async (_event, rawKey: unknown, rawScale: unknown) => {
      const key = placementKeys.has(rawKey as OverlayWindowKey)
        ? (rawKey as OverlayWindowKey)
        : null;
      const scale = clampNumber(rawScale, 0.75, 1.5, NaN);
      if (!key || !isScalableOverlayWindow(key) || !Number.isFinite(scale)) return { ok: false };

      try {
        await settingsController.updateOverlaySettings((current) => ({
          overlayWindowScales: {
            ...(current.overlayWindowScales || {}),
            [key]: Number(scale.toFixed(2)),
          },
        }));
      } catch (error) {
        log.warn(`[OverlayPlacement] ${key} scale not saved:`, error);
        return { ok: false };
      }

      repositionOverlay(key);
      log.info(`[OverlayPlacement] scale ${key} -> ${scale.toFixed(2)}`);
      return { ok: true };
    },
  );
}

// The planner is pre-warmed before any overlay opens, so the idle mode has to match
// the start mode already or X11 rebuilds that window on its first show.
export function loadOverlaySettings(): OverlaySettings {
  const settings = settingsController.loadOverlaySettings();
  ctx.overlayInteractiveMode = overlaysStartInteractive(settings, process.platform);
  return settings;
}
export const unregisterOverlayHotkey = settingsController.unregisterOverlayHotkey;
export const onOverlaySettingsChanged = settingsController.onOverlaySettingsChanged;
export const publishLoadedOverlaySettings = settingsController.publishLoadedOverlaySettings;
export const setOverlayHotkeysActive = settingsController.setHotkeysActive;

export function disposeOverlayHotkeys(): void {
  disposeAppHotkeys();
}

export {
  register,
  onRelicRewardTrigger,
  onRelicSelectionTrigger,
  onRelicSelectionClose,
  toggleOverlayInteractionMode,
};
