import type { IpcRenderer } from "electron";
import { describe, expect, it, vi } from "vitest";

import type { Bridge } from "../../config/shared/ipcRoute";
import { mainWindowRoutes, type ApiRoutes } from "../../config/shared/ipcRoutes";
import { overlayRoutes } from "../../config/shared/overlayIpcRoutes";
import { bridgeSurface } from "../../ipc/preloadBridge";

type Listener = (event: unknown, ...args: unknown[]) => void;

function fakeIpcRenderer() {
  const listeners = new Map<string, Set<Listener>>();
  const ipc = {
    invoke: vi.fn(async (..._args: unknown[]) => "answer"),
    send: vi.fn(),
    on: vi.fn((channel: string, listener: Listener) => {
      const set = listeners.get(channel) ?? new Set<Listener>();
      set.add(listener);
      listeners.set(channel, set);
      return ipc;
    }),
    removeListener: vi.fn((channel: string, listener: Listener) => {
      listeners.get(channel)?.delete(listener);
      return ipc;
    }),
  };
  const emit = (channel: string, ...args: unknown[]): void => {
    for (const listener of listeners.get(channel) ?? []) listener({}, ...args);
  };
  return { ipc, renderer: ipc as unknown as IpcRenderer, emit };
}

describe("preload bridge", () => {
  const { api, tradeApi } = mainWindowRoutes;

  it("exposes one method per route", () => {
    const { renderer } = fakeIpcRenderer();
    const bridge = bridgeSurface(renderer, api);
    expect(Object.keys(bridge).sort()).toEqual(Object.keys(api).sort());
  });

  it("invokes with the caller's arguments in order", async () => {
    const { ipc, renderer } = fakeIpcRenderer();
    const bridge = bridgeSurface(renderer, api);
    await expect(bridge.ledgerUpdateEvent("a", { platChange: 5 })).resolves.toBe("answer");
    expect(ipc.invoke).toHaveBeenCalledWith(api.ledgerUpdateEvent.channel, "a", { platChange: 5 });
  });

  it("folds the arguments into one payload where the route packs them", async () => {
    const { ipc, renderer } = fakeIpcRenderer();
    await bridgeSurface(renderer, tradeApi).wfmCloseOrder("order-1", 2);
    expect(ipc.invoke).toHaveBeenCalledWith(tradeApi.wfmCloseOrder.channel, {
      orderId: "order-1",
      quantity: 2,
    });
    bridgeSurface(renderer, overlayRoutes.overlay).moveBy(3, -4);
    expect(ipc.send).toHaveBeenCalledWith(overlayRoutes.overlay.moveBy.channel, { dx: 3, dy: -4 });
  });

  it("sends fire-and-forget routes without waiting", () => {
    const { ipc, renderer } = fakeIpcRenderer();
    bridgeSurface(renderer, api).logWarn("careful", 1, 2);
    expect(ipc.send).toHaveBeenCalledWith(api.logWarn.channel, "careful", 1, 2);
    expect(ipc.invoke).not.toHaveBeenCalled();
  });

  it("hands event payloads to the listener and stops after dispose", () => {
    const { renderer, emit } = fakeIpcRenderer();
    const bridge = bridgeSurface(renderer, overlayRoutes.rivenOverlay);
    const listener = vi.fn();
    const dispose = bridge.onSessionStart(listener);
    emit(overlayRoutes.rivenOverlay.onSessionStart.channel, "Rubico", 2000);
    dispose();
    emit(overlayRoutes.rivenOverlay.onSessionStart.channel, "Soma", 1000);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("Rubico", 2000);
  });

  it("types each exposed method from its route", () => {
    const bridge = {} as Bridge<ApiRoutes>;
    // Never called: these lines exist for tsc -p tsconfig.tests.json.
    const typeOnly = async (): Promise<void> => {
      const settings = await bridge.getOverlaySettings();
      settings.overlayScale.toFixed();
      // @ts-expect-error - takes no arguments
      await bridge.getOverlaySettings("all");
      // @ts-expect-error - the query is a string
      await bridge.wfmSearchItems(42);
      bridge.onInventoryStatusUpdated((status) => status.found);
      // @ts-expect-error - sends answer nothing
      void (await bridge.openExternal("https://warframe.market")).ok;
    };
    expect(typeOnly).toBeTypeOf("function");
  });
});
