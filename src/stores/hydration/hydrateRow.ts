import {
  fetchPriceByName,
  fetchPriceBySlug,
  type RequestPriority,
} from "../../lib/wfm/wfmPrice.js";
import { fetchOrderSummaryBySlug } from "../../lib/wfm/orderSummaryRemote.js";
import {
  setCachedOrderSummary,
  setCachedOrderSummaryNoData,
} from "../../lib/wfm/orderSummaryCache.js";
import { fetchWfmItemMetaBySlug } from "../../lib/wfm/wfmItemMeta.js";
import type { InventoryBaseItem } from "../../lib/inventoryMarket.js";
import type { WfmItemsLookup } from "../../types/ipc.js";
import { normalizeWfmSlug } from "../../../config/shared/wfm.js";
import { normalizeDucats, toFiniteNonNegativeInt } from "../../../config/shared/numeric.js";
import {
  MAX_DUCAT_RETRY_PER_ITEM,
  ORDER_TRANSIENT_RETRY_MS,
  PRICE_NO_DATA_RETRY_MS,
  PRICE_TRANSIENT_RETRY_MS,
} from "./hydrationTypes.js";
import {
  emptyRowState,
  fieldFailed,
  fieldNoData,
  fieldOk,
  planHasWork,
  planRowFetch,
  refreshFromCache,
  rowShape,
  type FieldState,
  type OrderPair,
  type RowIntent,
  type RowPriceState,
  type RowShape,
} from "./rowPriceState.js";

const FIELD_NAMES = [
  "price",
  "priceR0",
  "priceRmax",
  "ordersR0",
  "ordersRmax",
  "ducats",
  "icon",
] as const satisfies readonly (keyof ReturnType<typeof planRowFetch> & keyof RowPriceState)[];

const ICON_RETRY_MS = PRICE_NO_DATA_RETRY_MS;

type PriceFetch =
  | { status: "ok"; median: number; slug: string }
  | { status: "no_data" | "transient"; slug: string | null };

interface FetchEnv {
  item: InventoryBaseItem;
  lookup: WfmItemsLookup;
  shape: RowShape;
  priority: RequestPriority;
  now: number;
}

function fetchPriority(
  item: InventoryBaseItem,
  shape: RowShape,
  intent: RowIntent,
): RequestPriority {
  if (item.inventoryGroup === "all_parts" || item.inventoryGroup === "full_sets") return "high";
  return shape.ranked && intent.orders ? "high" : "normal";
}

function roundedMedian(median: unknown): number | null {
  return typeof median === "number" && Number.isFinite(median) && median >= 0
    ? Math.round(median)
    : null;
}

/** Slug route first, then the catalog name; `unrankedFallback` retries both without a rank. */
async function fetchPriceAt(
  env: FetchEnv,
  slug: string | null,
  rank: number | null,
  unrankedFallback: boolean,
): Promise<PriceFetch> {
  const { item, lookup, shape, priority } = env;
  // Ranked rows only trust the catalog slug; a name guess would price the wrong listing.
  const allowNameLookup = !shape.ranked || Boolean(slug);
  const ignoreNoDataCache = shape.ranked;
  const allowSetFallback = item.inventoryGroup === "full_sets";
  let transient = false;

  const attempt = async (atRank: number | null): Promise<PriceFetch | null> => {
    if (slug) {
      const bySlug = await fetchPriceBySlug(slug, { priority, rank: atRank, ignoreNoDataCache });
      const median = roundedMedian(bySlug.median);
      if (bySlug.status === "ok" && median != null) {
        return { status: "ok", median, slug: bySlug.slug || slug };
      }
      if (atRank === rank && bySlug.status === "transient") transient = true;
    }
    if (allowNameLookup) {
      const byName = await fetchPriceByName(item.name, lookup, {
        priority,
        allowSetFallback,
        rank: atRank,
        ignoreNoDataCache,
      });
      const median = roundedMedian(byName?.median);
      if (byName && median != null) return { status: "ok", median, slug: byName.slug };
    }
    return null;
  };

  const ranked = await attempt(rank);
  if (ranked) return ranked;
  if (unrankedFallback && rank != null) {
    const unranked = await attempt(null);
    if (unranked) return unranked;
  }
  return { status: transient ? "transient" : "no_data", slug };
}

function priceField(
  result: PriceFetch,
  now: number,
  noDataRetryMs: number | null,
): FieldState<number | null> {
  if (result.status === "ok") return fieldOk<number | null>(result.median, now);
  if (result.status === "transient") {
    return fieldFailed<number | null>(null, now + PRICE_TRANSIENT_RETRY_MS);
  }
  return fieldNoData<number | null>(null, now, noDataRetryMs == null ? null : now + noDataRetryMs);
}

/** Relics are priced per refinement, which only the order summary route knows. */
async function fetchRelicPrice(
  slug: string | null,
  subtype: string,
  now: number,
): Promise<FieldState<number | null>> {
  const relicSlug = normalizeWfmSlug(slug);
  if (!relicSlug) return fieldNoData<number | null>(null, now, null);

  const summary = await fetchOrderSummaryBySlug(relicSlug, { subtype });
  if (summary.status === "ok") {
    const best = summary.data.wts ?? summary.data.wtb;
    return best == null
      ? fieldNoData<number | null>(null, now, now + PRICE_NO_DATA_RETRY_MS)
      : fieldOk<number | null>(best, now);
  }
  if (summary.status === "not_found") {
    return fieldNoData<number | null>(null, now, now + PRICE_NO_DATA_RETRY_MS);
  }
  return fieldFailed<number | null>(null, now + PRICE_TRANSIENT_RETRY_MS);
}

