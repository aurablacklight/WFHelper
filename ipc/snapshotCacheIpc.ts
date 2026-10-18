import { createDiskCacheIpc } from "./diskCacheIpcFactory";
import { isValidSnapshotBlob } from "../config/shared/wfmSnapshotValidation";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

const { register } = createDiskCacheIpc({
  scope: "snapshotCacheIpc",
  filename: "snapshot-cache.json",
  routes: { load: api.loadSnapshotCache, save: api.saveSnapshotCache },
  noun: "snapshot cache",
  validateData: isValidSnapshotBlob,
});

export { register };
