import type { InventoryBaseItem } from "../../lib/inventoryMarket.js";
import { getCachedMedian, getCachedPriceState } from "../../lib/wfm/priceCache.js";
import {
  ORDER_SUMMARY_FRESH_TTL_MS,
  readCachedOrderSummary,
} from "../../lib/wfm/orderSummaryCache.js";
import {
  isRankedGroup,
  normalizeDucats,
  normalizeRank,
  resolveRankedMaxRank as resolveRankedMaxRankForGroup,
  toFiniteNumber,
} from "../../../config/shared/numeric.js";
import { rendererPriceCacheKey } from "../../../config/shared/wfmCacheKeys.js";
import { isExcludedRankedMarketItem } from "../../../config/shared/wfmExclusions.js";
import { MAX_DUCAT_RETRY_PER_ITEM } from "./hydrationTypes.js";

/**
 * Row price state: what each market-derived field of one inventory row holds
 * and how it got there. This module owns the only skip-or-fetch decision
 * (`planRowFetch`); callers say what they need and whether the row is
 * visible, never whether the network may be used.
 */

type FieldStatus = "untried" | "ok" | "no_data" | "failed";

export interface FieldState<T> {
  value: T;
  status: FieldStatus;
  /** When the status was last decided; null while untried. */
  at: number | null;
  /** Earliest time a fetch may run again; null when no cooldown applies. */
  retryAt: number | null;
}

export interface OrderPair {
  wts: number | null;
  wtb: number | null;
}

interface IconPair {
  thumb: string | null;
  icon: string | null;
}

export interface RowPriceState {
  slug: string | null;
  /** Price at the row's own rank (rank null for unranked rows). */
  price: FieldState<number | null> & { rank: number | null };
  priceR0: FieldState<number | null>;
  priceRmax: FieldState<number | null>;
  ordersR0: FieldState<OrderPair>;
  ordersRmax: FieldState<OrderPair>;
  ducats: FieldState<number | null> & { attempts: number };
  icon: FieldState<IconPair>;
}

/** Which optional fields a caller wants; price is always wanted. */
export interface RowFields {
  orders: boolean;
  ducats: boolean;
}

/** A visible row may fetch; a background row only reads the snapshot caches. */
export interface RowIntent extends RowFields {
  mode: "visible" | "background";
}

interface RowFetchPlan {
  price: boolean;
  priceR0: boolean;
  priceRmax: boolean;
  ordersR0: boolean;
  ordersRmax: boolean;
  ducats: boolean;
  icon: boolean;
}

/** What the view-model reads for one row: values only, cache-backed. */
interface RowPrices {
  platinum: number | null;
  platinumR0: number | null;
  platinumRmax: number | null;
  wtsR0: number | null;
  wtbR0: number | null;
  wtsRmax: number | null;
  wtbRmax: number | null;
  ducats: number | null;
  thumb: string | null;
  icon: string | null;
}

function fieldUntried<T>(value: T): FieldState<T> {
  return { value, status: "untried", at: null, retryAt: null };
}

export function fieldOk<T>(value: T, at: number): FieldState<T> {
  return { value, status: "ok", at, retryAt: null };
}

export function fieldNoData<T>(value: T, at: number, retryAt: number | null): FieldState<T> {
  return { value, status: "no_data", at, retryAt };
}

export function fieldFailed<T>(value: T, retryAt: number): FieldState<T> {
  return { value, status: "failed", at: null, retryAt };
}

const NO_ORDERS: OrderPair = { wts: null, wtb: null };
const NO_ICON: IconPair = { thumb: null, icon: null };

export function emptyRowState(slug: string | null): RowPriceState {
  return {
    slug,
    price: { ...fieldUntried<number | null>(null), rank: null },
    priceR0: fieldUntried<number | null>(null),
    priceRmax: fieldUntried<number | null>(null),
    ordersR0: fieldUntried(NO_ORDERS),
    ordersRmax: fieldUntried(NO_ORDERS),
    ducats: { ...fieldUntried<number | null>(null), attempts: 0 },
    icon: fieldUntried(NO_ICON),
  };
}

export function resolvePriceRank(item: InventoryBaseItem): number | null {
  const maxRank = resolveRankedMaxRank(item);
  if (maxRank == null) return null;
  const currentRank = normalizeRank((item as { rank?: unknown }).rank) ?? 0;
  return currentRank >= maxRank ? maxRank : 0;
}

