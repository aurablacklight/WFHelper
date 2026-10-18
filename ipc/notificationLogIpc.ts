import ctx from "./context";

import { normalizeErrorMessage } from "../config/shared/errors";
import { withScope } from "../services/logger";
import * as notificationLog from "../services/notificationLog";
import { NOTIFICATION_HISTORY_ADDED } from "../config/shared/ipcChannels";
import type { NotificationKind } from "../config/shared/notifications";
import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

const log = withScope("notificationLogIpc");

// Every caller is already on a notification path, so a failed write costs the
// history entry only and must never take the notification down with it.
export function recordNotification(kind: NotificationKind, title: string, body: string): void {
  try {
    const entry = notificationLog.record(kind, title, body);
    const win = ctx.mainWindow;
    if (win && !win.isDestroyed()) win.webContents.send(NOTIFICATION_HISTORY_ADDED, entry);
  } catch (err) {
    log.warn("[Notifications] history record failed:", normalizeErrorMessage(err));
  }
}

function register(): void {
  handle(api.getNotificationHistory, () => notificationLog.getAll());

  handle(api.clearNotificationHistory, () => {
    notificationLog.clear();
  });

  handle(api.removeNotificationEntry, (_event, id: unknown) =>
    typeof id === "string" && id ? notificationLog.remove(id) : false,
  );
}

export { register };
