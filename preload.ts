import { contextBridge, ipcRenderer } from "electron";
import { mainWindowRoutes } from "./config/shared/ipcRoutes";
import { bridgeSurface } from "./ipc/preloadBridge";

try {
  contextBridge.exposeInMainWorld("api", {
    platform: process.platform,
    ...bridgeSurface(ipcRenderer, mainWindowRoutes.api),
  });
  contextBridge.exposeInMainWorld(
    "tradeApi",
    bridgeSurface(ipcRenderer, mainWindowRoutes.tradeApi),
  );
} catch (err) {
  console.error("[Preload] FATAL: contextBridge.exposeInMainWorld failed:", err);
}
