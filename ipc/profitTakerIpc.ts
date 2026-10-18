import { registerRunTrackerIpc } from "./runTrackerIpc";
import * as ptTracker from "../services/profitTakerTracker";
import { importProfitTakerLog } from "../services/profitTakerLogImporter";
import type { PtImportResult, PtRunsPayload } from "../config/shared/profitTakerTypes";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";
import { withScope } from "../services/logger";

const { api } = mainWindowRoutes;

function register(): void {
  registerRunTrackerIpc<PtRunsPayload, PtImportResult>({
    log: withScope("profitTakerIpc"),
    label: "[PT]",
    routes: {
      getRuns: api.getPtRuns,
      refreshRuns: api.refreshPtRuns,
      setTags: api.setPtRunTags,
      setNotes: api.setPtRunNotes,
      deleteRun: api.deletePtRun,
      deleteLog: api.deletePtRunLog,
      exportLog: api.exportPtRunLog,
      importLog: api.importPtLog,
      showLogInFolder: api.showPtRunLogInFolder,
    },
    tracker: {
      getRuns: ptTracker.getPtRuns,
      getDiskUsageBytes: ptTracker.getPtDiskUsageBytes,
      awaitPendingSaves: ptTracker.awaitPendingPtSaves,
      setRunTags: ptTracker.setPtRunTags,
      setRunNotes: ptTracker.setPtRunNotes,
      deleteRun: ptTracker.deletePtRun,
      deleteRunLog: ptTracker.deletePtRunLog,
      getRunLogPath: ptTracker.getPtRunLogPath,
    },
    importLog: importProfitTakerLog,
    exportBaseName: (id) => `profit-taker_${id}`,
  });
}

export { register };
