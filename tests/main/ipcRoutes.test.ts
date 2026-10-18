import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as channels from "../../config/shared/ipcChannels";
import type { Route, Surface } from "../../config/shared/ipcRoute";
import { mainWindowRoutes } from "../../config/shared/ipcRoutes";
import { overlayRoutes } from "../../config/shared/overlayIpcRoutes";
import { makeEvent, makeWindowStub } from "./senderGuardHelpers";

type Handler = (event: unknown, ...args: unknown[]) => unknown;

const h = vi.hoisted(() => ({
  handlers: new Map<string, Handler>(),
  listeners: new Map<string, Handler>(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: (channel: string, handler: Handler) => h.handlers.set(channel, handler),
    on: (channel: string, handler: Handler) => h.listeners.set(channel, handler),
  },
}));

const ROOT = path.join(__dirname, "..", "..");
const surfaces: Record<string, Surface> = { ...mainWindowRoutes, ...overlayRoutes };

function routesOf(kind: Route["kind"]): { path: string; route: Route }[] {
  return Object.entries(surfaces).flatMap(([surface, routes]) =>
    Object.entries(routes)
      .filter(([, route]) => route.kind === kind)
      .map(([name, route]) => ({ path: `${surface}.${name}`, route })),
  );
}

const callRoutes = [...routesOf("invoke"), ...routesOf("send")];

describe("ipc route registry", () => {
  it("gives each renderer-to-main channel one route, shared by identity", () => {
    const byChannel = new Map<string, Route>();
    for (const { path: at, route } of callRoutes) {
      const seen = byChannel.get(route.channel);
      if (seen) expect(seen, `${at} reuses ${route.channel}`).toBe(route);
      byChannel.set(route.channel, route);
    }
    expect(byChannel.size).toBeGreaterThan(150);
  });

  it("only uses channels named in ipcChannels.ts", () => {
    const known = new Set<string>(Object.values(channels));
    for (const { path: at, route } of [...callRoutes, ...routesOf("event")]) {
      expect(known.has(route.channel), at).toBe(true);
    }
  });

  // Snapshot of the sender guards ipcSecurity applied per channel before the registry.
  it("keeps every route's sender policy", () => {
    const policies = Object.fromEntries(
      callRoutes
        .filter(({ route }) => route.kind !== "event" && route.sender !== "main")
        .map(({ path: at, route }) => [at, route.kind !== "event" && route.sender]),
    );
    expect(policies).toEqual({
      "api.popoutSetPinned": "popout",
      "overlay.close": "scanOverlay",
      "overlay.getPrice": "scanOverlay",
      "overlay.getThemeVars": "anyOverlay",
      "overlay.getMessages": "anyOverlay",
      "overlay.getDragHint": "scanOverlay",
      "overlay.moveBy": "scanOverlay",
      "overlay.ready": "scanOverlay",
      "overlay.reportContentHeight": "scanOverlay",
      "overlay.reportPresentation": "scanOverlay",
      "rivenOverlay.close": "rivenOverlay",
      "rivenOverlay.openAuction": "rivenOverlay",
      "rivenOverlay.setSimilarAuctions": "rivenOverlay",
      "rivenOverlay.requestRescan": "rivenOverlay",
      "rivenOverlay.moveBy": "scanOverlay",
      "rivenOverlay.ready": "scanOverlay",
      "rivenOverlay.getDragHint": "scanOverlay",
      "rivenOverlay.getThemeVars": "anyOverlay",
      "rivenOverlay.getMessages": "anyOverlay",
      "arbiSummary.ready": "arbiSummary",
      "arbiSummary.close": "arbiSummary",
      "arbiSummary.openDetails": "arbiSummary",
      "arbiSummary.moveBy": "scanOverlay",
      "arbiSummary.getThemeVars": "anyOverlay",
      "arbiSummary.getMessages": "anyOverlay",
      "tradeNotificationApi.getThemeVars": "anyOverlay",
      "tradeNotificationApi.dismiss": "tradeNotification",
      "tradeNotificationApi.getMessages": "anyOverlay",
      "overlayLayoutApi.getLayout": "anyOverlay",
    });
    for (const { path: at, route } of callRoutes) {
      if (route.kind !== "event" && route.sender === "main")
        expect(at).toMatch(/^(api|tradeApi)\./);
    }
  });

  // Registration is spread over the ipc modules, so this reads their source: a route
  // counts once a module hands it to handle/listen (or a factory) or registers its channel raw.
  it("has a main-process handler for every invoke and send route", () => {
    const sources = [path.join(ROOT, "main.ts")];
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".ts")) sources.push(full);
      }
    };
    walk(path.join(ROOT, "ipc"));
    const text = sources.map((file) => fs.readFileSync(file, "utf-8")).join("\n");

    const surfaceNames = Object.keys(surfaces).join("|");
    const refs = new RegExp(
      `(?:\\b(?:handle|listen|stub)\\(\\s*|:\\s*)(${surfaceNames})\\.(\\w+)\\b`,
      "g",
    );
    const covered = new Set<string>();
    for (const [, surface, name] of text.matchAll(refs)) {
      const route = surfaces[surface!]?.[name!];
      if (route) covered.add(route.channel);
    }
    const constants = channels as Record<string, string>;
    for (const [, constant] of text.matchAll(/\.handle\(\s*([A-Z_]+)\b/g)) {
      if (constants[constant!]) covered.add(constants[constant!]!);
    }

    const missing = callRoutes.filter(({ route }) => !covered.has(route.channel));
    expect(missing.map(({ path: at }) => at)).toEqual([]);
  });

  it("folds only the calls whose handler reads one payload object", () => {
    const packed = callRoutes
      .filter(({ route }) => route.kind !== "event" && route.pack)
      .map(({ path: at }) => at)
      .sort();
    expect(packed).toEqual([
      "api.marketStatsHistoryMerge",
      "api.searchDrops",
      "api.wfmLookupItemBySlug",
      "api.wfmSearchItems",
      "arbiSummary.moveBy",
      "overlay.moveBy",
      "rivenOverlay.moveBy",
      "tradeApi.wfmCloseOrder",
      "tradeApi.wfmDeleteOrder",
      "tradeApi.wfmSetStatus",
      "tradeApi.wfmSetVisible",
      "tradeApi.wfmUpdateOrder",
    ]);
    expect(mainWindowRoutes.api.wfmSearchItems.pack?.("relic" as never, 5 as never)).toEqual({
      query: "relic",
      limit: 5,
    });
  });
});

