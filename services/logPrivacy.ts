import fs from "node:fs";
import { writeFileAtomicSync } from "./atomicFile";

/** Redact profile-directory names after formatting, including escaped object paths. */
export function redactLogPaths(text: string): string {
  return text
    .replace(/([a-z]:[\\/]+Users[\\/]+)[^\\/:\r\n]+/gi, "$1[redacted]")
    .replace(/(\/(?:home|Users)\/)[^/:\r\n]+/g, "$1[redacted]")
    .replace(
      /([a-z](?::|%3a)(?:%5c|%2f)+Users(?:%5c|%2f)+)(?:(?!%5c|%2f)[^\s])+/gi,
      "$1[redacted]",
    );
}

/** Second pass for logs that leave the machine: nothing should log these, but WFM error
 *  bodies and whole error objects are outside this app's control. */
export function redactLogSecrets(text: string): string {
  return (
    text
      // key=value, key: 'value' and "key":"value", as URLs, util.inspect and JSON print them.
      .replace(
        /\b(accountId|nonce|authz|token|password|ticket|sessionId|api[_-]?key)(["']?\s*[:=]\s*["']?)[^\s&"',}]+/gi,
        "$1$2[redacted]",
      )
      .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [redacted]")
      .replace(/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}(?:\.[A-Za-z0-9_-]+)?/g, "[redacted-jwt]")
      .replace(/\b[0-9a-f]{24}\b/gi, "[redacted-id]")
      // The lookbehind starts a match only at the start of a run, so a long unbroken token
      // stays linear; it also spares package specs such as `@scope/name@1.0.0-beta.rc`.
      .replace(
        /(?<![A-Za-z0-9._%+/-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){0,8}\.[A-Za-z]{2,24}\b/g,
        "[redacted-email]",
      )
  );
}

export function redactStoredLog(filePath: string): void {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size > 10 * 1024 * 1024) return;
  const previous = fs.readFileSync(filePath, "utf8");
  const next = redactLogPaths(previous);
  if (next !== previous) writeFileAtomicSync(filePath, next);
}
