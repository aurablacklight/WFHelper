import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { InventoryBaseItem } from "../../../src/lib/inventoryMarket.js";
import type { WfmItemsLookup } from "../../../src/types/ipc.js";
import type { RowIntent } from "../../../src/stores/hydration/rowPriceState.js";

const fetchPriceBySlugMock = vi.hoisted(() => vi.fn());
const fetchPriceByNameMock = vi.hoisted(() => vi.fn());
const fetchOrderSummaryBySlugMock = vi.hoisted(() => vi.fn());
const fetchWfmItemMetaBySlugMock = vi.hoisted(() => vi.fn());

vi.mock("../../../src/lib/wfm/wfmPrice.js", () => ({
  fetchPriceBySlug: fetchPriceBySlugMock,
  fetchPriceByName: fetchPriceByNameMock,
}));

vi.mock("../../../src/lib/wfm/orderSummaryRemote.js", () => ({
  fetchOrderSummaryBySlug: fetchOrderSummaryBySlugMock,
}));

vi.mock("../../../src/lib/wfm/wfmItemMeta.js", () => ({
  fetchWfmItemMetaBySlug: fetchWfmItemMetaBySlugMock,
}));

import { __test__ as priceCacheTest, setCachedPrice } from "../../../src/lib/wfm/priceCache.js";
import { clearOrderSummaryCache } from "../../../src/lib/wfm/orderSummaryCache.js";
import { rendererPriceCacheKey } from "../../../config/shared/wfmCacheKeys.js";
import { createInventoryHydrationController } from "../../../src/stores/inventoryHydration.js";
import {
  HYDRATION_BATCH_SIZE,
  HYDRATION_TICK_MS,
  METRIC_FLUSH_BUSY_MS,
  METRIC_FLUSH_MS,
} from "../../../src/stores/hydration/hydrationTypes.js";

const visible: RowIntent = { mode: "visible", orders: false, ducats: false };
const background: RowIntent = { mode: "background", orders: false, ducats: false };
const lookup: WfmItemsLookup = {};

function makeItem(index: number): InventoryBaseItem {
  return {
    name: `Test Item ${index}`,
    internalName: `/Lotus/Test/Item${index}`,
    category: "Misc",
    categoryLabel: "Misc",
    rank: 0,
    maxRank: 0,
    imageUrl: null,
    isPrime: false,
    masteryReq: 0,
    vaulted: false,
    tradable: true,
    description: "",
    components: [],
    drops: [],
    wikiaUrl: null,
    inventoryGroup: "misc",
    partType: "normal",
    amount: 1,
    favorite: false,
    equipped: false,
    orderPlaced: false,
    completeSets: null,
    marketSlug: `test_item_${index}`,
    marketThumb: null,
    subtype: null,
  };
}

function makeMod(): InventoryBaseItem {
  return {
    ...makeItem(99),
    name: "High Noon",
    internalName: "/Lotus/Upgrades/Mods/Melee/HighNoon",
    category: "Mods",
    categoryLabel: "Mods",
    inventoryGroup: "mods",
    maxRank: 3,
    marketSlug: "high_noon",
  };
}

function fetchedSlugs(): string[] {
  return fetchPriceBySlugMock.mock.calls.map((call) => String(call[0]));
}

