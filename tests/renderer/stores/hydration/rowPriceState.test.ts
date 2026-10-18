import { afterEach, describe, expect, it } from "vitest";

import type { InventoryBaseItem } from "../../../../src/lib/inventoryMarket.js";
import { __test__ as priceCacheTest, setCachedPrice } from "../../../../src/lib/wfm/priceCache.js";
import {
  clearOrderSummaryCache,
  setCachedOrderSummary,
} from "../../../../src/lib/wfm/orderSummaryCache.js";
import { rendererPriceCacheKey } from "../../../../config/shared/wfmCacheKeys.js";
import {
  emptyRowState,
  fieldFailed,
  fieldNoData,
  fieldOk,
  planHasWork,
  planRowFetch,
  readRowPrices,
  refreshFromCache,
  resolvePriceRank,
  resolveRankedMaxRank,
  type RowIntent,
  type RowPriceState,
} from "../../../../src/stores/hydration/rowPriceState.js";
import {
  MAX_DUCAT_RETRY_PER_ITEM,
  PRICE_NO_DATA_RETRY_MS,
  PRICE_TRANSIENT_RETRY_MS,
} from "../../../../src/stores/hydration/hydrationTypes.js";

const NOW = 1_800_000_000_000;
const HOUR = 60 * 60 * 1000;
const visible: RowIntent = { mode: "visible", orders: true, ducats: false };
const background: RowIntent = { mode: "background", orders: false, ducats: false };

function makeItem(overrides: Partial<InventoryBaseItem> = {}): InventoryBaseItem {
  return {
    name: "High Noon",
    internalName: "/Lotus/Upgrades/Mods/Melee/HighNoon",
    category: "Mods",
    categoryLabel: "Mods",
    rank: 0,
    maxRank: 3,
    imageUrl: null,
    isPrime: false,
    masteryReq: 0,
    vaulted: false,
    tradable: true,
    description: "",
    components: [],
    drops: [],
    wikiaUrl: null,
    inventoryGroup: "mods",
    partType: "normal",
    amount: 1,
    favorite: false,
    equipped: false,
    orderPlaced: false,
    completeSets: null,
    marketSlug: "high_noon",
    marketThumb: null,
    subtype: null,
    ...overrides,
  } as InventoryBaseItem;
}

function primePart(overrides: Partial<InventoryBaseItem> = {}): InventoryBaseItem {
  return makeItem({
    name: "Ambassador Stock",
    internalName: "/Lotus/Types/Recipes/Weapons/WeaponParts/AmbassadorStock",
    inventoryGroup: "all_parts",
    category: "parts",
    categoryLabel: "Part",
    rank: 0,
    maxRank: 0,
    marketSlug: "ambassador_stock",
    marketThumb: "https://example.test/thumb.png",
    ...overrides,
  });
}

afterEach(() => {
  priceCacheTest.clearPriceCache();
  clearOrderSummaryCache();
});