async function fetchOrders(
  slug: string,
  rank: number,
  current: FieldState<OrderPair>,
  now: number,
): Promise<FieldState<OrderPair>> {
  const result = await fetchOrderSummaryBySlug(slug, { rank });
  if (result.status === "ok") {
    const wts = toFiniteNonNegativeInt(result.data.wts);
    const wtb = toFiniteNonNegativeInt(result.data.wtb);
    if (wts == null && wtb == null) {
      setCachedOrderSummaryNoData(slug, rank, { sourceTimestamp: result.data.timestamp });
      return fieldNoData({ wts, wtb }, Date.now(), null);
    }
    setCachedOrderSummary(slug, rank, { wts, wtb, sourceTimestamp: result.data.timestamp });
    return fieldOk({ wts, wtb }, Date.now());
  }
  if (result.status === "not_found") {
    setCachedOrderSummaryNoData(slug, rank);
    return fieldNoData({ wts: null, wtb: null }, Date.now(), null);
  }
  return { ...current, status: "failed", retryAt: now + ORDER_TRANSIENT_RETRY_MS };
}

/**
 * Brings one row up to date for the caller's intent: folds the caches in,
 * asks the plan what is still missing, and fetches exactly that. Returns the
 * input state untouched when there is nothing to do.
 */
export async function hydrateRow(
  item: InventoryBaseItem,
  lookup: WfmItemsLookup,
  intent: RowIntent,
  existing: RowPriceState | undefined,
  now: number = Date.now(),
): Promise<RowPriceState> {
  const state = refreshFromCache(existing ?? emptyRowState(item.marketSlug), item, now);
  const plan = planRowFetch(state, item, intent, now);
  if (!planHasWork(plan)) return state;

  const shape = rowShape(item);
  const env: FetchEnv = {
    item,
    lookup,
    shape,
    priority: fetchPriority(item, shape, intent),
    now,
  };
  const next: RowPriceState = { ...state };
  let slug = state.slug;

  try {
    if (plan.price) {
      if (shape.relicSubtype) {
        next.price = { ...(await fetchRelicPrice(slug, shape.relicSubtype, now)), rank: null };
      } else {
        const result = await fetchPriceAt(
          env,
          slug,
          shape.requestedRank,
          shape.requestedRank != null,
        );
        if (result.slug) slug = result.slug;
        const field = priceField(result, now, PRICE_NO_DATA_RETRY_MS);
        next.price = { ...field, rank: shape.requestedRank };
        if (shape.ranked && shape.maxRank != null) {
          if (shape.requestedRank === 0) next.priceR0 = field;
          if (shape.requestedRank === shape.maxRank) next.priceRmax = field;
        }
      }
    }

    // A rank with no listing stays settled for the session; only transient
    // failures come back for another try.
    if (plan.priceR0) {
      const result = await fetchPriceAt(env, slug, 0, false);
      if (result.slug) slug = result.slug;
      next.priceR0 = priceField(result, now, null);
    }
    if (plan.priceRmax && shape.maxRank != null) {
      const result = await fetchPriceAt(env, slug, shape.maxRank, false);
      if (result.slug) slug = result.slug;
      next.priceRmax = priceField(result, now, null);
    }

    const ordersSlug = normalizeWfmSlug(slug || item.marketSlug);
    if (ordersSlug && shape.maxRank != null) {
      if (plan.ordersR0) next.ordersR0 = await fetchOrders(ordersSlug, 0, next.ordersR0, now);
      if (plan.ordersRmax) {
        next.ordersRmax = await fetchOrders(ordersSlug, shape.maxRank, next.ordersRmax, now);
      }
    }

    if (plan.ducats || plan.icon) {
      if (!slug) {
        // Nothing to ask the meta route for; settle both so the row stops re-queuing.
        if (plan.ducats) {
          next.ducats = {
            ...fieldNoData<number | null>(null, now, null),
            attempts: MAX_DUCAT_RETRY_PER_ITEM,
          };
        }
        if (plan.icon) next.icon = fieldNoData({ thumb: null, icon: null }, now, null);
      } else {
        const meta = await fetchWfmItemMetaBySlug(slug, { priority: env.priority });
        if (plan.ducats) {
          const ducats = normalizeDucats(meta?.ducats);
          next.ducats =
            ducats == null
              ? {
                  ...fieldNoData<number | null>(null, now, null),
                  attempts: next.ducats.attempts + 1,
                }
              : { ...fieldOk<number | null>(ducats, now), attempts: 0 };
        }
        if (plan.icon) {
          // No meta can be a dropped request, so try again later instead of for good.
          next.icon = meta
            ? fieldOk({ thumb: meta.thumb || null, icon: meta.icon || null }, now)
            : fieldFailed({ thumb: null, icon: null }, now + ICON_RETRY_MS);
        }
      }
    }
  } catch (error) {
    console.warn("[Inventory] row hydration failed:", error);
    // Keep what already landed; planned fields the error cut off cool down as transient.
    const retryAt = now + PRICE_TRANSIENT_RETRY_MS;
    for (const name of FIELD_NAMES) {
      if (plan[name] && next[name] === state[name]) {
        (next as unknown as Record<string, unknown>)[name] = {
          ...state[name],
          status: "failed",
          retryAt,
        };
      }
    }
    if (plan.ducats && next.ducats.status === "failed") {
      next.ducats = { ...next.ducats, attempts: next.ducats.attempts + 1 };
    }
  }

  next.slug = slug;
  return next;
}