export function resolveRankedMaxRank(item: InventoryBaseItem): number | null {
  if (!isRankedGroup(item.inventoryGroup)) return null;
  const parsedMaxRank = normalizeRank((item as { maxRank?: unknown }).maxRank);
  return parsedMaxRank != null && parsedMaxRank > 0
    ? parsedMaxRank
    : resolveRankedMaxRankForGroup(item.inventoryGroup);
}

/** The facts about a row that decide which fields apply to it. */
export interface RowShape {
  ranked: boolean;
  maxRank: number | null;
  requestedRank: number | null;
  /** Ranked and tradable: the rank pair of order summaries applies. */
  tradesOrders: boolean;
  excluded: boolean;
  relicSubtype: string | null;
  needsIcon: boolean;
  /** Prime parts and sets keep retrying missing ducats; other rows try once. */
  ducatRetries: boolean;
}

export function rowShape(item: InventoryBaseItem): RowShape {
  const ranked = isRankedGroup(item.inventoryGroup);
  const maxRank = resolveRankedMaxRank(item);
  return {
    ranked,
    maxRank,
    requestedRank: resolvePriceRank(item),
    tradesOrders: ranked && item.tradable === true && maxRank != null,
    excluded: ranked && isExcludedRankedMarketItem(item.name, item.marketSlug),
    relicSubtype: item.inventoryGroup === "relics" ? (item.subtype ?? null) : null,
    needsIcon: ranked && !item.marketThumb,
    ducatRetries: item.inventoryGroup === "all_parts" || item.inventoryGroup === "full_sets",
  };
}

function cachedPriceField(slug: string, rank: number | null): FieldState<number | null> | null {
  const entry = getCachedPriceState(rendererPriceCacheKey(slug, rank));
  if (!entry || entry.status !== "ok") return null;
  const median = toFiniteNumber(entry.median);
  return median == null ? null : fieldOk<number | null>(median, entry.timestamp);
}

function cachedOrdersField(
  slug: string,
  rank: number,
  current: FieldState<OrderPair>,
): FieldState<OrderPair> | null {
  const entry = readCachedOrderSummary(slug, rank);
  if (!entry) return null;
  if (current.at != null && entry.at <= current.at) return null;
  return {
    value: { wts: entry.wts, wtb: entry.wtb },
    status: entry.status === "ok" ? "ok" : "no_data",
    at: entry.at,
    retryAt: current.status === "failed" ? current.retryAt : null,
  };
}

/**
 * Folds the snapshot caches into the row without touching the network, and
 * resets the price when the row's rank moved. Returns the same object when
 * nothing changed, so callers can compare by reference.
 */
export function refreshFromCache(
  state: RowPriceState,
  item: InventoryBaseItem,
  now: number = Date.now(),
): RowPriceState {
  const shape = rowShape(item);
  let next = state;
  const patch = (changes: Partial<RowPriceState>): void => {
    next = { ...next, ...changes };
  };

  // marketSlug can correct a slug kept while the WFM catalog was still loading.
  const slug = item.marketSlug || state.slug;
  if (slug !== state.slug) patch({ slug });

  if (next.price.rank !== shape.requestedRank) {
    patch({ price: { ...fieldUntried<number | null>(null), rank: shape.requestedRank } });
  }

  if (slug) {
    if (shape.relicSubtype == null && next.price.status !== "ok") {
      const cached = cachedPriceField(slug, shape.requestedRank);
      if (cached) patch({ price: { ...cached, rank: shape.requestedRank } });
    }

    if (shape.ranked && !shape.excluded && shape.maxRank != null) {
      if (next.priceR0.status !== "ok") {
        const cached = cachedPriceField(slug, 0);
        if (cached) patch({ priceR0: cached });
      }
      if (next.priceRmax.status !== "ok") {
        const cached = cachedPriceField(slug, shape.maxRank);
        if (cached) patch({ priceRmax: cached });
      }
    }

    if (shape.tradesOrders && shape.maxRank != null) {
      const ordersR0 = cachedOrdersField(slug, 0, next.ordersR0);
      if (ordersR0) patch({ ordersR0 });
      const ordersRmax = cachedOrdersField(slug, shape.maxRank, next.ordersRmax);
      if (ordersRmax) patch({ ordersRmax });
    }
  }

  // The local item database (WFCD/PEP) knows most ducat values already.
  const localDucats = normalizeDucats(item.ducats);
  if (localDucats != null && next.ducats.status !== "ok") {
    patch({ ducats: { ...fieldOk<number | null>(localDucats, now), attempts: 0 } });
  }

  return next;
}

function isDue(field: FieldState<unknown>, now: number): boolean {
  if (field.status === "untried") return true;
  if (field.status === "ok") return false;
  return field.retryAt != null && field.retryAt <= now;
}

