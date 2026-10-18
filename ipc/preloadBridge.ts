import type { IpcRenderer } from "electron";
import type { Bridge, Route, Surface } from "../config/shared/ipcRoute";
import { onIpc } from "./preloadListeners";

function wire(route: { pack?: (...args: never[]) => unknown }, args: unknown[]): unknown[] {
  return route.pack ? [(route.pack as (...a: unknown[]) => unknown)(...args)] : args;
}

function bridged(ipcRenderer: IpcRenderer, route: Route): (...args: never[]) => unknown {
  switch (route.kind) {
    case "invoke":
      return (...args: unknown[]) => ipcRenderer.invoke(route.channel, ...wire(route, args));
    case "send":
      return (...args: unknown[]) => ipcRenderer.send(route.channel, ...wire(route, args));
    case "event":
      return (listener: (...args: unknown[]) => void) =>
        onIpc(ipcRenderer, route.channel, (_event, ...args) => listener(...args));
  }
}

/** The object a preload exposes for one surface of the route registry. */
export function bridgeSurface<S extends Surface>(ipcRenderer: IpcRenderer, surface: S): Bridge<S> {
  const exposed: Record<string, unknown> = {};
  for (const [name, route] of Object.entries(surface)) exposed[name] = bridged(ipcRenderer, route);
  return exposed as Bridge<S>;
}
