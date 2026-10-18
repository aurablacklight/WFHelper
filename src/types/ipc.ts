import type { ItemDbEntry } from "./inventory.js";
import type { WfmPresenceState } from "./market.js";
import type { InventorySource } from "../../config/shared/inventorySource.js";
import type { MarketAlertEngineStatus } from "../../config/shared/marketAlertTypes.js";

export type { HelperStatus } from "../../config/shared/apiHelperTypes.js";
export type { InventorySource } from "../../config/shared/inventorySource.js";
export type {
  FissureAlert,
  OverlaySettings,
  OverlayWindowKey,
} from "../../config/runtime/overlaySettings.js";

type AppUpdateStatus =
  | "idle"
  | "disabled"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "downloaded"
  | "installing"
  | "error";

export interface AppUpdateState {
  status: AppUpdateStatus;
  message?: string;
  version?: string | null;
  releaseName?: string | null;
  releaseDate?: string | null;
  releaseNotes?: string | null;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  timestamp: number;
}

export interface AppUpdateCheckResult {
  ok: boolean;
  source?: string;
  message?: string;
  state: AppUpdateState;
}

export interface AppUpdateInstallResult {
  ok: boolean;
  message?: string;
}

export interface AppRuntimeInfo {
  isPackaged: boolean;
}

interface InventoryReadError {
  kind: "parse" | "read" | "watch";
  message: string;
  path: string;
  at: number;
}

export interface InventoryStatus {
  path: string | null;
  found: boolean;
  source: InventorySource;
  modifiedAt: number | null;
  lastError?: InventoryReadError | null;
}

export interface HelperDownloadProgress {
  stage: DownloadStage;
  percent: number;
  bytesReceived: number;
  bytesTotal: number;
  error?: string;
}

export type WfmItemsLookup = Record<
  string,
  {
    url_name: string;
    item_name?: string;
    thumb?: string | null;
    icon?: string | null;
    maxRank?: number | null;
    gameRef?: string | null;
  }
>;
export type ItemDbLookup = Record<string, ItemDbEntry>;

import type {
  DecodedRiven,
  VeiledRivenEntry,
  VeiledRivenGroup,
} from "../../config/shared/rivenTypes.js";
export type { DecodedRiven, VeiledRivenEntry, VeiledRivenGroup };

import type {
  RivenGoodRollAttribute,
  RivenGoodRollGroup,
} from "../../config/shared/rivenGoodRolls.js";
export type { RivenGoodRollAttribute, RivenGoodRollGroup };

export interface MarketAlertStatusPayload extends MarketAlertEngineStatus {
  /** Rule id to cooldown end, epoch ms; a rule not in cooldown is absent. */
  cooldowns: Record<string, number>;
}

export interface RivenStatOption {
  tag: string;
  wfmUrlName: string;
  displayName: string;
}

export interface RivenBestAttributes {
  positives: string[];
  negatives: string[];
}

export interface RivenGoodRollsResult {
  attributes: RivenBestAttributes | null;
  /** ISO time the 44bananas sheet was last fetched; null when never cached. */
  updatedAt: string | null;
}

export interface RivenResult {
  unveiled: DecodedRiven[];
  veiled: VeiledRivenEntry[];
  veiledUnseen: VeiledRivenGroup[];
}

/** One warframe.market contract, as the grader reads it: the weapon by name or
 *  family slug, each attribute by WFM url_name or label at its listed value. */
export interface RivenContractGradeRequest {
  weaponName: string;
  /** The listing's mod rank (0-8). Values scale with it. */
  modRank: number | null;
  stats: { name: string; positive: boolean; value: number | null }[];
}

export interface RivenContractGrade {
  overallGrade: string;
  /** "?" when the community sheet has no row for the weapon. */
  attributeGrade: string;
  /** Aligned with the request's stats. */
  stats: { grade: string; rollFloat: number }[];
}

export interface RivenContractGradesResult {
  /** One entry per request, aligned by index. */
  grades: (RivenContractGrade | null)[];
  /** False while the community sheet is still loading: the roll grades stand,
   *  but every "?" attribute grade in this answer is provisional. */
  sheetReady: boolean;
}

export interface WfmRivenListing {
  id: string;
  seller: string;
  sellerStatus: string | null;
  platinum: number;
  stats: { name: string; value: number; positive: boolean }[];
  rerolls: number;
  startingPrice: number | null;
  buyoutPrice: number | null;
  isDirectSell: boolean;
}

export type WfmNotification =
  | { type: "whisper" | "trade"; from: string; content: string }
  // The persistent WS listener gave up after repeated sign-in rejections;
  // the session token is dead and the user must log in again.
  | { type: "listener-auth-failed" }
  // WFM pushed an order/auction change made elsewhere (website, another client).
  | { type: "orders-changed" }
  | ({ type: "presence" } & WfmPresenceState);

import type {
  DailyStatEntry,
  DownloadStage,
  SessionStats,
  TradeEvent,
  TradeItem,
  TradeType,
} from "../../config/shared/statsTypes.js";
import type { TradeMatchPayload } from "../../config/shared/tradeMatch.js";
export type { DailyStatEntry, SessionStats, TradeEvent, TradeItem, TradeType };

import type {
  ArbiMissionType,
  ArbiRunRecord,
  ArbiRunStats,
} from "../../config/shared/arbiTypes.js";
export type { ArbiMissionType, ArbiRunRecord, ArbiRunStats };
import type {
  ArbiScheduleAlerts,
  ArbiScheduleEntry,
} from "../../config/shared/arbiScheduleTypes.js";
export type { ArbiScheduleAlerts, ArbiScheduleEntry };

import type { PtRunRecord } from "../../config/shared/profitTakerTypes.js";
export type { PtRunRecord };

export type {
  MissionRewardItem,
  MissionRewardSummaryView,
  MissionRewardsPage,
  MissionRewardsPayload,
  MissionRewardsQuery,
} from "../../config/shared/missionRewardsTypes.js";

type WfmTradeMatchEvent = TradeMatchPayload;

export interface TradeRecordedEvent {
  trade: TradeEvent;
  wfmMatches: WfmTradeMatchEvent[];
}