function isOrdersDue(field: FieldState<OrderPair>, now: number): boolean {
  if (field.status === "untried") return true;
  if (field.retryAt != null && field.retryAt > now) return false;
  if (field.status === "failed") return true;
  return field.at == null || now - field.at >= ORDER_SUMMARY_FRESH_TTL_MS;
}

function isDucatsDue(field: RowPriceState["ducats"], shape: RowShape): boolean {
  if (field.status === "untried") return true;
  if (field.status === "ok") return false;
  return shape.ducatRetries && field.attempts < MAX_DUCAT_RETRY_PER_ITEM;
}

const NO_FETCH: RowFetchPlan = {
  price: false,
  priceR0: false,
  priceRmax: false,
  ordersR0: false,
  ordersRmax: false,
  ducats: false,
  icon: false,
};

/** The one skip-or-fetch decision for a row. Background rows never fetch. */
export function planRowFetch(
  state: RowPriceState,
  item: InventoryBaseItem,
  intent: RowIntent,
  now: number = Date.now(),
): RowFetchPlan {
  if (intent.mode !== "visible") return NO_FETCH;
  const shape = rowShape(item);

  const price = isDue(state.price, now);
  // The row's own price fetch already answers its half of the rank pair.
  const pair = shape.ranked && !shape.excluded && shape.maxRank != null;
  const priceR0 = pair && isDue(state.priceR0, now) && !(price && shape.requestedRank === 0);
  const priceRmax =
    pair && isDue(state.priceRmax, now) && !(price && shape.requestedRank === shape.maxRank);

  const orders = intent.orders && shape.tradesOrders && !shape.excluded;

  return {
    price,
    priceR0,
    priceRmax,
    ordersR0: orders && isOrdersDue(state.ordersR0, now),
    ordersRmax: orders && isOrdersDue(state.ordersRmax, now),
    ducats: intent.ducats && isDucatsDue(state.ducats, shape),
    icon: shape.needsIcon && state.icon.status === "untried",
  };
}

export function planHasWork(plan: RowFetchPlan): boolean {
  return Object.values(plan).some(Boolean);
}

function cachedMedianValue(slug: string | null, rank: number | null): number | null {
  return slug ? getCachedMedian(rendererPriceCacheKey(slug, rank)) : null;
}

/**
 * Values for display. Row state wins; the snapshot caches fill in for rows
 * nothing has hydrated yet, so totals and cards never wait on the queue.
 */
export function readRowPrices(
  state: RowPriceState | undefined,
  item: InventoryBaseItem,
): RowPrices {
  const shape = rowShape(item);
  const slug = item.marketSlug;

  const platinumR0 = shape.ranked
    ? (toFiniteNumber(state?.priceR0.value) ?? cachedMedianValue(slug, 0))
    : null;
  const platinumRmax =
    shape.ranked && shape.maxRank != null
      ? (toFiniteNumber(state?.priceRmax.value) ?? cachedMedianValue(slug, shape.maxRank))
      : null;
  const selectedRankPlatinum = shape.ranked
    ? shape.requestedRank === shape.maxRank
      ? platinumRmax
      : platinumR0
    : null;
  const ownPrice =
    state && state.price.rank === shape.requestedRank ? toFiniteNumber(state.price.value) : null;
  const platinum = ownPrice ?? selectedRankPlatinum ?? cachedMedianValue(slug, shape.requestedRank);

  const cachedR0 = shape.ranked && slug ? readCachedOrderSummary(slug, 0) : null;
  const cachedRmax =
    shape.ranked && slug && shape.maxRank != null
      ? readCachedOrderSummary(slug, shape.maxRank)
      : null;

  return {
    platinum,
    platinumR0,
    platinumRmax,
    wtsR0: shape.ranked
      ? (toFiniteNumber(state?.ordersR0.value.wts) ?? cachedR0?.wts ?? null)
      : null,
    wtbR0: shape.ranked
      ? (toFiniteNumber(state?.ordersR0.value.wtb) ?? cachedR0?.wtb ?? null)
      : null,
    wtsRmax: shape.ranked
      ? (toFiniteNumber(state?.ordersRmax.value.wts) ?? cachedRmax?.wts ?? null)
      : null,
    wtbRmax: shape.ranked
      ? (toFiniteNumber(state?.ordersRmax.value.wtb) ?? cachedRmax?.wtb ?? null)
      : null,
    ducats: toFiniteNumber(item.ducats) ?? toFiniteNumber(state?.ducats.value),
    thumb: state?.icon.value.thumb ?? null,
    icon: state?.icon.value.icon ?? null,
  };
}