describe("planRowFetch", () => {
  it("plans nothing for a background pass and leaves every field untried", () => {
    const state = refreshFromCache(emptyRowState("high_noon"), makeItem(), NOW);

    expect(planHasWork(planRowFetch(state, makeItem(), background, NOW))).toBe(false);
    expect(state.price.status).toBe("untried");
    expect(state.priceR0.status).toBe("untried");
    expect(state.priceRmax.status).toBe("untried");
    expect(state.icon.status).toBe("untried");
  });

  it("still fetches the max-rank price on a visible pass after a background pass found only rank 0", () => {
    // Bug (a): the old no-network pass stamped hasPriceRmax, so the visible pass
    // treated the pair as covered and never fetched the max-rank price.
    setCachedPrice(rendererPriceCacheKey("high_noon", 0), 12);
    const state = refreshFromCache(emptyRowState("high_noon"), makeItem(), NOW);
    expect(planHasWork(planRowFetch(state, makeItem(), background, NOW))).toBe(false);

    const plan = planRowFetch(state, makeItem(), visible, NOW);

    expect(state.priceR0).toMatchObject({ status: "ok", value: 12 });
    expect(state.price).toMatchObject({ status: "ok", value: 12, rank: 0 });
    expect(plan.price).toBe(false);
    expect(plan.priceR0).toBe(false);
    expect(plan.priceRmax).toBe(true);
  });

  it("keeps the icon due until a visible pass has tried the meta route", () => {
    // Bug (b): the old no-network pass stamped hasMeta, so the icon was never fetched.
    const untried = refreshFromCache(emptyRowState("high_noon"), makeItem(), NOW);
    expect(planRowFetch(untried, makeItem(), visible, NOW).icon).toBe(true);

    const tried: RowPriceState = {
      ...untried,
      icon: fieldNoData({ thumb: null, icon: null }, NOW, null),
    };
    expect(planRowFetch(tried, makeItem(), visible, NOW).icon).toBe(false);

    const withLookupThumb = makeItem({ marketThumb: "https://example.test/x.png" });
    expect(planRowFetch(untried, withLookupThumb, visible, NOW).icon).toBe(false);
  });

  it("lets the row's own price fetch cover its half of the rank pair", () => {
    const state = emptyRowState("high_noon");
    const atRank0 = planRowFetch(state, makeItem({ rank: 0 }), visible, NOW);
    expect(atRank0).toMatchObject({ price: true, priceR0: false, priceRmax: true });

    const atMax = planRowFetch(state, makeItem({ rank: 3 }), visible, NOW);
    expect(atMax).toMatchObject({ price: true, priceR0: true, priceRmax: false });
  });

  it("refetches stale order summaries on a visible pass and leaves fresh ones alone", () => {
    const pair = { wts: 20, wtb: 10 };
    const stale: RowPriceState = {
      ...emptyRowState("high_noon"),
      ordersR0: fieldOk(pair, NOW - 25 * HOUR),
      ordersRmax: fieldOk(pair, NOW - 1 * HOUR),
    };

    const plan = planRowFetch(stale, makeItem(), visible, NOW);

    expect(plan.ordersR0).toBe(true);
    expect(plan.ordersRmax).toBe(false);
  });

  it("never plans order fetches when the caller did not ask for orders", () => {
    const plan = planRowFetch(
      emptyRowState("high_noon"),
      makeItem(),
      { ...visible, orders: false },
      NOW,
    );
    expect(plan.ordersR0).toBe(false);
    expect(plan.ordersRmax).toBe(false);
  });

  it("retries a no-data price only after its cooldown and a transient failure after its own", () => {
    const noData: RowPriceState = {
      ...emptyRowState("ambassador_stock"),
      price: { ...fieldNoData(null, NOW, NOW + PRICE_NO_DATA_RETRY_MS), rank: null },
    };
    expect(planRowFetch(noData, primePart(), visible, NOW + 1000).price).toBe(false);
    expect(planRowFetch(noData, primePart(), visible, NOW + PRICE_NO_DATA_RETRY_MS).price).toBe(
      true,
    );

    const failed: RowPriceState = {
      ...emptyRowState("ambassador_stock"),
      price: { ...fieldFailed(null, NOW + PRICE_TRANSIENT_RETRY_MS), rank: null },
    };
    expect(planRowFetch(failed, primePart(), visible, NOW + 1000).price).toBe(false);
    expect(planRowFetch(failed, primePart(), visible, NOW + PRICE_TRANSIENT_RETRY_MS).price).toBe(
      true,
    );
  });

  it("treats a rank change as an untried price while keeping the rank pair", () => {
    const priced: RowPriceState = {
      ...emptyRowState("high_noon"),
      price: { ...fieldOk(12, NOW), rank: 0 },
      priceR0: fieldOk(12, NOW),
      priceRmax: fieldOk(45, NOW),
    };

    const levelled = refreshFromCache(priced, makeItem({ rank: 3 }), NOW);

    expect(levelled.price).toMatchObject({ status: "untried", rank: 3 });
    expect(levelled.priceRmax).toMatchObject({ status: "ok", value: 45 });
    expect(planRowFetch(levelled, makeItem({ rank: 3 }), visible, NOW).price).toBe(true);
  });

  it("retries missing ducats up to the cap, and only for prime parts and sets", () => {
    const intent: RowIntent = { mode: "visible", orders: false, ducats: true };
    const missing = (attempts: number): RowPriceState => ({
      ...emptyRowState("ambassador_stock"),
      ducats: { ...fieldNoData(null, NOW, null), attempts },
    });

    expect(planRowFetch(missing(1), primePart(), intent, NOW).ducats).toBe(true);
    expect(planRowFetch(missing(MAX_DUCAT_RETRY_PER_ITEM), primePart(), intent, NOW).ducats).toBe(
      false,
    );
    expect(planRowFetch(missing(1), makeItem(), intent, NOW).ducats).toBe(false);
    expect(planRowFetch(emptyRowState("high_noon"), makeItem(), visible, NOW).ducats).toBe(false);
  });
});

