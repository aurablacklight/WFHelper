/** The main window's IPC routes: one entry per call, holding the method name the
 *  preload exposes, the channel, which windows may call it and the types each way.
 *  The preload, the renderer helpers (src/lib/ipc.ts) and the main-process handlers
 *  (ipc/routeHandlers.ts) all derive from this table. Overlay windows: overlayIpcRoutes.ts. */
import {
  APP_RUNTIME_INFO,
  APP_UPDATE_CHECK,
  APP_UPDATE_DOWNLOAD,
  APP_UPDATE_INSTALL,
  APP_UPDATE_STATE,
  APP_UPDATE_STATUS,
  ARBI_DELETE_LOG,
  ARBI_DELETE_RUN,
  ARBI_EXPORT_LOG,
  ARBI_GET_RUNS,
  ARBI_IMPORT_LOG,
  ARBI_OPEN_RUN,
  ARBI_REFRESH_RUNS,
  ARBI_RUN_SAVED,
  ARBI_SAVE_IMAGE,
  ARBI_SCHED_GET,
  ARBI_SCHED_SET_FAVORITE,
  ARBI_SCHED_SET_LEAD,
  ARBI_SCHED_SET_OCCURRENCE,
  ARBI_SET_NOTES,
  ARBI_SET_TAGS,
  ARBI_SET_VITUS,
  ARBI_SHOW_LOG_IN_FOLDER,
  BUILD_ADVISOR_GUNS,
  BUILD_ADVISOR_REVIEW,
  DB_GET_CODEX_SCANS,
  DB_GET_ITEM_DATABASE,
  DB_GET_MASTERY,
  DB_GET_RELIC_DATABASE,
  DB_GET_RELIC_DATA_INFO,
  DB_GET_WFM_ITEMS,
  DB_GET_WORLD_STATE,
  DROP_ITEM_SOURCES,
  DROP_SEARCH,
  FEEDBACK_CONTEXT,
  FEEDBACK_SUBMIT,
  GAME_LOCALE_UPDATED,
  HELPER_DOWNLOAD,
  HELPER_DOWNLOAD_PROGRESS,
  HELPER_GET_STATUS,
  HELPER_RUN_NOW,
  INVENTORY_EXPORT,
  INVENTORY_GET,
  INVENTORY_GET_STATUS,
  INVENTORY_OPEN_ALECA_FRAME_FILE,
  INVENTORY_OPEN_FILE,
  INVENTORY_SELECTION_COMPLETE,
  INVENTORY_SET_SOURCE,
  INVENTORY_STATUS_UPDATED,
  INVENTORY_UPDATED,
  ITEM_DB_UPDATED,
  LEDGER_EXPORT,
  LEDGER_IMPORT_APPLY,
  LEDGER_IMPORT_PREVIEW,
  LEDGER_QUERY,
  LEDGER_UPDATE_EVENT,
  LINUX_CAPTURE_SETUP,
  LINUX_DISPLAY_GET,
  LINUX_DISPLAY_SET,
  LOGS_OPEN_FOLDER,
  LOG_WARN,
  MARKET_ALERTS_CHANGED,
  MARKET_ALERTS_CLEAR_COOLDOWN,
  MARKET_ALERTS_CLEAR_HITS,
  MARKET_ALERTS_DELETE,
  MARKET_ALERTS_EXPORT,
  MARKET_ALERTS_HITS,
  MARKET_ALERTS_IMPORT,
  MARKET_ALERTS_LIST,
  MARKET_ALERTS_SAVE,
  MARKET_ALERTS_SET_ENABLED,
  MARKET_ALERTS_STATUS,
  MARKET_ALERTS_TEST_FIRE,
  MARKET_STATS_HISTORY_MERGE,
  MISSION_REWARDS_GET,
  MISSION_REWARDS_PAGE,
  MISSION_REWARDS_UPDATED,
  NOTIFICATION_CHANNELS_CLEAR_WEBHOOK,
  NOTIFICATION_CHANNELS_GET,
  NOTIFICATION_CHANNELS_SET_DISCORD_PING,
  NOTIFICATION_CHANNELS_SET_GAME_GATE,
  NOTIFICATION_CHANNELS_SET_SOURCE,
  NOTIFICATION_CHANNELS_SET_WEBHOOK,
  NOTIFICATION_CHANNELS_TEST,
  NOTIFICATION_HISTORY_ADDED,
  NOTIFICATION_HISTORY_CLEAR,
  NOTIFICATION_HISTORY_GET,
  NOTIFICATION_HISTORY_REMOVE,
  NOTIFICATION_SOUND_GET,
  NOTIFICATION_SOUND_PLAY,
  NOTIFICATION_SOUND_RESET,
  NOTIFICATION_SOUND_SAVE,
  NOTIFICATION_TEST,
  OPEN_EXTERNAL,
  OVERLAY_EDIT_BEGIN,
  OVERLAY_EDIT_END,
  OVERLAY_EDIT_PREVIEW,
  OVERLAY_EDIT_STATE,
  OVERLAY_EDIT_UPDATE,
  OVERLAY_GET_DETECTED_UI_SCALE,
  OVERLAY_GET_SETTINGS,
  OVERLAY_PLACEMENT_LAYOUT,
  OVERLAY_PUSH_RELIC_FILTERS,
  OVERLAY_SAVE_PLACEMENT,
  OVERLAY_SAVE_SCALE,
  OVERLAY_SET_SETTINGS,
  OVERLAY_THEME_UPDATED,
  PERSONAL_PROFILE_GET,
  POPOUT_CLOSE,
  POPOUT_CLOSE_ALL,
  POPOUT_LIST,
  POPOUT_OPEN,
  POPOUT_SET_PINNED,
  POPOUT_STATE_CHANGED,
  PROFILE_ACCOUNT_CHANGED,
  PT_DELETE_LOG,
  PT_DELETE_RUN,
  PT_EXPORT_LOG,
  PT_GET_RUNS,
  PT_IMPORT_LOG,
  PT_REFRESH_RUNS,
  PT_RUN_SAVED,
  PT_SET_NOTES,
  PT_SET_TAGS,
  PT_SHOW_LOG_IN_FOLDER,
  RANKED_HOTSET_LOAD,
  RANKED_HOTSET_SAVE,
  RELIC_DB_UPDATED,
  RIVENS_CREATE_AUCTION,
  RIVENS_DELETE_AUCTION,
  RIVENS_GET,
  RIVENS_GET_BEST_ATTRIBUTES,
  RIVENS_GET_GOOD_ROLL,
  RIVENS_GET_STAT_OPTIONS,
  RIVENS_GET_WEAPON_NAMES,
  RIVENS_GRADE_CONTRACTS,
  RIVENS_REFRESH_GOOD_ROLLS,
  RIVENS_SEARCH_AUCTIONS,
  RIVENS_UPDATE_AUCTION,
  RIVEN_SIMILAR_AUCTIONS,
  SCAN_DEBUG_OPEN_FOLDER,
  SIMULATE_RELIC_TRIGGER,
  SNAPSHOT_CACHE_LOAD,
  SNAPSHOT_CACHE_SAVE,
  SPAWN_NODES_GET,
  STATS_GET_CURRENT,
  STATS_GET_HISTORY,
  STATS_GET_TRADES,
  STATS_IMPORT,
  STATS_IMPORT_TRADES,
  SYSTEM_CONFIRM,
  TOGGLE_OVERLAY,
  TRADE_RECORDED,
  WARFRAME_UI_SCALE_UPDATED,
  WFM_CLOSE_ORDER,
  WFM_CREATE_ORDER,
  WFM_DELETE_ORDER,
  WFM_GET_CONTRACTS,
  WFM_GET_ME,
  WFM_GET_ORDERS,
  WFM_LOOKUP_ITEM,
  WFM_NOTIFICATION,
  WFM_PRESENCE_STATE,
  WFM_SEARCH_ITEMS,
  WFM_SESSION,
  WFM_SET_STATUS,
  WFM_SET_VISIBLE,
  WFM_SIGNIN,
  WFM_SIGNOUT,
  WFM_UPDATE_ORDER,
  WINDOW_CLOSE,
  WINDOW_MAXIMIZE,
  WINDOW_MINIMIZE,
  WORKBENCH_ACK_OVERRIDE,
  WORKBENCH_CANCEL_RUN,
  WORKBENCH_EXECUTE_PLAN,
  WORKBENCH_GET_STATE,
  WORKBENCH_PREVIEW_PLAN,
  WORKBENCH_RECONCILE,
  WORKBENCH_RESOLVE_REVIEW,
  WORKBENCH_STATE_EVENT,
  WORLD_STATE_FETCH_ERROR,
} from "./ipcChannels";
import { event, invoke, send, type InvokeMap } from "./ipcRoute";
import type {
  AppRuntimeInfo,
  AppUpdateCheckResult,
  AppUpdateInstallResult,
  AppUpdateState,
  HelperDownloadProgress,
  InventoryStatus,
  ItemDbLookup,
  MarketAlertStatusPayload,
  RivenContractGradeRequest,
  RivenContractGradesResult,
  RivenGoodRollsResult,
  RivenResult,
  RivenStatOption,
  TradeRecordedEvent,
  WfmItemsLookup,
  WfmNotification,
  WfmRivenListing,
} from "../../src/types/ipc";
import type { MasteryData, RawInventoryData } from "../../src/types/inventory";
import type { RelicDatabase } from "../../src/types/relics";
import type { WorldState } from "../../src/types/world";
import type {
  WfmCloseResult,
  WfmContractsQuery,
  WfmContractsResult,
  WfmCreateOrderInput,
  WfmDeleteResult,
  WfmLookupItem,
  WfmMutationError,
  WfmOrder,
  WfmOrdersResult,
  WfmPresenceState,
  WfmSearchItem,
  WfmSession,
  WfmStatus,
  WfmStatusResult,
  WfmUpdateOrderInput,
  WfmUserProfile,
} from "../../src/types/market";
import type { MarketStatPoint, MarketStatsMergeMode } from "./marketStats";
import type { AdvisorFaction, GunBuildReview, OwnedGunSummary } from "./buildAdvisorTypes";
import type { DropRow, DropSearchMode, DropSearchResult } from "./dropTypes";
import type { SpawnNode } from "./spawnNodeTypes";
import type {
  WorkbenchExecuteResult,
  WorkbenchOverrideAck,
  WorkbenchPlan,
  WorkbenchPlanValidation,
  WorkbenchResolveReviewPayload,
  WorkbenchReviewReport,
  WorkbenchSafetySnapshot,
  WorkbenchState,
} from "./tradeWorkbenchTypes";
import type {
  LedgerErrorCode,
  LedgerEventPatch,
  LedgerExportOptions,
  LedgerImportPreview,
  LedgerImportResult,
  LedgerPage,
  LedgerQuery,
} from "./tradeLedgerTypes";
import type { PopoutOpenOptions, PopoutTarget, PopoutView, PopoutWindowInfo } from "./popoutTypes";
import type { RelicDataInfo } from "./relicDataInfo";
import type { RelicOverlayFilterPush } from "./relicPlannerView";
import type { HelperStatus } from "./apiHelperTypes";
import type { CodexScansResult } from "./codexTypes";
import type { InventoryExportError, InventorySource } from "./inventorySource";
import type { DisplayPreference, LinuxCaptureSetupResult, LinuxDisplayInfo } from "./linuxDisplay";
import type {
  NotificationChannelState,
  NotificationEntry,
  NotificationSource,
  SetDiscordPingResult,
  SetWebhookResult,
  SourceChannelToggles,
  WebhookChannel,
  WebhookTestResult,
} from "./notifications";
import type {
  MarketAlertHit,
  MarketAlertImportOutcome,
  MarketAlertListResult,
  MarketAlertSavePayload,
  MarketAlertSaveResult,
  MarketAlertTestFireResult,
} from "./marketAlertTypes";
import type { OverlaySettings, OverlayWindowKey } from "../runtime/overlaySettings";
import type { CreateRivenAuctionPayload, UpdateRivenAuctionPayload } from "./rivenTypes";
import type { RivenGoodRoll } from "./rivenGoodRolls";
import type {
  OverlayDescriptor,
  OverlayEditCommand,
  OverlayEditState,
  OverlayFieldStyle,
  OverlayLayoutKind,
} from "./overlayLayout";
import type { RewardPresentation } from "./rewardPresentation";
import type { DailyStatEntry, SessionStats, TradeEvent } from "./statsTypes";
import type { ArbiImportResult, ArbiRunRecord, ArbiRunsPayload } from "./arbiTypes";
import type { ArbiScheduleAlerts, ArbiSchedulePayload } from "./arbiScheduleTypes";
import type { PtImportResult, PtRunRecord, PtRunsPayload } from "./profitTakerTypes";
import type {
  MissionRewardsPage,
  MissionRewardsPayload,
  MissionRewardsQuery,
} from "./missionRewardsTypes";
import type { PersonalProfileResult } from "./personalProfile";
import type {
  NotificationSoundAsset,
  NotificationSoundPlayback,
  NotificationSoundUpload,
} from "./notificationSound";
import type { FeedbackReport, FeedbackResult } from "./feedback";

