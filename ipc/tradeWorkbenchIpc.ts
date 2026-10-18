import ctx from "./context";

import { withScope } from "../services/logger";
import * as tradeWorkbench from "../services/tradeWorkbench";
import { normalizeErrorMessage } from "../config/shared/errors";
import { WORKBENCH_STATE_EVENT } from "../config/shared/ipcChannels";
import {
  parseWorkbenchOverrideAck,
  parseWorkbenchPlan,
  parseWorkbenchResolveReview,
  parseWorkbenchSafetySnapshot,
  validateWorkbenchPlan,
  type WorkbenchState,
} from "../config/shared/tradeWorkbenchTypes";
import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api, tradeApi } = mainWindowRoutes;

const log = withScope("tradeWorkbenchIpc");

function pushState(state: WorkbenchState): void {
  const win = ctx.mainWindow;
  if (!win || win.isDestroyed()) return;
  win.webContents.send(WORKBENCH_STATE_EVENT, state);
}

function register(): void {
  tradeWorkbench.configureTradeWorkbench({ onState: pushState });
  tradeWorkbench.initTradeWorkbench();

  handle(api.workbenchGetState, () => tradeWorkbench.getWorkbenchState());

  handle(api.workbenchPreviewPlan, (_event, plan, safety) => {
    const parsedPlan = parseWorkbenchPlan(plan);
    const parsedSafety = parseWorkbenchSafetySnapshot(safety);
    if (!parsedPlan || !parsedSafety) {
      log.warn("[Security] workbench:preview-plan blocked due to invalid payload");
      return { error: "Invalid workbench plan payload." };
    }
    return validateWorkbenchPlan(parsedPlan, parsedSafety);
  });

  handle(tradeApi.workbenchExecutePlan, (_event, plan, safety) => {
    const parsedPlan = parseWorkbenchPlan(plan);
    const parsedSafety = parseWorkbenchSafetySnapshot(safety);
    if (!parsedPlan || !parsedSafety) {
      log.warn("[Security] workbench:execute-plan blocked due to invalid payload");
      return {
        started: false,
        error: "Invalid workbench plan payload.",
        state: tradeWorkbench.getWorkbenchState(),
      };
    }
    return tradeWorkbench.executeWorkbenchPlan(parsedPlan, parsedSafety);
  });

  handle(api.workbenchCancelRun, () => tradeWorkbench.cancelWorkbenchRun());

  handle(api.workbenchAcknowledgeOverride, (_event, payload) => {
    const ack = parseWorkbenchOverrideAck(payload);
    if (!ack) {
      log.warn("[Security] workbench:ack-override blocked due to invalid payload");
      return { error: "Invalid override acknowledgement payload." };
    }
    return tradeWorkbench.acknowledgeWorkbenchOverride(ack);
  });

  handle(api.workbenchReconcile, async () => {
    try {
      return await tradeWorkbench.reconcileWorkbench();
    } catch (err) {
      const message = normalizeErrorMessage(err, "Reconciliation failed.");
      log.error("[Workbench IPC] reconcile:", message);
      return { error: message };
    }
  });

  handle(api.workbenchResolveReview, (_event, payload) => {
    const parsed = parseWorkbenchResolveReview(payload);
    if (!parsed) {
      log.warn("[Security] workbench:resolve-review blocked due to invalid payload");
      return { error: "Invalid review resolution payload." };
    }
    return tradeWorkbench.resolveWorkbenchReview(parsed);
  });
}

export { register };
