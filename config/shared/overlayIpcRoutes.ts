/** The overlay windows' IPC routes, one surface per window global. Same shape as
 *  ipcRoutes.ts; kept apart because the main window's renderer never loads it.
 *  Routes several overlays share are one object, so they keep one channel and
 *  one handler. Payloads stay unknown where the overlay pages are plain JS. */
import {
  ARBI_SUMMARY_CLOSE,
  ARBI_SUMMARY_DATA,
  ARBI_SUMMARY_OPEN_DETAILS,
  ARBI_SUMMARY_READY,
  OVERLAY_CLOSE,
  OVERLAY_DRAG_MOVE,
  OVERLAY_EDIT_STATE,
  OVERLAY_GET_DRAG_HINT,
  OVERLAY_GET_MESSAGES,
  OVERLAY_GET_PRICE,
  OVERLAY_GET_THEME_VARS,
  OVERLAY_INTERACTION_MODE,
  OVERLAY_LAYOUT_GET,
  OVERLAY_MESSAGES,
  OVERLAY_READY,
  OVERLAY_THEME_VARS,
  RELIC_PLANNER_TRIGGER,
  RELIC_RECOMMENDATIONS,
  RELIC_REWARD_CONTENT_HEIGHT,
  RELIC_REWARD_ITEMS,
  RELIC_REWARD_PRESENTATION,
  RELIC_REWARD_TRIGGER,
  RIVEN_BEST_ATTRIBUTES,
  RIVEN_CHOICE_MADE,
  RIVEN_GRADING_INITIAL,
  RIVEN_GRADING_ROLL,
  RIVEN_INITIAL_STATS,
  RIVEN_OPEN_AUCTION,
  RIVEN_OVERLAY_CLOSE,
  RIVEN_RESCAN,
  RIVEN_RESCAN_REQUEST,
  RIVEN_ROLL_RESULT,
  RIVEN_ROLL_SCANNING,
  RIVEN_SESSION_END,
  RIVEN_SESSION_START,
  RIVEN_SET_SIMILAR_AUCTIONS,
  RIVEN_SIMILAR_AUCTIONS,
  RIVEN_SIMILAR_LISTINGS,
  RIVEN_WEAPON_MISSING,
  RIVEN_WEAPON_UPDATE,
  TRADE_NOTIFICATION_DISMISS,
  TRADE_NOTIFICATION_REP_RESULT,
  TRADE_NOTIFICATION_SHOW,
} from "./ipcChannels";
import { event, invoke, send } from "./ipcRoute";
import type { OverlayEditState } from "./overlayLayout";
import type { RewardPresentation } from "./rewardPresentation";
import type {
  TradeNotificationShowPayload,
  TradeRepResultPayload,
} from "../../ipc/tradeNotificationIpc";

type ThemeVars = Record<string, string>;
type Messages = { locale: string; messages: Record<string, string> };

/** Every overlay window, the trade toast included. */
const getThemeVars = invoke(OVERLAY_GET_THEME_VARS, "anyOverlay").of<[], ThemeVars>();
const getMessages = invoke(OVERLAY_GET_MESSAGES, "anyOverlay").of<[], Messages>();
const onThemeVars = event(OVERLAY_THEME_VARS).of<[vars: ThemeVars]>();
const onMessages = event(OVERLAY_MESSAGES).of<[messages: Messages]>();

/** The scan overlays: every overlay but the trade toast. */
const getDragHint = invoke(OVERLAY_GET_DRAG_HINT, "scanOverlay").of<
  [],
  { hotkey: string | null; dismissed: boolean; viaSettings: boolean }
>();
const moveBy = send(OVERLAY_DRAG_MOVE, "scanOverlay").of<[dx: number, dy: number]>((dx, dy) => ({
  dx,
  dy,
}));
const ready = send(OVERLAY_READY, "scanOverlay").of<[]>();
const onInteractionMode = event(OVERLAY_INTERACTION_MODE).of<[payload: unknown]>();

