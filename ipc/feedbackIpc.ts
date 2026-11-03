import fs from "node:fs";
import os from "node:os";

import { app } from "electron";

import { APP_PRODUCT_NAME } from "../config/shared/appMeta";
import { backendClientHeader } from "../config/shared/backendConfig";
import {
  FEEDBACK_ENDPOINT,
  FEEDBACK_LIMITS,
  normalizeFeedback,
  type FeedbackResult,
} from "../config/shared/feedback";
import { withAbortTimeout } from "../config/shared/fetchWithTimeout";

import { getLogFilePath, withScope } from "../services/logger";
import { redactLogPaths, redactLogSecrets } from "../services/logPrivacy";
import { getWarframeProcessState, isWarframeRunningCached } from "../services/warframeStatus";
import { getSession } from "../services/wfmSession";

import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;
const log = withScope("feedback");

// Null means the app could not tell; the report then leaves the field out rather than guess.
function gameRunning(): boolean | null {
  return process.platform === "win32" ? getWarframeProcessState() : isWarframeRunningCached();
}

function feedbackContext() {
  const running = gameRunning();
  return {
    appVersion: app.getVersion(),
    platform: process.platform,
    diagnostics: {
      osVersion: os.release(),
      arch: process.arch,
      wfmSignedIn: getSession().loggedIn,
      ...(running === null ? {} : { gameRunning: running }),
    },
  };
}

// The newest lines of main.log, cut to the limit on a line boundary.
function readLogTail(): string | undefined {
  const filePath = getLogFilePath();
  if (!filePath) return undefined;
  try {
    const handle = fs.openSync(filePath, "r");
    try {
      const size = fs.fstatSync(handle).size;
      const length = Math.min(size, FEEDBACK_LIMITS.logChars);
      const buffer = Buffer.alloc(length);
      fs.readSync(handle, buffer, 0, length, size - length);
      let text = buffer.toString("utf8");
      if (length < size) text = text.slice(text.indexOf("\n") + 1);
      if (text.trim().length === 0) return undefined;
      text = redactLogSecrets(redactLogPaths(text));
      // Placeholders can be longer than what they replace; the Worker rejects an over-long log.
      if (text.length > FEEDBACK_LIMITS.logChars) {
        text = text.slice(-FEEDBACK_LIMITS.logChars);
        text = text.slice(text.indexOf("\n") + 1);
      }
      return text;
    } finally {
      fs.closeSync(handle);
    }
  } catch {
    return undefined;
  }
}

export function register(): void {
  let sending = false;
  let nextSubmission = 0;
  handle(api.getFeedbackContext, feedbackContext);
  handle(api.submitFeedback, async (_event, raw: unknown): Promise<FeedbackResult> => {
    const report = normalizeFeedback(raw);
    if (!report) return { ok: false, error: "invalid" };
    if (sending || Date.now() < nextSubmission) return { ok: false, error: "rate_limited" };
    const context = feedbackContext();
    report.appVersion = context.appVersion;
    report.platform = context.platform;
    if (report.diagnostics) {
      delete report.diagnostics.gameRunning;
      Object.assign(report.diagnostics, context.diagnostics);
      const log = readLogTail();
      if (log) report.diagnostics.log = log;
      else delete report.diagnostics.log;
    }
    sending = true;
    try {
      return await withAbortTimeout(35_000, async (signal): Promise<FeedbackResult> => {
        const response = await fetch(FEEDBACK_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": `${APP_PRODUCT_NAME}/${context.appVersion}`,
            ...backendClientHeader(context.appVersion),
          },
          body: JSON.stringify(report),
          redirect: "error",
          signal,
        });
        if (response.status === 429) return { ok: false, error: "rate_limited" };
        if (response.status === 404 || response.status === 503)
          return { ok: false, error: "unavailable" };
        if (response.status === 400 || response.status === 413)
          return { ok: false, error: "invalid" };
        if (!response.ok) {
          // A 403 with cf-mitigated means Cloudflare challenged the report before the Worker.
          const mitigated = response.headers.get("cf-mitigated");
          log.warn(
            `Feedback refused: HTTP ${response.status}${mitigated ? ` (${mitigated})` : ""}`,
          );
          // A refusal means nothing was delivered, so "failed" would wrongly warn of a duplicate.
          return { ok: false, error: response.status === 403 ? "unavailable" : "failed" };
        }
        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== true)
          return { ok: false, error: "failed" };
        nextSubmission = Date.now() + 30_000;
        return { ok: true };
      });
    } catch (error) {
      // The class alone: this file never logs report content.
      log.warn(`Feedback not sent: ${error instanceof Error ? error.name : "unknown error"}`);
      return { ok: false, error: "failed" };
    } finally {
      sending = false;
    }
  });
}
