import { createDiskCacheIpc } from "./diskCacheIpcFactory";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

const { register } = createDiskCacheIpc({
  scope: "rankedHotsetIpc",
  filename: "ranked-hotset.json",
  routes: { load: api.loadRankedHotset, save: api.saveRankedHotset },
  noun: "ranked hotset",
});

export { register };