/** `window.overlay`: the relic reward and relic planner overlays. */
const overlay = {
  close: send(OVERLAY_CLOSE, "scanOverlay").of<[]>(),
  getPrice: invoke(OVERLAY_GET_PRICE, "scanOverlay").of<[slug: string], number | null>(),
  getThemeVars,
  getMessages,
  getDragHint,
  moveBy,
  ready,
  reportContentHeight: send(RELIC_REWARD_CONTENT_HEIGHT, "scanOverlay").of<[height: number]>(),
  reportPresentation: send(RELIC_REWARD_PRESENTATION, "scanOverlay").of<
    [presentation: RewardPresentation]
  >(),
  onTrigger: event(RELIC_REWARD_TRIGGER).of<[]>(),
  onPlannerTrigger: event(RELIC_PLANNER_TRIGGER).of<[payload: unknown]>(),
  onItems: event(RELIC_REWARD_ITEMS).of<[items: unknown]>(),
  onRecommendations: event(RELIC_RECOMMENDATIONS).of<[payload: unknown]>(),
  onThemeVars,
  onMessages,
  onInteractionMode,
};

/** `window.rivenOverlay`: the left and right riven panels. */
const rivenOverlay = {
  close: send(RIVEN_OVERLAY_CLOSE, "rivenOverlay").of<[]>(),
  openAuction: send(RIVEN_OPEN_AUCTION, "rivenOverlay").of<[auctionId: string]>(),
  setSimilarAuctions: invoke(RIVEN_SET_SIMILAR_AUCTIONS, "rivenOverlay").of<
    [shown: boolean],
    boolean
  >(),
  requestRescan: send(RIVEN_RESCAN_REQUEST, "rivenOverlay").of<[]>(),
  moveBy,
  ready,
  getDragHint,
  onSessionStart: event(RIVEN_SESSION_START).of<[weapon: string, kuvaPerRoll: number]>(),
  onInitialStats: event(RIVEN_INITIAL_STATS).of<[stats: unknown, lowConfidence?: unknown]>(),
  onScanning: event(RIVEN_ROLL_SCANNING).of<[]>(),
  onRollResult: event(RIVEN_ROLL_RESULT).of<[payload: unknown]>(),
  onChoiceMade: event(RIVEN_CHOICE_MADE).of<[side: unknown]>(),
  onSessionEnd: event(RIVEN_SESSION_END).of<[]>(),
  onRescan: event(RIVEN_RESCAN).of<[]>(),
  onWeaponUpdate: event(RIVEN_WEAPON_UPDATE).of<[weapon: string]>(),
  onWeaponMissing: event(RIVEN_WEAPON_MISSING).of<[]>(),
  onThemeVars,
  onMessages,
  onInteractionMode,
  onGradingInitial: event(RIVEN_GRADING_INITIAL).of<[grading: unknown]>(),
  onGradingRoll: event(RIVEN_GRADING_ROLL).of<[grading: unknown]>(),
  onBestAttributes: event(RIVEN_BEST_ATTRIBUTES).of<[attrs: unknown]>(),
  onSimilarListings: event(RIVEN_SIMILAR_LISTINGS).of<[listings: unknown]>(),
  onSimilarAuctions: event(RIVEN_SIMILAR_AUCTIONS).of<[shown: boolean]>(),
  getThemeVars,
  getMessages,
};

/** `window.arbiSummary`: the Arbitration summary overlay. */
const arbiSummary = {
  ready: send(ARBI_SUMMARY_READY, "arbiSummary").of<[]>(),
  close: send(ARBI_SUMMARY_CLOSE, "arbiSummary").of<[]>(),
  openDetails: send(ARBI_SUMMARY_OPEN_DETAILS, "arbiSummary").of<[runId: string]>(),
  moveBy,
  getThemeVars,
  getMessages,
  onData: event(ARBI_SUMMARY_DATA).of<[payload: unknown]>(),
  onThemeVars,
  onMessages,
};

/** `window.tradeNotificationApi`: the trade toast. */
const tradeNotificationApi = {
  getThemeVars,
  onThemeVars,
  onShow: event(TRADE_NOTIFICATION_SHOW).of<[payload: TradeNotificationShowPayload]>(),
  onRepResult: event(TRADE_NOTIFICATION_REP_RESULT).of<[payload: TradeRepResultPayload]>(),
  dismiss: send(TRADE_NOTIFICATION_DISMISS, "tradeNotification").of<[]>(),
  getMessages,
  onMessages,
};

/** `window.overlayLayoutApi`, installed in every overlay window. */
const overlayLayoutApi = {
  getLayout: invoke(OVERLAY_LAYOUT_GET, "anyOverlay").of<[], OverlayEditState>(),
  onLayout: event(OVERLAY_EDIT_STATE).of<[state: OverlayEditState]>(),
};

export const overlayRoutes = {
  overlay,
  rivenOverlay,
  arbiSummary,
  tradeNotificationApi,
  overlayLayoutApi,
};
