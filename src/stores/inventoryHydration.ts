import { writable } from "svelte/store";

import type { InventoryBaseItem } from "../lib/inventoryMarket.js";
import type { WfmItemsLookup } from "../types/ipc.js";

import type { HydrationTask, InventoryHydrationController } from "./hydration/hydrationTypes.js";
import {
  HYDRATION_BATCH_SIZE,
  HYDRATION_TICK_MS,
  METRIC_FLUSH_BUSY_MS,
  METRIC_FLUSH_MS,
} from "./hydration/hydrationTypes.js";
import { hydrateRow } from "./hydration/hydrateRow.js";
import {
  emptyRowState,
  planHasWork,
  planRowFetch,
  refreshFromCache,
  type RowIntent,
  type RowPriceState,
} from "./hydration/rowPriceState.js";

export function createInventoryHydrationController(): InventoryHydrationController {
  const rowsByKeyStore = writable<Record<string, RowPriceState>>({});
  let rowsByKey: Record<string, RowPriceState> = {};
  const pendingPatches = new Map<string, RowPriceState>();
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const pendingKeys = new Set<string>();
  const queuedKeys = new Set<string>();
  let hydrationQueue: HydrationTask[] = [];
  let hydrationRunning = false;
  let isMounted = true;

  const getRow = (key: string): RowPriceState | undefined =>
    pendingPatches.get(key) ?? rowsByKey[key];

  const flushPendingPatches = (): void => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (pendingPatches.size === 0) return;

    const nextRows = { ...rowsByKey };
    for (const [key, row] of pendingPatches) {
      nextRows[key] = row;
    }
    pendingPatches.clear();
    rowsByKey = nextRows;
    rowsByKeyStore.set(rowsByKey);
  };

  const queuePatch = (key: string, row: RowPriceState): void => {
    pendingPatches.set(key, row);
    if (flushTimer) return;
    const delayMs = hydrationQueue.length > 0 ? METRIC_FLUSH_BUSY_MS : METRIC_FLUSH_MS;
    flushTimer = setTimeout(flushPendingPatches, delayMs);
  };

  async function runTask(task: HydrationTask): Promise<void> {
    pendingKeys.add(task.key);
    try {
      const before = getRow(task.key);
      const after = await hydrateRow(task.item, task.lookup, task.intent, before);
      if (after !== before) queuePatch(task.key, after);
    } finally {
      pendingKeys.delete(task.key);
    }
  }

  async function runHydrationPump(): Promise<void> {
    if (hydrationRunning) return;
    hydrationRunning = true;

    try {
      while (isMounted && hydrationQueue.length > 0) {
        const batch = hydrationQueue.splice(0, HYDRATION_BATCH_SIZE);

        const pendingTasks: Promise<void>[] = [];
        for (const task of batch) {
          queuedKeys.delete(task.key);
          if (!isMounted) break;
          pendingTasks.push(runTask(task));
        }

        if (pendingTasks.length > 0) {
          await Promise.all(pendingTasks);
        }

        await new Promise((resolve) => setTimeout(resolve, HYDRATION_TICK_MS));
      }
    } finally {
      hydrationRunning = false;
      if (isMounted && hydrationQueue.length > 0) {
        void runHydrationPump();
      } else {
        flushPendingPatches();
      }
    }
  }

  function enqueue(items: InventoryBaseItem[], lookup: WfmItemsLookup, intent: RowIntent): void {
    const now = Date.now();
    const promotions: Array<[string, RowPriceState]> = [];
    let appended = false;

    for (const item of items) {
      const key = item.internalName;
      if (pendingKeys.has(key) || queuedKeys.has(key)) continue;

      // Snapshot data lands synchronously so cards never wait on the pump for it.
      const existing = getRow(key);
      const base = existing ?? emptyRowState(item.marketSlug);
      const refreshed = refreshFromCache(base, item, now);
      if (refreshed !== base) promotions.push([key, refreshed]);

      if (!planHasWork(planRowFetch(refreshed, item, intent, now))) continue;

      queuedKeys.add(key);
      hydrationQueue.push({ key, item, lookup, intent });
      appended = true;
    }

    // Queue first so the flush delay sees the drain that is about to start.
    for (const [key, row] of promotions) queuePatch(key, row);

    if (appended) {
      void runHydrationPump();
    }
  }

  return {
    rowsByKey: {
      subscribe: rowsByKeyStore.subscribe,
    },
    enqueue,
    pause() {
      isMounted = false;
    },
    resume() {
      if (!isMounted) {
        isMounted = true;
        if (hydrationQueue.length > 0) {
          void runHydrationPump();
        }
      }
    },
  };
}

let _singleton: InventoryHydrationController | null = null;

/** Returns a shared singleton hydration controller that persists across view switches. */
export function getInventoryHydrationController(): InventoryHydrationController {
  if (!_singleton) {
    _singleton = createInventoryHydrationController();
  }
  return _singleton;
}