describe("createInventoryHydrationController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    fetchPriceBySlugMock.mockImplementation(async (slug: string) => ({
      status: "ok",
      slug,
      median: 1,
      timestamp: Date.now(),
    }));
    fetchPriceByNameMock.mockResolvedValue(null);
    fetchOrderSummaryBySlugMock.mockResolvedValue({ status: "not_found" });
    fetchWfmItemMetaBySlugMock.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    priceCacheTest.clearPriceCache();
    clearOrderSummaryCache();
  });

  it("hydrates queued items in fixed batches and ignores duplicate enqueue attempts", async () => {
    const controller = createInventoryHydrationController();
    const items = Array.from({ length: HYDRATION_BATCH_SIZE * 2 + 1 }, (_, index) =>
      makeItem(index),
    );

    controller.enqueue(items, lookup, visible);
    controller.enqueue(items, lookup, visible);

    expect(fetchedSlugs()).toHaveLength(HYDRATION_BATCH_SIZE);

    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS);
    expect(fetchedSlugs()).toHaveLength(HYDRATION_BATCH_SIZE * 2);

    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS);
    expect(fetchedSlugs()).toHaveLength(items.length);
    expect(new Set(fetchedSlugs()).size).toBe(items.length);
  });

  it("batches row flushes while the queue drains and flushes the tail on drain", async () => {
    const controller = createInventoryHydrationController();
    const storeUpdates: number[] = [];
    const unsubscribe = controller.rowsByKey.subscribe((rows) => {
      const size = Object.keys(rows).length;
      if (size > 0) storeUpdates.push(size);
    });

    // Three batches: the queue stays busy past the idle flush delay.
    const items = Array.from({ length: HYDRATION_BATCH_SIZE * 2 + 1 }, (_, index) =>
      makeItem(index),
    );
    controller.enqueue(items, lookup, visible);

    // The idle delay must NOT flush while later batches are still queued.
    await vi.advanceTimersByTimeAsync(METRIC_FLUSH_MS);
    expect(storeUpdates).toHaveLength(0);

    // Drain happens well before the busy delay; the tail must not wait for it.
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS * 2);
    expect(storeUpdates).toEqual([items.length]);

    await vi.advanceTimersByTimeAsync(METRIC_FLUSH_BUSY_MS);
    expect(storeUpdates).toEqual([items.length]);

    unsubscribe();
  });

  it("skips a row that is already priced instead of fetching it again", async () => {
    const controller = createInventoryHydrationController();
    const item = makeItem(1);

    controller.enqueue([item], lookup, visible);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS + METRIC_FLUSH_MS);
    controller.enqueue([item], lookup, visible);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS);

    expect(fetchedSlugs()).toEqual(["test_item_1"]);
  });

  it("fetches on a visible pass after a background pass found nothing for the row", async () => {
    const controller = createInventoryHydrationController();
    const item = makeItem(1);

    controller.enqueue([item], lookup, background);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS + METRIC_FLUSH_MS);
    expect(fetchedSlugs()).toEqual([]);

    // The card scrolls into view: this pass may fetch, so it must not be skipped.
    controller.enqueue([item], lookup, visible);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS);
    expect(fetchedSlugs()).toEqual(["test_item_1"]);
  });

  it("promotes snapshot prices synchronously and still fetches the missing max-rank price when visible", async () => {
    // Bug (a) through the controller: a snapshot with only the rank-0 price
    // used to leave the max-rank price unfetched for the rest of the session.
    setCachedPrice(rendererPriceCacheKey("high_noon", 0), 12);
    const controller = createInventoryHydrationController();
    const mod = makeMod();

    controller.enqueue([mod], lookup, background);
    await vi.advanceTimersByTimeAsync(METRIC_FLUSH_MS);
    let rows: Record<string, unknown> = {};
    controller.rowsByKey.subscribe((value) => {
      rows = value;
    })();
    expect(rows[mod.internalName]).toMatchObject({ priceR0: { status: "ok", value: 12 } });
    expect(fetchedSlugs()).toEqual([]);

    controller.enqueue([mod], lookup, { ...visible, orders: true });
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS + METRIC_FLUSH_MS);

    expect(fetchPriceBySlugMock).toHaveBeenCalledWith(
      "high_noon",
      expect.objectContaining({ rank: 3 }),
    );
    expect(fetchPriceBySlugMock).not.toHaveBeenCalledWith(
      "high_noon",
      expect.objectContaining({ rank: 0 }),
    );
  });

  it("holds a transiently failed row back until its cooldown has passed", async () => {
    fetchPriceBySlugMock.mockResolvedValue({
      status: "transient",
      slug: "test_item_1",
      median: null,
    });
    const controller = createInventoryHydrationController();
    const item = makeItem(1);

    controller.enqueue([item], lookup, visible);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS + METRIC_FLUSH_MS);
    controller.enqueue([item], lookup, visible);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS + METRIC_FLUSH_MS);
    expect(fetchedSlugs()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(20_000);
    controller.enqueue([item], lookup, visible);
    await vi.advanceTimersByTimeAsync(HYDRATION_TICK_MS);
    expect(fetchedSlugs()).toHaveLength(2);
  });
});
