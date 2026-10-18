import * as notificationChannels from "../services/notificationChannels";

import { isNotificationSource, isWebhookChannel } from "../config/shared/notifications";
import type {
  NotificationChannelState,
  SetDiscordPingResult,
  SetWebhookResult,
  SourceChannelToggles,
  WebhookTestResult,
} from "../config/shared/notifications";
import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

function toToggles(raw: unknown): SourceChannelToggles | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.native !== "boolean" || typeof value.webhook !== "boolean") return null;
  return { native: value.native, webhook: value.webhook };
}

function register(): void {
  handle(api.getNotificationChannels, () => notificationChannels.getChannelState());

  handle(
    api.setNotificationWebhook,
    async (_event, channel: unknown, url: unknown): Promise<SetWebhookResult> => {
      if (!isWebhookChannel(channel)) return { ok: false, error: "invalid-url" };
      if (typeof url !== "string") return { ok: false, error: "empty" };
      return notificationChannels.setWebhookUrl(channel, url);
    },
  );

  // An unusable argument returns the unchanged state so the renderer still
  // repaints from what main actually holds.
  handle(
    api.clearNotificationWebhook,
    (_event, channel: unknown): NotificationChannelState =>
      isWebhookChannel(channel)
        ? notificationChannels.clearWebhook(channel)
        : notificationChannels.getChannelState(),
  );

  handle(
    api.setNotificationSourceChannels,
    (_event, source: unknown, toggles: unknown): NotificationChannelState => {
      const parsed = toToggles(toggles);
      if (!isNotificationSource(source) || !parsed) return notificationChannels.getChannelState();
      return notificationChannels.setSourceChannels(source, parsed);
    },
  );

  handle(
    api.setNotificationGameGate,
    (_event, enabled: unknown): NotificationChannelState =>
      typeof enabled === "boolean"
        ? notificationChannels.setNativeOnlyWhileGameRunning(enabled)
        : notificationChannels.getChannelState(),
  );

  handle(
    api.setNotificationDiscordPing,
    (_event, userId: unknown): SetDiscordPingResult =>
      typeof userId === "string"
        ? notificationChannels.setDiscordPingUserId(userId)
        : { ok: false, error: "invalid-user-id" },
  );

  handle(
    api.testNotificationWebhook,
    async (_event, channel: unknown): Promise<WebhookTestResult> => {
      if (!isWebhookChannel(channel)) return { ok: false, error: "not-configured" };
      return notificationChannels.testWebhook(channel);
    },
  );
}

export { register };
