import { installOverlayLayoutBridge } from "./ipc/overlayLayoutPreload";
import { contextBridge, ipcRenderer } from "electron";
import { installOverlayContentVisibility } from "./ipc/overlayContentVisibility";
import { overlayRoutes } from "./config/shared/overlayIpcRoutes";
import { bridgeSurface } from "./ipc/preloadBridge";

installOverlayContentVisibility(ipcRenderer);
installOverlayLayoutBridge();

contextBridge.exposeInMainWorld("overlay", bridgeSurface(ipcRenderer, overlayRoutes.overlay));
