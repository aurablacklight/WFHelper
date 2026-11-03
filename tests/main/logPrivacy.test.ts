import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { redactLogPaths, redactLogSecrets, redactStoredLog } from "../../services/logPrivacy";

describe("log profile path privacy", () => {
  it("scrubs historical lines without truncating the log", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wfh-log-privacy-"));
    try {
      const file = path.join(directory, "main.log");
      fs.writeFileSync(file, "Old C:/Users/Alice/Documents/inventory.json\nDiagnosis preserved\n");
      redactStoredLog(file);
      expect(fs.readFileSync(file, "utf8")).toBe(
        "Old C:/Users/[redacted]/Documents/inventory.json\nDiagnosis preserved\n",
      );
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ["C:/Users/Alice: EPERM", "C:/Users/[redacted]: EPERM"],
    ["C:/Users/O'Brien/Documents/main.log", "C:/Users/[redacted]/Documents/main.log"],
    ["/home/O'Brien/.config/log", "/home/[redacted]/.config/log"],
    [
      String.raw`C:\Users\Alice Smith\AppData\main.log`,
      String.raw`C:\Users\[redacted]\AppData\main.log`,
    ],
    [
      String.raw`{ path: 'D:\\Users\\Jörg\\inventory.json' }`,
      String.raw`{ path: 'D:\\Users\\[redacted]\\inventory.json' }`,
    ],
    ["file:///C:/Users/Alice%20Smith/Desktop/a.json", "file:///C:/Users/[redacted]/Desktop/a.json"],
    ["/home/alice/.config/wfhelper/main.log", "/home/[redacted]/.config/wfhelper/main.log"],
    ["/Users/Alice/Library/main.log", "/Users/[redacted]/Library/main.log"],
    ["C%3A%5CUsers%5CAlice%20Smith%5CDocuments", "C%3A%5CUsers%5C[redacted]%5CDocuments"],
  ])("redacts %s without losing the diagnostic suffix", (input, expected) => {
    expect(redactLogPaths(input)).toBe(expected);
    expect(redactLogPaths(expected)).toBe(expected);
  });

  it.each([
    [
      "GET /inventory?accountId=abc123&nonce=999 failed",
      "GET /inventory?accountId=[redacted]&nonce=[redacted] failed",
    ],
    ["Authorization: Bearer abc.def-ghi", "Authorization: Bearer [redacted]"],
    ["jwt eyJhbGciOiJI.eyJzdWIiOiIx.c2lnbmF0dXJl end", "jwt [redacted-jwt] end"],
    ["id 5f3a9c0e1b2d4a6f8c7e9d01 seen", "id [redacted-id] seen"],
    ["contact me.name+x@example.co.uk now", "contact [redacted-email] now"],
    ["password=hunter2 rejected", "password=[redacted] rejected"],
  ])("scrubs secrets from %s", (input, expected) => {
    expect(redactLogSecrets(input)).toBe(expected);
    expect(redactLogSecrets(expected)).toBe(expected);
  });

  it.each([
    [`{ token: 'abc123', ok: false }`, `{ token: '[redacted]', ok: false }`],
    [`{"token":"abcdef","nonce":"123"}`, `{"token":"[redacted]","nonce":"[redacted]"}`],
    [
      "x-api-key=k123 sessionId=s9 ticket=t1",
      "x-api-key=[redacted] sessionId=[redacted] ticket=[redacted]",
    ],
  ])("scrubs printed objects and other keys in %s", (input, expected) => {
    expect(redactLogSecrets(input)).toBe(expected);
    expect(redactLogSecrets(expected)).toBe(expected);
  });

  it("leaves package specs alone", () => {
    const text = "loaded @wfcd/items@5.0.0-beta.rc";
    expect(redactLogSecrets(text)).toBe(text);
  });

  it("scrubs a long unbroken token in linear time", () => {
    const run = "a".repeat(256 * 1024);
    const started = performance.now();
    expect(redactLogSecrets(run)).toBe(run);
    expect(performance.now() - started).toBeLessThan(1_000);
  });

  it("keeps ordinary diagnostics when scrubbing secrets", () => {
    const text = "Relic scan took 320ms at scanner.ts:32:4 for Lith A1 (HTTP 404)";
    expect(redactLogSecrets(text)).toBe(text);
  });

  it("preserves unrelated words, API URLs and stack coordinates", () => {
    const text = "Users failed: https://warframe.market/profile/Alice at scanner.ts:32:4";
    expect(redactLogPaths(text)).toBe(text);
  });
});
