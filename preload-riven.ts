import { installOverlayLayoutBridge } from "./ipc/overlayLayoutPreload";
import { contextBridge, ipcRenderer } from "electron";
import { onIpc } from "./ipc/preloadListeners";
import { installOverlayContentVisibility } from "./ipc/overlayContentVisibility";
import { overlayRoutes } from "./config/shared/overlayIpcRoutes";
import { bridgeSurface } from "./ipc/preloadBridge";

const routes = overlayRoutes.rivenOverlay;

installOverlayContentVisibility(ipcRenderer);
installOverlayLayoutBridge();

contextBridge.exposeInMainWorld("rivenOverlay", {
  ...bridgeSurface(ipcRenderer, routes),
  // Anything but an explicit false shows the similar auctions.
  onSimilarAuctions: (cb: (shown: boolean) => void) =>
    onIpc(ipcRenderer, routes.onSimilarAuctions.channel, (_event, shown) => cb(shown !== false)),
});