describe("route handlers", () => {
  const MAIN_URL = "file:///D:/app/renderer/dist/index.html";
  const OVERLAY_URL = "file:///D:/app/renderer/overlay.html";
  const RIVEN_URL = "file:///D:/app/renderer/riven-overlay.html";
  const TOAST_URL = "file:///D:/app/renderer/trade-notification.html";
  let routes: typeof import("../../ipc/routeHandlers");
  let security: typeof import("../../ipc/ipcSecurity");

  beforeEach(async () => {
    vi.resetModules();
    h.handlers.clear();
    h.listeners.clear();
    const { default: ctx } = await import("../../ipc/context");
    ctx.mainWindow = makeWindowStub(11);
    ctx.overlayWindow = makeWindowStub(21);
    ctx.rivenOverlayLeftWindow = makeWindowStub(31);
    ctx.tradeNotificationWindow = makeWindowStub(41);
    routes = await import("../../ipc/routeHandlers");
    security = await import("../../ipc/ipcSecurity");
  });

  function invoke(channel: string, id: number, url: string): Promise<unknown> {
    return Promise.resolve(h.handlers.get(channel)!(makeEvent(id, url)));
  }

  it("guards each invoke with its route's sender policy", async () => {
    const { api } = mainWindowRoutes;
    const { overlay, rivenOverlay } = overlayRoutes;
    routes.handle(api.getAppRuntimeInfo, () => ({ isPackaged: false }));
    routes.handle(overlay.getThemeVars, () => ({}));
    routes.handle(overlay.getDragHint, () => ({
      hotkey: null,
      dismissed: false,
      viaSettings: false,
    }));
    routes.handle(rivenOverlay.setSimilarAuctions, () => true);

    await expect(invoke(api.getAppRuntimeInfo.channel, 11, MAIN_URL)).resolves.toEqual({
      isPackaged: false,
    });
    await expect(invoke(api.getAppRuntimeInfo.channel, 21, OVERLAY_URL)).rejects.toThrow(
      "Unauthorized IPC sender",
    );
    // The trade toast reads theme vars like every overlay, but has no scan controls.
    await expect(invoke(overlay.getThemeVars.channel, 41, TOAST_URL)).resolves.toEqual({});
    await expect(invoke(overlay.getDragHint.channel, 41, TOAST_URL)).rejects.toThrow(
      "Unauthorized IPC sender",
    );
    await expect(invoke(rivenOverlay.setSimilarAuctions.channel, 31, RIVEN_URL)).resolves.toBe(
      true,
    );
    await expect(invoke(rivenOverlay.setSimilarAuctions.channel, 21, OVERLAY_URL)).rejects.toThrow(
      "Unauthorized IPC sender",
    );
  });

  it("lets only a live popout pin itself", async () => {
    const { popoutSetPinned } = mainWindowRoutes.api;
    routes.handle(popoutSetPinned, () => ({ ok: true }));

    await expect(invoke(popoutSetPinned.channel, 11, MAIN_URL)).rejects.toThrow(
      "Unauthorized IPC sender",
    );
    security.setPopoutSenderLookup((id) => id === 51);
    await expect(invoke(popoutSetPinned.channel, 51, MAIN_URL)).resolves.toEqual({ ok: true });
  });

  it("drops sends from windows outside the route's policy", () => {
    const { ready } = overlayRoutes.arbiSummary;
    const listener = vi.fn();
    routes.listen(ready, listener);
    const channel = ready.channel;
    h.listeners.get(channel)!(makeEvent(11, MAIN_URL));
    expect(listener).not.toHaveBeenCalled();
  });

  it("rejects handlers that break the route's contract at compile time", () => {
    const { api } = mainWindowRoutes;
    // Never called: these lines exist for tsc -p tsconfig.tests.json.
    const typeOnly = (): void => {
      // @ts-expect-error - answers a string where the route promises OverlaySettings
      routes.handle(api.getOverlaySettings, () => "settings");
      // @ts-expect-error - reads an argument the renderer never sends
      routes.handle(api.getOverlaySettings, (_event, extra: unknown) => extra as never);
      // @ts-expect-error - a send route has no answer to give
      routes.handle(api.openExternal, () => undefined);
      // @ts-expect-error - an invoke route is not listened to
      routes.listen(api.getInventory, () => undefined);
      // Arguments arrive unchecked, so a handler cannot assume their type.
      // @ts-expect-error - the id is unknown until validated
      routes.handle(api.removeNotificationEntry, (_event, id: string) => id.length > 0);
      routes.handle(api.removeNotificationEntry, (_event, id) => typeof id === "string");
    };
    expect(typeOnly).toBeTypeOf("function");
  });
});
