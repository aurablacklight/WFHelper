// E2E-only in-memory WFM fixture, disabled in packaged builds.
import fs from "node:fs";
import { app, type IpcMainInvokeEvent } from "electron";

import {
  parseCloseOrderPayload,
  parseSetVisiblePayload,
  parseUpdateOrderPayload,
} from "./wfmValidators";
import { withScope } from "../services/logger";
import type { WfmContract } from "../config/shared/wfmContracts";
import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";
import type { InvokeRoute, Untrusted, WireArgs } from "../config/shared/ipcRoute";

const { api, tradeApi } = mainWindowRoutes;

/** Some fixture answers are thinner than the live service's, so they skip the answer check. */
function stub<R extends InvokeRoute>(
  route: R,
  handler: (event: IpcMainInvokeEvent, ...args: Untrusted<WireArgs<R>>) => unknown,
): void {
  handle(route, handler as never);
}

const log = withScope("wfmFixtureIpc");

interface FixtureOrder {
  id: string;
  orderType: string;
  platinum: number;
  quantity: number;
  perTrade?: number;
  visible: boolean;
  modRank: number | null;
  subtype?: string | null;
  itemId: string | null;
  itemName: string;
  itemUrlName: string | null;
  itemThumb: string | null;
}

interface FixtureOrders {
  sell: FixtureOrder[];
  buy: FixtureOrder[];
  contracts: WfmContract[];
}

const FIXTURE_SESSION = { loggedIn: true, userName: "E2E Tester", platform: "pc" };

function loadFixtureOrders(file: string): FixtureOrders {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<FixtureOrders>;
  return {
    sell: Array.isArray(parsed.sell) ? parsed.sell : [],
    buy: Array.isArray(parsed.buy) ? parsed.buy : [],
    contracts: Array.isArray(parsed.contracts) ? parsed.contracts : [],
  };
}

export function registerWfmFixtures(): boolean {
  const file = process.env.WFHELPER_WFM_FIXTURES;
  if (!file) return false;
  if (app.isPackaged) {
    log.warn("[WFMFixtures] WFHELPER_WFM_FIXTURES ignored in packaged build");
    return false;
  }

  const orders = loadFixtureOrders(file);
  log.warn(
    `[WFMFixtures] serving WFM IPC from fixtures (${orders.sell.length} sell / ${orders.buy.length} buy):`,
    file,
  );

  const allOrders = () => [...orders.sell, ...orders.buy];

  // Rewriting the fixture mid-run stands in for a change made outside the app.
  let fixtureMtimeMs = 0;
  const syncFixtureFromDisk = (): void => {
    try {
      const mtimeMs = fs.statSync(file).mtimeMs;
      if (mtimeMs === fixtureMtimeMs) return;
      const reloaded = loadFixtureOrders(file);
      if (fixtureMtimeMs !== 0) {
        orders.sell = reloaded.sell;
        orders.buy = reloaded.buy;
        orders.contracts = reloaded.contracts;
      }
      fixtureMtimeMs = mtimeMs;
    } catch (err) {
      log.warn("[WFMFixtures] fixture reload failed:", String(err));
    }
  };
  syncFixtureFromDisk();

  handle(api.wfmSignIn, async () => FIXTURE_SESSION);
  stub(api.wfmSignOut, async () => ({
    loggedIn: false,
    userName: null,
    platform: "pc",
  }));
  handle(api.wfmGetSession, async () => FIXTURE_SESSION);
  handle(api.wfmGetOrders, async () => {
    syncFixtureFromDisk();
    return {
      sell: orders.sell.map((entry) => ({ ...entry })),
      buy: orders.buy.map((entry) => ({ ...entry })),
    };
  });
  handle(api.wfmGetContracts, async () => {
    syncFixtureFromDisk();
    return {
      contracts: orders.contracts.map((entry) => ({ ...entry })),
      page: 1,
      totalPages: 1,
      hasMore: false,
    };
  });
  handle(tradeApi.wfmCreateOrder, async () => ({
    error: "Order creation is not available in fixture mode.",
  }));
  stub(tradeApi.wfmUpdateOrder, async (_event, payload) => {
    const parsed = parseUpdateOrderPayload(payload);
    if (!parsed) return { error: "Invalid update-order payload." };
    const order = allOrders().find((entry) => entry.id === parsed.orderId);
    if (!order) return { error: "Order not found." };
    if (typeof parsed.updates.platinum === "number") order.platinum = parsed.updates.platinum;
    if (typeof parsed.updates.quantity === "number") order.quantity = parsed.updates.quantity;
    if (typeof parsed.updates.visible === "boolean") order.visible = parsed.updates.visible;
    if (typeof parsed.updates.modRank === "number") order.modRank = parsed.updates.modRank;
    if (typeof parsed.updates.subtype === "string") order.subtype = parsed.updates.subtype;
    return { ok: true };
  });
  stub(tradeApi.wfmDeleteOrder, async (_event, payload) => {
    const orderId = (payload as { orderId?: unknown } | null)?.orderId;
    orders.sell = orders.sell.filter((entry) => entry.id !== orderId);
    orders.buy = orders.buy.filter((entry) => entry.id !== orderId);
    return { ok: true };
  });
  handle(tradeApi.wfmCloseOrder, async (_event, payload) => {
    const parsed = parseCloseOrderPayload(payload);
    if (!parsed) return { error: "Invalid close-order payload." };
    const order = allOrders().find((entry) => entry.id === parsed.orderId);
    if (!order) return { error: "Order not found." };
    // WFM closes whole trades only: a multiple of perTrade, at most the listed quantity.
    if (parsed.quantity > order.quantity || parsed.quantity % (order.perTrade ?? 1) !== 0) {
      return { error: "Close quantity must be whole trades of the listing." };
    }
    order.quantity -= parsed.quantity;
    if (order.quantity < 1) {
      orders.sell = orders.sell.filter((entry) => entry.id !== order.id);
      orders.buy = orders.buy.filter((entry) => entry.id !== order.id);
    }
    return { closed: true, id: order.id };
  });
  stub(tradeApi.wfmSetVisible, async (_event, payload) => {
    const parsed = parseSetVisiblePayload(payload);
    if (!parsed) return { error: "Invalid set-visible payload." };
    for (const order of allOrders()) {
      if (parsed.orderIds.includes(order.id)) order.visible = parsed.visible;
    }
    return { ok: true };
  });
  handle(api.wfmSearchItems, async () => []);
  stub(api.wfmLookupItemBySlug, async (_event, payload) => {
    const slug = (payload as { slug?: unknown } | null)?.slug;
    const order = allOrders().find((entry) => entry.itemUrlName === slug);
    if (!order) return { error: "Item not found in fixture." };
    return {
      id: order.itemId,
      item_name: order.itemName,
      url_name: order.itemUrlName,
      thumb: order.itemThumb,
      icon: null,
      maxRank: order.modRank == null ? null : Math.max(1, order.modRank),
      subtypes:
        order.subtype === "regular" || order.subtype === "atragraph"
          ? ["regular", "atragraph"]
          : [],
    };
  });
  stub(api.wfmGetMe, async () => ({ status: "online" }));
  stub(tradeApi.wfmSetStatus, async () => ({ ok: true }));
  stub(api.wfmPresenceState, async () => ({
    status: "online",
    expiresAt: null,
    autoActive: false,
    awayActive: false,
  }));

  return true;
}
