import { contextBridge, ipcRenderer } from "electron";
import { DEFAULT_OVERLAY_FIELD_STYLE } from "../config/shared/overlayLayout";
import { overlayRoutes } from "../config/shared/overlayIpcRoutes";
import { bridgeSurface } from "./preloadBridge";

export function installOverlayLayoutBridge(): void {
  contextBridge.exposeInMainWorld("overlayLayoutApi", {
    defaultFieldStyle: DEFAULT_OVERLAY_FIELD_STYLE,
    ...bridgeSurface(ipcRenderer, overlayRoutes.overlayLayoutApi),
  });
}
