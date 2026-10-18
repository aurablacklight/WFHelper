import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { InventoryBaseItem } from "../../../../src/lib/inventoryMarket.js";
import type { RowIntent } from "../../../../src/stores/hydration/rowPriceState.js";

const fetchPriceBySlugMock = vi.hoisted(() => vi.fn());
const fetchPriceByNameMock = vi.hoisted(() => vi.fn());
const fetchOrderSummaryBySlugMock = vi.hoisted(() => vi.fn());
const fetchWfmItemMetaBySlugMock = vi.hoisted(() => vi.fn());

vi.mock("../../../../src/lib/wfm/wfmPrice.js", () => ({
  fetchPriceBySlug: fetchPriceBySlugMock,
  fetchPriceByName: fetchPriceByNameMock,
}));

vi.mock("../../../../src/lib/wfm/orderSummaryRemote.js", () => ({
  fetchOrderSummaryBySlug: fetchOrderSummaryBySlugMock,
}));

vi.mock("../../../../src/lib/wfm/wfmItemMeta.js", () => ({
  fetchWfmItemMetaBySlug: fetchWfmItemMetaBySlugMock,
}));

import { __test__ as priceCacheTest } from "../../../../src/lib/wfm/priceCache.js";
import {
  clearOrderSummaryCache,
  getCachedOrderSummaryState,
  setCachedOrderSummary,
} from "../../../../src/lib/wfm/orderSummaryCache.js";
import { hydrateRow } from "../../../../src/stores/hydration/hydrateRow.js";
import { emptyRowState } from "../../../../src/stores/hydration/rowPriceState.js";
import {
  MAX_DUCAT_RETRY_PER_ITEM,
  ORDER_TRANSIENT_RETRY_MS,
  PRICE_NO_DATA_RETRY_MS,
  PRICE_TRANSIENT_RETRY_MS,
} from "../../../../src/stores/hydration/hydrationTypes.js";

const HOUR = 60 * 60 * 1000;
const visible: RowIntent = { mode: "visible", orders: false, ducats: false };
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
    name: "Ambassador Stock Blueprint",
    internalName: "/Lotus/Types/Recipes/Weapons/WeaponParts/AmbassadorStockBlueprint",
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

