import * as statsTracker from "../services/statsTracker";
import * as tradeTracker from "../services/tradeTracker";

import {
  isValidStatsImportPayload,
  sanitizeStatsImportEntries,
} from "../config/shared/statsImport";
import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

function register(): void {
  handle(api.getStatsHistory, () => statsTracker.getHistory());

  handle(api.getStatsCurrentSession, () => statsTracker.getCurrentSession());

  handle(api.importStatsHistory, (_event, raw: unknown) => {
    if (!isValidStatsImportPayload(raw)) return { ok: false, count: 0 };
    const count = statsTracker.importHistory(sanitizeStatsImportEntries(raw));
    return { ok: true, count };
  });

  // Reads live + archives: finished years leave the live log but stay visible here.
  handle(api.getTradeLog, () => tradeTracker.getRecentTradeLog());

  handle(api.importTradeLog, (_event, raw: unknown) => {
    if (!Array.isArray(raw)) return { ok: false, count: 0 };
    const count = tradeTracker.importTradeLog(raw);
    return { ok: true, count };
  });
}

export { register };