describe("refreshFromCache", () => {
  it("promotes cached order summaries with their cache timestamp and keeps a transient cooldown", () => {
    setCachedOrderSummary("high_noon", 0, { wts: 20, wtb: 9 });
    const failed: RowPriceState = {
      ...emptyRowState("high_noon"),
      ordersR0: fieldFailed({ wts: null, wtb: null }, NOW + 20_000),
    };

    const state = refreshFromCache(failed, makeItem(), NOW);

    expect(state.ordersR0.status).toBe("ok");
    expect(state.ordersR0.value).toEqual({ wts: 20, wtb: 9 });
    expect(state.ordersR0.at).toBeGreaterThan(0);
    expect(state.ordersR0.retryAt).toBe(NOW + 20_000);
    expect(state.ordersRmax.status).toBe("untried");
  });

  it("returns the same state when nothing in the caches is new", () => {
    const state = refreshFromCache(emptyRowState("high_noon"), makeItem(), NOW);
    expect(refreshFromCache(state, makeItem(), NOW)).toBe(state);
  });

  it("corrects a stale slug from the item's current marketSlug and reads local ducats", () => {
    const state = refreshFromCache(
      emptyRowState("ambassador_stock_blueprint"),
      primePart({ ducats: 45 } as Partial<InventoryBaseItem>),
      NOW,
    );
    expect(state.slug).toBe("ambassador_stock");
    expect(state.ducats).toMatchObject({ status: "ok", value: 45 });
  });
});

describe("readRowPrices", () => {
  it("prefers row values over the snapshot cache and picks the row's own rank", () => {
    setCachedPrice(rendererPriceCacheKey("high_noon", 0), 8);
    setCachedPrice(rendererPriceCacheKey("high_noon", 3), 80);
    const state: RowPriceState = {
      ...emptyRowState("high_noon"),
      priceRmax: fieldOk(76, NOW),
    };

    const atMax = readRowPrices(state, makeItem({ rank: 3 }));
    expect(atMax.platinumR0).toBe(8);
    expect(atMax.platinumRmax).toBe(76);
    expect(atMax.platinum).toBe(76);

    const atZero = readRowPrices(undefined, makeItem({ rank: 0 }));
    expect(atZero.platinum).toBe(8);
    expect(atZero.platinumRmax).toBe(80);
  });

  it("falls back to cached order summaries when the row has none", () => {
    setCachedOrderSummary("high_noon", 3, { wts: 90, wtb: 60 });
    const prices = readRowPrices(undefined, makeItem());
    expect(prices.wtsRmax).toBe(90);
    expect(prices.wtbRmax).toBe(60);
    expect(prices.wtsR0).toBeNull();
  });

  it("drops non-finite values instead of displaying NaN", () => {
    const state: RowPriceState = {
      ...emptyRowState("ambassador_stock"),
      price: { ...fieldOk(Number.NaN, NOW), rank: null },
      ducats: { ...fieldOk(Number.NaN, NOW), attempts: 0 },
    };
    const prices = readRowPrices(state, primePart());
    expect(prices.platinum).toBeNull();
    expect(prices.ducats).toBeNull();
  });
});

describe("resolvePriceRank", () => {
  it("returns null for non-ranked groups", () => {
    expect(resolvePriceRank(makeItem({ inventoryGroup: "misc" }))).toBeNull();
    expect(resolvePriceRank(makeItem({ inventoryGroup: "relics" }))).toBeNull();
  });

  it("returns 0 below max rank and the max rank at max", () => {
    expect(resolvePriceRank(makeItem({ rank: 0, maxRank: 10 }))).toBe(0);
    expect(resolvePriceRank(makeItem({ rank: 5, maxRank: 10 }))).toBe(0);
    expect(resolvePriceRank(makeItem({ rank: 10, maxRank: 10 }))).toBe(10);
  });

  it("defaults mods to 10 and arcanes to 5 when the item carries no max rank", () => {
    expect(resolvePriceRank(makeItem({ rank: 10, maxRank: 0 }))).toBe(10);
    expect(resolvePriceRank(makeItem({ inventoryGroup: "arcanes", rank: 5, maxRank: 0 }))).toBe(5);
  });
});

describe("resolveRankedMaxRank", () => {
  it("returns null for non-ranked groups and the group default otherwise", () => {
    expect(resolveRankedMaxRank(makeItem({ inventoryGroup: "misc" }))).toBeNull();
    expect(resolveRankedMaxRank(makeItem({ maxRank: 0 }))).toBe(10);
    expect(resolveRankedMaxRank(makeItem({ inventoryGroup: "arcanes", maxRank: 0 }))).toBe(5);
    expect(resolveRankedMaxRank(makeItem({ maxRank: 3 }))).toBe(3);
  });
});
