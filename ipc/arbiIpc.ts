import fs from "node:fs";
import { dialog } from "electron";

import ctx from "./context";
import { asRunId, registerRunTrackerIpc } from "./runTrackerIpc";
import * as arbiRunTracker from "../services/arbiRunTracker";
import { importEeLog } from "../services/arbiLogImporter";
import type { ArbiImportResult, ArbiRunsPayload } from "../config/shared/arbiTypes";
import { normalizeErrorMessage } from "../config/shared/errors";
import { withScope } from "../services/logger";
import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

const log = withScope("arbiIpc");

const MAX_VITUS = 10_000_000;
/** 20 MiB PNG cap for dashboard exports. */
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

/** Filesystem-safe export name from the node, e.g. "Casta_Ceres_2026-07-04_21-30-15". */
function exportBaseName(id: string): string {
  const run = arbiRunTracker.getRuns().find((r) => r.id === id);
  const node = (run?.node ?? "arbitration").replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "arbitration";
  return `${node.replace(/\s+/g, "_")}_${id}`;
}

function register(): void {
  registerRunTrackerIpc<ArbiRunsPayload, ArbiImportResult>({
    log,
    label: "[Arbi]",
    routes: {
      getRuns: api.getArbiRuns,
      refreshRuns: api.refreshArbiRuns,
      setTags: api.setArbiRunTags,
      setNotes: api.setArbiRunNotes,
      deleteRun: api.deleteArbiRun,
      deleteLog: api.deleteArbiRunLog,
      exportLog: api.exportArbiRunLog,
      importLog: api.importArbiLog,
      showLogInFolder: api.showArbiRunLogInFolder,
    },
    tracker: {
      getRuns: arbiRunTracker.getRuns,
      getDiskUsageBytes: arbiRunTracker.getDiskUsageBytes,
      awaitPendingSaves: arbiRunTracker.awaitPendingArbiSaves,
      setRunTags: arbiRunTracker.setRunTags,
      setRunNotes: arbiRunTracker.setRunNotes,
      deleteRun: arbiRunTracker.deleteRun,
      deleteRunLog: arbiRunTracker.deleteRunLog,
      getRunLogPath: arbiRunTracker.getRunLogPath,
    },
    importLog: importEeLog,
    exportBaseName,
  });

  handle(api.setArbiRunVitus, (_event, id: unknown, vitus: unknown) => {
    const runId = asRunId(id);
    if (!runId) return null;
    let value: number | null = null;
    if (typeof vitus === "number") {
      if (!Number.isFinite(vitus) || vitus < 0 || vitus > MAX_VITUS) return null;
      value = Math.round(vitus);
    } else if (vitus !== null) {
      return null;
    }
    return arbiRunTracker.setRunVitus(runId, value);
  });

  handle(api.saveArbiRunImage, async (_event, id: unknown, png: unknown) => {
    const runId = asRunId(id);
    if (!runId || !ctx.mainWindow) return { ok: false };
    if (!(png instanceof Uint8Array) || png.byteLength === 0 || png.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false };
    }
    const result = await dialog.showSaveDialog(ctx.mainWindow, {
      defaultPath: `${exportBaseName(runId)}.png`,
      filters: [{ name: "PNG image", extensions: ["png"] }],
    });
    if (result.canceled || !result.filePath) return { ok: false };
    try {
      fs.writeFileSync(result.filePath, Buffer.from(png.buffer, png.byteOffset, png.byteLength));
      return { ok: true };
    } catch (err) {
      log.warn("[Arbi] Image export failed:", normalizeErrorMessage(err));
      return { ok: false };
    }
  });
}

export { register };
