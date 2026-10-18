import { afterEach, describe, expect, it, vi } from "vitest";

import { invoke, on, send, tradeInvoke } from "../../../src/lib/ipc.js";

function installBridge(api: Record<string, unknown>, tradeApi: Record<string, unknown> = {}): void {
  (globalThis as { window?: unknown }).window = { api, tradeApi };
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("renderer ipc helpers", () => {
  it("calls the preload method an invoke names", async () => {
    const getInventoryStatus = vi.fn(async () => ({ found: true }));
    const wfmCloseOrder = vi.fn(async () => ({ closed: true, id: "o" }));
    installBridge({ getInventoryStatus }, { wfmCloseOrder });

    await expect(invoke("getInventoryStatus")).resolves.toEqual({ found: true });
    await tradeInvoke("wfmCloseOrder", "o", 1);
    expect(wfmCloseOrder).toHaveBeenCalledWith("o", 1);
  });

  it("subscribes through the preload method registered for the channel", () => {
    const dispose = vi.fn();
    const onInventoryStatusUpdated = vi.fn(() => dispose);
    installBridge({ onInventoryStatusUpdated });
    const callback = vi.fn();

    expect(on("inventory-status-updated", callback)).toBe(dispose);
    expect(onInventoryStatusUpdated).toHaveBeenCalledWith(callback);
  });

  it("sends through the preload method registered for the channel", () => {
    const openExternal = vi.fn();
    installBridge({ openExternal });
    send("open-external", "https://warframe.market");
    expect(openExternal).toHaveBeenCalledWith("https://warframe.market");
  });

  it("types calls from the route registry", () => {
    // Never called: these lines exist for the renderer tsc pass.
    const typeOnly = (): void => {
      on("inventory-status-updated", (status) => status.found);
      on("profile-account-changed", () => undefined);
      // @ts-expect-error - not an event channel
      on("get-inventory", () => undefined);
      // @ts-expect-error - the url is a string
      send("open-external", 42);
      // @ts-expect-error - trade mutations go through tradeInvoke
      void invoke("wfmCloseOrder", "o", 1);
      // @ts-expect-error - the quantity is a number
      void tradeInvoke("wfmCloseOrder", "o", "1");
    };
    expect(typeOnly).toBeTypeOf("function");
  });
});
