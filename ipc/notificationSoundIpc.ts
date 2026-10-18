import {
  getNotificationSound,
  saveNotificationSound,
  resetNotificationSound,
} from "../services/notificationSound";

import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

export function register(): void {
  handle(api.getNotificationSound, getNotificationSound);
  handle(api.saveNotificationSound, (_event, raw: unknown) => saveNotificationSound(raw));
  handle(api.resetNotificationSound, resetNotificationSound);
}