function priceAtRank(prices: Record<string, number | null>) {
  fetchPriceBySlugMock.mockImplementation(
    async (slug: string, options: { rank?: number | null }) => {
      const median = prices[String(options?.rank ?? "unranked")] ?? null;
      return median == null
        ? { status: "no_data", slug, median: null }
        : { status: "ok", slug, median, timestamp: Date.now() };
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchPriceByNameMock.mockResolvedValue(null);
  fetchWfmItemMetaBySlugMock.mockResolvedValue(null);
  fetchOrderSummaryBySlugMock.mockResolvedValue({ status: "not_found" });
});

afterEach(() => {
  priceCacheTest.clearPriceCache();
  clearOrderSummaryCache();
});

describe("hydrateRow", () => {
  it("touches no network on a background pass and leaves the fields untried", async () => {
    const state = await hydrateRow(
      makeItem(),
      {},
      { mode: "background", orders: true, ducats: true },
      undefined,
    );

    expect(fetchPriceBySlugMock).not.toHaveBeenCalled();
    expect(fetchPriceByNameMock).not.toHaveBeenCalled();
    expect(fetchOrderSummaryBySlugMock).not.toHaveBeenCalled();
    expect(fetchWfmItemMetaBySlugMock).not.toHaveBeenCalled();
    expect(state.price.status).toBe("untried");
    expect(state.priceRmax.status).toBe("untried");
    expect(state.ordersR0.status).toBe("untried");
    expect(state.ducats.status).toBe("untried");
    expect(state.icon.status).toBe("untried");
  });

  it("fetches both rank prices on a visible pass and mirrors the row's rank into the pair", async () => {
    priceAtRank({ "0": 12, "3": 45 });

    const state = await hydrateRow(makeItem(), {}, visible, undefined);

    expect(fetchPriceBySlugMock).toHaveBeenCalledWith(
      "high_noon",
      expect.objectContaining({ rank: 0 }),
    );
    expect(fetchPriceBySlugMock).toHaveBeenCalledWith(
      "high_noon",
      expect.objectContaining({ rank: 3 }),
    );
    expect(state.price).toMatchObject({ status: "ok", value: 12, rank: 0 });
    expect(state.priceR0).toMatchObject({ status: "ok", value: 12 });
    expect(state.priceRmax).toMatchObject({ status: "ok", value: 45 });
  });

  it("fetches the max-rank price when a visible pass follows a background pass", async () => {
    // Bug (a) end to end: the background pass must not make the pair look covered.
    const afterBackground = await hydrateRow(makeItem(), {}, background, undefined);
    priceAtRank({ "0": 12, "3": 45 });

    const state = await hydrateRow(makeItem(), {}, visible, afterBackground);

    expect(fetchPriceBySlugMock).toHaveBeenCalledWith(
      "high_noon",
      expect.objectContaining({ rank: 3 }),
    );
    expect(state.priceRmax).toMatchObject({ status: "ok", value: 45 });
  });

  it("fetches the icon when a visible pass follows a background pass", async () => {
    // Bug (b) end to end: hasMeta used to be stamped without a fetch.
    const afterBackground = await hydrateRow(makeItem(), {}, background, undefined);
    priceAtRank({ "0": 12, "3": 45 });
    fetchWfmItemMetaBySlugMock.mockResolvedValue({
      slug: "high_noon",
      ducats: null,
      thumb: "https://example.test/high_noon.png",
      icon: null,
    });

    const state = await hydrateRow(makeItem(), {}, visible, afterBackground);

    expect(fetchWfmItemMetaBySlugMock).toHaveBeenCalledWith("high_noon", expect.anything());
    expect(state.icon).toMatchObject({
      status: "ok",
      value: { thumb: "https://example.test/high_noon.png", icon: null },
    });
  });

  it("marks a transient rank-pair failure for retry instead of settling it", async () => {
    fetchPriceBySlugMock.mockImplementation(async (slug: string, options: { rank?: number }) =>
      options.rank === 3
        ? { status: "transient", slug, median: null }
        : { status: "ok", slug, median: 12, timestamp: Date.now() },
    );
    const now = Date.now();

    const state = await hydrateRow(makeItem(), {}, visible, undefined, now);

    expect(state.priceRmax.status).toBe("failed");
    expect(state.priceRmax.retryAt).toBe(now + PRICE_TRANSIENT_RETRY_MS);
  });

  it("gives a no-data price its retry cooldown and a transient one its own", async () => {
    const now = Date.now();
    fetchPriceBySlugMock.mockResolvedValue({
      status: "no_data",
      slug: "ambassador_stock",
      median: null,
    });
    const noData = await hydrateRow(primePart(), {}, visible, undefined, now);
    expect(noData.price).toMatchObject({ status: "no_data", value: null });
    expect(noData.price.retryAt).toBe(now + PRICE_NO_DATA_RETRY_MS);

    fetchPriceBySlugMock.mockResolvedValue({
      status: "transient",
      slug: "ambassador_stock",
      median: null,
    });
    const failed = await hydrateRow(primePart(), {}, visible, undefined, now);
    expect(failed.price.status).toBe("failed");
    expect(failed.price.retryAt).toBe(now + PRICE_TRANSIENT_RETRY_MS);
  });

  it("refreshes a stale order summary on a visible pass and writes it back to the cache", async () => {
    priceAtRank({ "0": 12, "3": 45 });
    setCachedOrderSummary("high_noon", 0, { wts: 20, wtb: 9 });
    setCachedOrderSummary("high_noon", 3, { wts: 90, wtb: 60 });
    const now = Date.now();
    const seeded = await hydrateRow(makeItem(), {}, { ...visible, orders: true }, undefined, now);
    expect(fetchOrderSummaryBySlugMock).not.toHaveBeenCalled();
    expect(seeded.ordersR0).toMatchObject({ status: "ok", value: { wts: 20, wtb: 9 } });

    // A day later the pair is stale: the hotset refresh must actually refetch it.
    fetchOrderSummaryBySlugMock.mockImplementation(
      async (_slug: string, options: { rank?: number }) => ({
        status: "ok",
        data: {
          slug: "high_noon",
          rank: options.rank ?? null,
          wts: options.rank === 3 ? 95 : 22,
          wtb: options.rank === 3 ? 61 : 11,
          timestamp: Date.now(),
        },
      }),
    );
    const later = now + 25 * HOUR;
    const refreshed = await hydrateRow(makeItem(), {}, { ...visible, orders: true }, seeded, later);

    expect(fetchOrderSummaryBySlugMock).toHaveBeenCalledWith("high_noon", { rank: 0 });
    expect(fetchOrderSummaryBySlugMock).toHaveBeenCalledWith("high_noon", { rank: 3 });
    expect(refreshed.ordersR0.value).toEqual({ wts: 22, wtb: 11 });
    expect(refreshed.ordersRmax.value).toEqual({ wts: 95, wtb: 61 });
    expect(getCachedOrderSummaryState("high_noon", 3)?.wts).toBe(95);
  });

  it("keeps a failed order summary on cooldown with its old values", async () => {
    priceAtRank({ "0": 12, "3": 45 });
    fetchOrderSummaryBySlugMock.mockResolvedValue({ status: "unavailable" });
    const now = Date.now();

    const state = await hydrateRow(makeItem(), {}, { ...visible, orders: true }, undefined, now);

    expect(state.ordersR0.status).toBe("failed");
    expect(state.ordersR0.retryAt).toBe(now + ORDER_TRANSIENT_RETRY_MS);
  });

  it("reads ducats from the meta route and stops after the retry cap", async () => {
    const intent: RowIntent = { mode: "visible", orders: false, ducats: true };
    fetchPriceBySlugMock.mockResolvedValue({
      status: "ok",
      slug: "ambassador_stock",
      median: 2,
      timestamp: Date.now(),
    });
    fetchWfmItemMetaBySlugMock.mockResolvedValue({
      slug: "ambassador_stock",
      ducats: null,
      thumb: null,
      icon: null,
    });

    let state = await hydrateRow(primePart(), {}, intent, undefined);
    expect(state.ducats).toMatchObject({ status: "no_data", attempts: 1 });

    for (let attempt = 1; attempt < MAX_DUCAT_RETRY_PER_ITEM; attempt += 1) {
      state = await hydrateRow(primePart(), {}, intent, state);
    }
    expect(state.ducats.attempts).toBe(MAX_DUCAT_RETRY_PER_ITEM);
    const callsAtCap = fetchWfmItemMetaBySlugMock.mock.calls.length;

    await hydrateRow(primePart(), {}, intent, state);
    expect(fetchWfmItemMetaBySlugMock.mock.calls.length).toBe(callsAtCap);

    fetchWfmItemMetaBySlugMock.mockResolvedValue({
      slug: "ambassador_stock",
      ducats: 45,
      thumb: null,
      icon: null,
    });
    const fresh = await hydrateRow(primePart(), {}, intent, undefined);
    expect(fresh.ducats).toMatchObject({ status: "ok", value: 45 });
  });

  it("does not fetch ducats a background pass could not have, nor on a visible pass that did not ask", async () => {
    priceAtRank({ unranked: 2 });
    const state = await hydrateRow(primePart(), {}, visible, undefined);

    expect(fetchWfmItemMetaBySlugMock).not.toHaveBeenCalled();
    expect(state.ducats.status).toBe("untried");
  });

  it("prices relic rows from the subtype order summary, not the price route", async () => {
    fetchOrderSummaryBySlugMock.mockResolvedValue({
      status: "ok",
      data: { slug: "axi_a1_relic", rank: null, wts: 25, wtb: 10, timestamp: Date.now() },
    });
    const relic = makeItem({
      name: "Axi A1 Relic (Radiant)",
      internalName: "/Lotus/Types/Game/Projections/T4VoidProjectionEPlatinum",
      inventoryGroup: "relics",
      category: "relics",
      categoryLabel: "Relic",
      rank: 0,
      maxRank: 0,
      marketSlug: "axi_a1_relic",
      subtype: "radiant",
    });

    const state = await hydrateRow(relic, {}, visible, undefined);

    expect(fetchOrderSummaryBySlugMock).toHaveBeenCalledWith(
      "axi_a1_relic",
      expect.objectContaining({ subtype: "radiant" }),
    );
    expect(fetchPriceBySlugMock).not.toHaveBeenCalled();
    expect(fetchPriceByNameMock).not.toHaveBeenCalled();
    expect(state.price).toMatchObject({ status: "ok", value: 25 });
  });

  it("settles a relic row with no listings behind the no-data cooldown instead of refetching forever", async () => {
    fetchOrderSummaryBySlugMock.mockResolvedValue({ status: "not_found" });
    const now = Date.now();
    const relic = makeItem({
      name: "Axi A1 Relic (Intact)",
      internalName: "/Lotus/Types/Game/Projections/T4VoidProjectionEBronze",
      inventoryGroup: "relics",
      category: "relics",
      categoryLabel: "Relic",
      rank: 0,
      maxRank: 0,
      marketSlug: "axi_a1_relic",
      subtype: "intact",
    });

    const state = await hydrateRow(relic, {}, visible, undefined, now);

    expect(state.price).toMatchObject({ status: "no_data", value: null });
    expect(state.price.retryAt).toBe(now + PRICE_NO_DATA_RETRY_MS);
  });

  it("replaces a stale slug with the item's current marketSlug before fetching", async () => {
    // First pass ran before the WFM catalog loaded and kept a slugified guess.
    const stale = emptyRowState("ambassador_stock_blueprint");
    fetchPriceBySlugMock.mockResolvedValue({
      status: "ok",
      slug: "ambassador_stock",
      median: 2,
      timestamp: Date.now(),
    });

    await hydrateRow(primePart(), {}, { mode: "visible", orders: false, ducats: true }, stale);

    expect(fetchPriceBySlugMock).toHaveBeenCalledWith("ambassador_stock", expect.anything());
    expect(fetchPriceBySlugMock).not.toHaveBeenCalledWith(
      "ambassador_stock_blueprint",
      expect.anything(),
    );
    expect(fetchWfmItemMetaBySlugMock).toHaveBeenCalledWith("ambassador_stock", expect.anything());
  });
});