type Wfm<T> = T | WfmMutationError;
type Ok = { ok: boolean };

/** `window.api`: everything the main window and its popouts may call. */
const api = {
  getFeedbackContext: invoke(FEEDBACK_CONTEXT, "main").of<
    [],
    { appVersion: string; platform: string; diagnostics: { osVersion: string; arch: string } }
  >(),
  submitFeedback: invoke(FEEDBACK_SUBMIT, "main").of<[report: FeedbackReport], FeedbackResult>(),

  getInventory: invoke(INVENTORY_GET, "main").of<[], RawInventoryData | null>(),
  openInventoryFile: invoke(INVENTORY_OPEN_FILE, "main").of<
    [source: Exclude<InventorySource, "aleca">],
    RawInventoryData | null
  >(),
  openAlecaFrameInventoryFile: invoke(INVENTORY_OPEN_ALECA_FRAME_FILE, "main").of<
    [],
    RawInventoryData | null
  >(),
  getInventoryStatus: invoke(INVENTORY_GET_STATUS, "main").of<[], InventoryStatus>(),
  setInventorySource: invoke(INVENTORY_SET_SOURCE, "main").of<
    [source: InventorySource],
    { source: InventorySource }
  >(),
  exportInventory: invoke(INVENTORY_EXPORT, "main").of<
    [],
    { saved: boolean; path?: string; error?: InventoryExportError }
  >(),

  getItemDatabase: invoke(DB_GET_ITEM_DATABASE, "main").of<[], ItemDbLookup>(),
  getWorldState: invoke(DB_GET_WORLD_STATE, "main").of<[], WorldState | null>(),
  getRelicDatabase: invoke(DB_GET_RELIC_DATABASE, "main").of<[], RelicDatabase | null>(),
  getRelicDataInfo: invoke(DB_GET_RELIC_DATA_INFO, "main").of<[], RelicDataInfo>(),
  getWfmItems: invoke(DB_GET_WFM_ITEMS, "main").of<[], WfmItemsLookup>(),

  wfmSignIn: invoke(WFM_SIGNIN, "main").of<[{ email: string; password: string }], WfmSession>(),
  wfmSignOut: invoke(WFM_SIGNOUT, "main").of<[], { loggedIn: false }>(),
  wfmGetSession: invoke(WFM_SESSION, "main").of<[], WfmSession>(),
  wfmGetOrders: invoke(WFM_GET_ORDERS, "main").of<[], Wfm<WfmOrdersResult>>(),
  wfmGetContracts: invoke(WFM_GET_CONTRACTS, "main").of<
    [query?: WfmContractsQuery],
    Wfm<WfmContractsResult>
  >(),
  wfmSearchItems: invoke(WFM_SEARCH_ITEMS, "main").of<
    [query: string, limit?: number],
    Wfm<WfmSearchItem[]>
  >((query, limit) => ({ query, limit })),
  wfmLookupItemBySlug: invoke(WFM_LOOKUP_ITEM, "main").of<[slug: string], Wfm<WfmLookupItem>>(
    (slug) => ({ slug }),
  ),
  marketStatsHistoryMerge: invoke(MARKET_STATS_HISTORY_MERGE, "main").of<
    [slug: string, points: MarketStatPoint[], mode?: MarketStatsMergeMode],
    MarketStatPoint[] | null
  >((slug, points, mode) => ({ slug, points, mode })),
  wfmGetMe: invoke(WFM_GET_ME, "main").of<[], Wfm<WfmUserProfile> | null>(),
  wfmPresenceState: invoke(WFM_PRESENCE_STATE, "main").of<[], WfmPresenceState>(),

  getMasteryProgress: invoke(DB_GET_MASTERY, "main").of<[], MasteryData | null>(),
  getPersonalProfile: invoke(PERSONAL_PROFILE_GET, "main").of<
    [refresh?: boolean],
    PersonalProfileResult
  >(),
  getCodexScans: invoke(DB_GET_CODEX_SCANS, "main").of<[force?: boolean], CodexScansResult>(),
  getOverlayPlacementLayout: invoke(OVERLAY_PLACEMENT_LAYOUT, "main").of<
    [],
    {
      area: { width: number; height: number };
      overlays: Record<
        OverlayWindowKey,
        { x: number; y: number; width: number; height: number; scale: number }
      >;
    }
  >(),
  saveOverlayPlacement: invoke(OVERLAY_SAVE_PLACEMENT, "main").of<
    [key: OverlayWindowKey, pos: { xFrac: number; yFrac: number }],
    Ok
  >(),
  saveOverlayScale: invoke(OVERLAY_SAVE_SCALE, "main").of<
    [key: OverlayWindowKey, scale: number],
    Ok
  >(),
  searchDrops: invoke(DROP_SEARCH, "main").of<
    [query: string, mode: DropSearchMode],
    DropSearchResult
  >((query, mode) => ({ query, mode })),
  dropSourcesForItem: invoke(DROP_ITEM_SOURCES, "main").of<[name: string], DropRow[]>(),
  getSpawnNodes: invoke(SPAWN_NODES_GET, "main").of<[], SpawnNode[]>(),
  confirmDialog: invoke(SYSTEM_CONFIRM, "main").of<
    [payload: { message: string; okLabel: string; cancelLabel: string }],
    boolean
  >(),
  checkForAppUpdates: invoke(APP_UPDATE_CHECK, "main").of<[], AppUpdateCheckResult>(),
  getAppUpdateState: invoke(APP_UPDATE_STATE, "main").of<[], AppUpdateState>(),
  downloadAppUpdate: invoke(APP_UPDATE_DOWNLOAD, "main").of<[], AppUpdateCheckResult>(),
  installDownloadedUpdate: invoke(APP_UPDATE_INSTALL, "main").of<[], AppUpdateInstallResult>(),
  getAppRuntimeInfo: invoke(APP_RUNTIME_INFO, "main").of<[], AppRuntimeInfo>(),
  openScanDebugFolder: invoke(SCAN_DEBUG_OPEN_FOLDER, "main").of<[], Ok>(),
  openLogFolder: invoke(LOGS_OPEN_FOLDER, "main").of<[], Ok>(),

  onInventoryUpdated: event(INVENTORY_UPDATED).of<[data: RawInventoryData | null]>(),
  onProfileAccountChanged: event(PROFILE_ACCOUNT_CHANGED).of<[]>(),
  onInventoryStatusUpdated: event(INVENTORY_STATUS_UPDATED).of<[status: InventoryStatus]>(),
  onItemDbUpdated: event(ITEM_DB_UPDATED).of<[]>(),
  onRelicDbUpdated: event(RELIC_DB_UPDATED).of<[]>(),
  onAppUpdateStatus: event(APP_UPDATE_STATUS).of<[state: AppUpdateState]>(),
  onWfmNotification: event(WFM_NOTIFICATION).of<[notification: WfmNotification]>(),
  onTradeRecorded: event(TRADE_RECORDED).of<[data: TradeRecordedEvent]>(),
  onWorldStateFetchError: event(WORLD_STATE_FETCH_ERROR).of<[message: string]>(),

  minimizeWindow: send(WINDOW_MINIMIZE, "main").of<[]>(),
  maximizeWindow: send(WINDOW_MAXIMIZE, "main").of<[]>(),
  closeWindow: send(WINDOW_CLOSE, "main").of<[]>(),

  toggleOverlay: send(TOGGLE_OVERLAY, "main").of<[]>(),
  simulateRelicTrigger: send(SIMULATE_RELIC_TRIGGER, "main").of<[]>(),
  updateOverlayTheme: send(OVERLAY_THEME_UPDATED, "main").of<[themeVars: Record<string, string>]>(),
  updateGameLocale: send(GAME_LOCALE_UPDATED, "main").of<[locale: string]>(),
  pushRelicFilters: send(OVERLAY_PUSH_RELIC_FILTERS, "main").of<
    [filters: RelicOverlayFilterPush]
  >(),
  getLinuxDisplay: invoke(LINUX_DISPLAY_GET, "main").of<[], LinuxDisplayInfo>(),
  setLinuxDisplay: invoke(LINUX_DISPLAY_SET, "main").of<
    [preference: DisplayPreference],
    LinuxDisplayInfo
  >(),
  setUpLinuxCapture: invoke(LINUX_CAPTURE_SETUP, "main").of<[], LinuxCaptureSetupResult>(),
  getOverlaySettings: invoke(OVERLAY_GET_SETTINGS, "main").of<[], OverlaySettings>(),
  beginOverlayEdit: invoke(OVERLAY_EDIT_BEGIN, "main").of<
    [kind: OverlayLayoutKind],
    OverlayEditState
  >(),
  getOverlayPreview: invoke(OVERLAY_EDIT_PREVIEW, "main").of<
    [kind: OverlayLayoutKind],
    {
      url: string;
      theme: Record<string, string>;
      messages: { locale: string; messages: Record<string, string> };
      defaultFieldStyle: OverlayFieldStyle;
      descriptor: OverlayDescriptor;
      canvas: { width: number; height: number };
      lastReward: RewardPresentation | null;
    }
  >(),
  updateOverlayEdit: invoke(OVERLAY_EDIT_UPDATE, "main").of<
    [sessionId: string, command: OverlayEditCommand],
    OverlayEditState
  >(),
  endOverlayEdit: invoke(OVERLAY_EDIT_END, "main").of<
    [sessionId: string, save: boolean],
    { ok: true }
  >(),
  onOverlayEditState: event(OVERLAY_EDIT_STATE).of<[state: OverlayEditState]>(),
  setOverlaySettings: invoke(OVERLAY_SET_SETTINGS, "main").of<
    [settings: Partial<OverlaySettings>],
    OverlaySettings
  >(),
  getDetectedWarframeUiScale: invoke(OVERLAY_GET_DETECTED_UI_SCALE, "main").of<[], number | null>(),

  openExternal: send(OPEN_EXTERNAL, "main").of<[url: string]>(),
  logWarn: send(LOG_WARN, "main").of<[message: string, ...args: unknown[]]>(),

  getNotificationSound: invoke(NOTIFICATION_SOUND_GET, "main").of<
    [],
    NotificationSoundAsset | null
  >(),
  saveNotificationSound: invoke(NOTIFICATION_SOUND_SAVE, "main").of<
    [sound: NotificationSoundUpload],
    NotificationSoundAsset
  >(),
  resetNotificationSound: invoke(NOTIFICATION_SOUND_RESET, "main").of<[], null>(),
  getNotificationHistory: invoke(NOTIFICATION_HISTORY_GET, "main").of<[], NotificationEntry[]>(),
  clearNotificationHistory: invoke(NOTIFICATION_HISTORY_CLEAR, "main").of<[], void>(),
  removeNotificationEntry: invoke(NOTIFICATION_HISTORY_REMOVE, "main").of<[id: string], boolean>(),
  sendTestNotification: invoke(NOTIFICATION_TEST, "main").of<[], boolean>(),
  onNotificationHistoryAdded: event(NOTIFICATION_HISTORY_ADDED).of<[entry: NotificationEntry]>(),
  onMarketAlertsChanged: event(MARKET_ALERTS_CHANGED).of<[]>(),
  onNotificationSoundPlay:
    event(NOTIFICATION_SOUND_PLAY).of<[payload: NotificationSoundPlayback]>(),

  getNotificationChannels: invoke(NOTIFICATION_CHANNELS_GET, "main").of<
    [],
    NotificationChannelState
  >(),
  setNotificationWebhook: invoke(NOTIFICATION_CHANNELS_SET_WEBHOOK, "main").of<
    [channel: WebhookChannel, url: string],
    SetWebhookResult
  >(),
  clearNotificationWebhook: invoke(NOTIFICATION_CHANNELS_CLEAR_WEBHOOK, "main").of<
    [channel: WebhookChannel],
    NotificationChannelState
  >(),
  setNotificationSourceChannels: invoke(NOTIFICATION_CHANNELS_SET_SOURCE, "main").of<
    [source: NotificationSource, toggles: SourceChannelToggles],
    NotificationChannelState
  >(),
  setNotificationGameGate: invoke(NOTIFICATION_CHANNELS_SET_GAME_GATE, "main").of<
    [enabled: boolean],
    NotificationChannelState
  >(),
  setNotificationDiscordPing: invoke(NOTIFICATION_CHANNELS_SET_DISCORD_PING, "main").of<
    [userId: string],
    SetDiscordPingResult
  >(),
  testNotificationWebhook: invoke(NOTIFICATION_CHANNELS_TEST, "main").of<
    [channel: WebhookChannel],
    WebhookTestResult
  >(),

  marketAlertsList: invoke(MARKET_ALERTS_LIST, "main").of<[], MarketAlertListResult>(),
  marketAlertsSave: invoke(MARKET_ALERTS_SAVE, "main").of<
    [payload: MarketAlertSavePayload],
    MarketAlertSaveResult
  >(),
  marketAlertsDelete: invoke(MARKET_ALERTS_DELETE, "main").of<[id: string], Ok>(),
  marketAlertsSetEnabled: invoke(MARKET_ALERTS_SET_ENABLED, "main").of<
    [id: string, enabled: boolean],
    Ok
  >(),
  marketAlertsClearCooldown: invoke(MARKET_ALERTS_CLEAR_COOLDOWN, "main").of<[id: string], Ok>(),
  marketAlertsGetHits: invoke(MARKET_ALERTS_HITS, "main").of<[], MarketAlertHit[]>(),
  marketAlertsClearHits: invoke(MARKET_ALERTS_CLEAR_HITS, "main").of<[], Ok>(),
  marketAlertsStatus: invoke(MARKET_ALERTS_STATUS, "main").of<[], MarketAlertStatusPayload>(),
  marketAlertsTestFire: invoke(MARKET_ALERTS_TEST_FIRE, "main").of<
    [id: string],
    MarketAlertTestFireResult
  >(),
  marketAlertsExport: invoke(MARKET_ALERTS_EXPORT, "main").of<[ids?: string[]], string>(),
  marketAlertsImport: invoke(MARKET_ALERTS_IMPORT, "main").of<
    [text: string],
    MarketAlertImportOutcome
  >(),

  loadRankedHotset: invoke(RANKED_HOTSET_LOAD, "main").of<[], Record<string, unknown> | null>(),
  saveRankedHotset: invoke(RANKED_HOTSET_SAVE, "main").of<[data: Record<string, unknown>], Ok>(),
  loadSnapshotCache: invoke(SNAPSHOT_CACHE_LOAD, "main").of<[], Record<string, unknown> | null>(),
  saveSnapshotCache: invoke(SNAPSHOT_CACHE_SAVE, "main").of<[data: Record<string, unknown>], Ok>(),

  getStatsHistory: invoke(STATS_GET_HISTORY, "main").of<[], DailyStatEntry[]>(),
  getStatsCurrentSession: invoke(STATS_GET_CURRENT, "main").of<[], SessionStats>(),
  importStatsHistory: invoke(STATS_IMPORT, "main").of<
    [raw: unknown[]],
    { ok: boolean; count: number }
  >(),
  getTradeLog: invoke(STATS_GET_TRADES, "main").of<[], TradeEvent[]>(),
  importTradeLog: invoke(STATS_IMPORT_TRADES, "main").of<
    [events: TradeEvent[]],
    { ok: boolean; count: number }
  >(),

  getHelperStatus: invoke(HELPER_GET_STATUS, "main").of<[], HelperStatus>(),
  runHelperNow: invoke(HELPER_RUN_NOW, "main").of<[], Ok>(),
  downloadHelper: invoke(HELPER_DOWNLOAD, "main").of<[], { ok: boolean; error?: string }>(),
  getBuildAdvisorGuns: invoke(BUILD_ADVISOR_GUNS, "main").of<[], OwnedGunSummary[]>(),
  reviewGunBuild: invoke(BUILD_ADVISOR_REVIEW, "main").of<
    [
      weaponType: string,
      assumeConditionals: boolean,
      faction: AdvisorFaction | null,
      respectCapacity: boolean,
    ],
    GunBuildReview
  >(),
  getRivens: invoke(RIVENS_GET, "main").of<[], RivenResult>(),
  getRivenWeaponNames: invoke(RIVENS_GET_WEAPON_NAMES, "main").of<
    [rivenMarketOnly?: boolean],
    string[]
  >(),
  getRivenStatOptions: invoke(RIVENS_GET_STAT_OPTIONS, "main").of<[], RivenStatOption[]>(),
  searchRivenAuctions: invoke(RIVENS_SEARCH_AUCTIONS, "main").of<
    [weaponName: string, positiveWfmNames: string[], negativeWfmNames: string[]],
    WfmRivenListing[]
  >(),
  getRivenBestAttributes: invoke(RIVENS_GET_BEST_ATTRIBUTES, "main").of<
    [weaponName: string],
    RivenGoodRollsResult
  >(),
  getRivenGoodRoll: invoke(RIVENS_GET_GOOD_ROLL, "main").of<
    [weaponName: string],
    RivenGoodRoll | null
  >(),
  refreshRivenGoodRolls: invoke(RIVENS_REFRESH_GOOD_ROLLS, "main").of<
    [weaponName: string],
    RivenGoodRollsResult
  >(),
  gradeRivenContracts: invoke(RIVENS_GRADE_CONTRACTS, "main").of<
    [contracts: RivenContractGradeRequest[]],
    RivenContractGradesResult
  >(),
  onHelperDownloadProgress:
    event(HELPER_DOWNLOAD_PROGRESS).of<[progress: HelperDownloadProgress]>(),

  getArbiRuns: invoke(ARBI_GET_RUNS, "main").of<[], ArbiRunsPayload>(),
  refreshArbiRuns: invoke(ARBI_REFRESH_RUNS, "main").of<[], ArbiRunsPayload>(),
  setArbiRunVitus: invoke(ARBI_SET_VITUS, "main").of<
    [id: string, vitus: number | null],
    ArbiRunRecord | null
  >(),
  setArbiRunTags: invoke(ARBI_SET_TAGS, "main").of<
    [id: string, tags: string[]],
    ArbiRunRecord | null
  >(),
  setArbiRunNotes: invoke(ARBI_SET_NOTES, "main").of<
    [id: string, notes: string],
    ArbiRunRecord | null
  >(),
  deleteArbiRun: invoke(ARBI_DELETE_RUN, "main").of<[id: string], Ok>(),
  deleteArbiRunLog: invoke(ARBI_DELETE_LOG, "main").of<[id: string], ArbiRunRecord | null>(),
  exportArbiRunLog: invoke(ARBI_EXPORT_LOG, "main").of<[id: string], Ok>(),
  importArbiLog: invoke(ARBI_IMPORT_LOG, "main").of<[], ArbiImportResult>(),
  saveArbiRunImage: invoke(ARBI_SAVE_IMAGE, "main").of<[id: string, png: Uint8Array], Ok>(),
  showArbiRunLogInFolder: invoke(ARBI_SHOW_LOG_IN_FOLDER, "main").of<[id: string], Ok>(),
  onArbiRunSaved: event(ARBI_RUN_SAVED).of<[run: ArbiRunRecord]>(),
  onWarframeUiScaleUpdated: event(WARFRAME_UI_SCALE_UPDATED).of<[scale: number | null]>(),
  onRivenSimilarAuctions: event(RIVEN_SIMILAR_AUCTIONS).of<[shown: boolean]>(),
  onArbiOpenRun: event(ARBI_OPEN_RUN).of<[runId: string]>(),

  getPtRuns: invoke(PT_GET_RUNS, "main").of<[], PtRunsPayload>(),
  refreshPtRuns: invoke(PT_REFRESH_RUNS, "main").of<[], PtRunsPayload>(),
  setPtRunTags: invoke(PT_SET_TAGS, "main").of<[id: string, tags: string[]], PtRunRecord | null>(),
  setPtRunNotes: invoke(PT_SET_NOTES, "main").of<[id: string, notes: string], PtRunRecord | null>(),
  deletePtRun: invoke(PT_DELETE_RUN, "main").of<[id: string], Ok>(),
  deletePtRunLog: invoke(PT_DELETE_LOG, "main").of<[id: string], PtRunRecord | null>(),
  exportPtRunLog: invoke(PT_EXPORT_LOG, "main").of<[id: string], Ok>(),
  importPtLog: invoke(PT_IMPORT_LOG, "main").of<[], PtImportResult>(),
  showPtRunLogInFolder: invoke(PT_SHOW_LOG_IN_FOLDER, "main").of<[id: string], Ok>(),
  onPtRunSaved: event(PT_RUN_SAVED).of<[run: PtRunRecord]>(),

  getMissionRewards: invoke(MISSION_REWARDS_GET, "main").of<[], MissionRewardsPayload>(),
  getMissionRewardsPage: invoke(MISSION_REWARDS_PAGE, "main").of<
    [query: MissionRewardsQuery],
    MissionRewardsPage | null
  >(),
  onMissionRewardsUpdated: event(MISSION_REWARDS_UPDATED).of<[payload: MissionRewardsPayload]>(),

  workbenchGetState: invoke(WORKBENCH_GET_STATE, "main").of<[], WorkbenchState>(),
  workbenchPreviewPlan: invoke(WORKBENCH_PREVIEW_PLAN, "main").of<
    [plan: WorkbenchPlan, safety: WorkbenchSafetySnapshot],
    Wfm<WorkbenchPlanValidation>
  >(),
  workbenchCancelRun: invoke(WORKBENCH_CANCEL_RUN, "main").of<[], WorkbenchState>(),
  workbenchAcknowledgeOverride: invoke(WORKBENCH_ACK_OVERRIDE, "main").of<
    [ack: WorkbenchOverrideAck],
    Wfm<WorkbenchState>
  >(),
  workbenchReconcile: invoke(WORKBENCH_RECONCILE, "main").of<[], Wfm<WorkbenchReviewReport>>(),
  workbenchResolveReview: invoke(WORKBENCH_RESOLVE_REVIEW, "main").of<
    [payload: WorkbenchResolveReviewPayload],
    Wfm<WorkbenchState>
  >(),
  onWorkbenchState: event(WORKBENCH_STATE_EVENT).of<[state: WorkbenchState]>(),

  ledgerQuery: invoke(LEDGER_QUERY, "main").of<[query: LedgerQuery], LedgerPage>(),
  ledgerImportPreview: invoke(LEDGER_IMPORT_PREVIEW, "main").of<
    [],
    LedgerImportPreview | { error: LedgerErrorCode }
  >(),
  ledgerImportApply: invoke(LEDGER_IMPORT_APPLY, "main").of<
    [batchId: string],
    LedgerImportResult
  >(),
  ledgerUpdateEvent: invoke(LEDGER_UPDATE_EVENT, "main").of<
    [id: string, patch: LedgerEventPatch],
    { ok: boolean; error?: LedgerErrorCode }
  >(),
  ledgerExport: invoke(LEDGER_EXPORT, "main").of<
    [options: LedgerExportOptions],
    { saved: boolean; path?: string; error?: LedgerErrorCode }
  >(),
  popoutOpen: invoke(POPOUT_OPEN, "main").of<
    [target: PopoutTarget | PopoutView, options?: PopoutOpenOptions],
    Ok
  >(),
  /** Only a popout may pin itself, never the main window. */
  popoutSetPinned: invoke(POPOUT_SET_PINNED, "popout").of<[pinned: boolean], Ok>(),
  popoutList: invoke(POPOUT_LIST, "main").of<[], PopoutWindowInfo[]>(),
  popoutClose: invoke(POPOUT_CLOSE, "main").of<[target: PopoutTarget], Ok>(),
  popoutCloseAll: invoke(POPOUT_CLOSE_ALL, "main").of<[], { ok: boolean; closed: number }>(),
  onPopoutStateChanged: event(POPOUT_STATE_CHANGED).of<[windows: PopoutWindowInfo[]]>(),

  getArbiSchedule: invoke(ARBI_SCHED_GET, "main").of<[], ArbiSchedulePayload>(),
  setArbiScheduleOccurrence: invoke(ARBI_SCHED_SET_OCCURRENCE, "main").of<
    [key: string, enabled: boolean],
    ArbiScheduleAlerts | null
  >(),
  setArbiScheduleFavorite: invoke(ARBI_SCHED_SET_FAVORITE, "main").of<
    [nodeId: string, enabled: boolean],
    ArbiScheduleAlerts | null
  >(),
  setArbiScheduleLead: invoke(ARBI_SCHED_SET_LEAD, "main").of<
    [minutes: number],
    ArbiScheduleAlerts | null
  >(),

  notifySelectionComplete: invoke(INVENTORY_SELECTION_COMPLETE, "main").of<
    [payload: { name: string; owned: number }],
    boolean
  >(),
};

/** `window.tradeApi`: calls that change warframe.market orders, auctions or trades. */
const tradeApi = {
  wfmCreateOrder: invoke(WFM_CREATE_ORDER, "main").of<[WfmCreateOrderInput], Wfm<WfmOrder>>(),
  wfmUpdateOrder: invoke(WFM_UPDATE_ORDER, "main").of<
    [orderId: string, updates: WfmUpdateOrderInput],
    Wfm<WfmOrder>
  >((orderId, updates) => ({ orderId, updates })),
  wfmDeleteOrder: invoke(WFM_DELETE_ORDER, "main").of<[orderId: string], Wfm<WfmDeleteResult>>(
    (orderId) => ({ orderId }),
  ),
  wfmCloseOrder: invoke(WFM_CLOSE_ORDER, "main").of<
    [orderId: string, quantity: number],
    Wfm<WfmCloseResult>
  >((orderId, quantity) => ({ orderId, quantity })),
  wfmSetVisible: invoke(WFM_SET_VISIBLE, "main").of<
    [orderIds: string[], visible: boolean],
    Wfm<Array<WfmOrder | WfmMutationError>>
  >((orderIds, visible) => ({ orderIds, visible })),
  wfmSetStatus: invoke(WFM_SET_STATUS, "main").of<[status: WfmStatus], Wfm<WfmStatusResult>>(
    (status) => ({ status }),
  ),
  createRivenAuction: invoke(RIVENS_CREATE_AUCTION, "main").of<
    [payload: CreateRivenAuctionPayload],
    { ok: boolean; auctionId?: string; error?: string }
  >(),
  updateRivenAuction: invoke(RIVENS_UPDATE_AUCTION, "main").of<
    [payload: UpdateRivenAuctionPayload],
    { ok: boolean; auctionId?: string; error?: string }
  >(),
  deleteRivenAuction: invoke(RIVENS_DELETE_AUCTION, "main").of<
    [payload: { auctionId: string }],
    { ok: boolean; error?: string }
  >(),
  workbenchExecutePlan: invoke(WORKBENCH_EXECUTE_PLAN, "main").of<
    [plan: WorkbenchPlan, safety: WorkbenchSafetySnapshot],
    WorkbenchExecuteResult
  >(),
};

export const mainWindowRoutes = { api, tradeApi };

export type ApiRoutes = typeof api;
export type TradeApiRoutes = typeof tradeApi;

/** `{ method: { args, return } }` for every call the main window can make. */
export type IpcInvokeMap = InvokeMap<ApiRoutes> & InvokeMap<TradeApiRoutes>;
