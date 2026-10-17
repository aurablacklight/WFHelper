import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { overlayMessages } from "../../ipc/overlayI18n";
import { en } from "../../src/i18n/en";

// Shared overlay descriptors name labels used by both the editor and main.
const REFERENCE_ROOTS = ["src", "ipc", "config/shared"].map((dir) =>
  path.resolve(__dirname, "../..", dir),
);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "i18n") sourceFiles(full, out);
    } else if (/\.(ts|svelte)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("i18n dictionaries", () => {
  it("spells ellipses as three ASCII dots", () => {
    const unicode = Object.entries(en)
      .filter(([, value]) => value.includes("…"))
      .map(([key]) => key);

    expect(unicode).toEqual([]);
  });

  it("is fully referenced by the app", () => {
    const blob = REFERENCE_ROOTS.flatMap((root) => sourceFiles(root))
      .map((file) => fs.readFileSync(file, "utf8"))
      .join("\n");
    const unused = Object.keys(en).filter((key) => {
      if (blob.includes(`"${key}"`) || blob.includes(`'${key}'`)) return false;
      // Keys built as `prefix.${value}` only ever appear as their prefix.
      const prefix = key.slice(0, key.lastIndexOf(".") + 1);
      return !blob.includes(`\`${prefix}\${`);
    });

    expect(unused).toEqual([]);
  });

  // The reverse of the reference check: a `$tr("...")` key the dictionary never
  // got shows raw. Only call sites and *Key props are read, not key-shaped ids.
  it("defines every key the app resolves", () => {
    const namespaces = new Set(Object.keys(en).map((key) => key.split(".")[0]));
    const keyLiteral = /"([a-z]\w*(?:\.\w+)+)"/g;
    const callSite = /(?:\$?\btr|\bt)\(\s*"([a-z]\w*(?:\.\w+)+)"/g;
    const propLiteral = /\b[a-z]\w*Key\s*[:=]\s*"([a-z]\w*(?:\.\w+)+)"/g;
    const propExpression = /\b[a-z]\w*Key=\{([^}]*)\}/g;
    const missing = new Set<string>();
    const consider = (literal: string): void => {
      if (namespaces.has(literal.split(".")[0]) && !(literal in en)) missing.add(literal);
    };
    for (const file of REFERENCE_ROOTS.flatMap((root) => sourceFiles(root))) {
      const source = fs.readFileSync(file, "utf8");
      for (const match of source.matchAll(callSite)) consider(match[1]);
      for (const match of source.matchAll(propLiteral)) consider(match[1]);
      for (const match of source.matchAll(propExpression)) {
        for (const inner of match[1].matchAll(keyLiteral)) consider(inner[1]);
      }
    }

    expect([...missing].sort()).toEqual([]);
  });
});

// Any key-shaped literal, not only `t("...")`: overlay.js routes some keys
// through a variable. Filtering through `en` drops filenames like "overlay.js".
function overlayKeysReferenced(): Set<string> {
  const dir = path.resolve(__dirname, "../../renderer");
  const keys = new Set<string>();
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(js|html)$/.test(file)) continue;
    const source = fs.readFileSync(path.join(dir, file), "utf8");
    for (const [, , key] of source.matchAll(/(["'`])([\w.-]+)\1/g)) {
      if (key in en) keys.add(key);
    }
  }
  return keys;
}

describe("overlay messages", () => {
  it("names only keys English defines", () => {
    const unknown = Object.keys(overlayMessages().messages).filter((key) => !(key in en));

    expect(unknown).toEqual([]);
  });

  it("resolves a non-empty English string for every key", () => {
    const { locale, messages } = overlayMessages();
    expect(locale).toBe("en");
    expect(Object.keys(messages).length).toBeGreaterThan(0);
    const blank = Object.entries(messages)
      .filter(([, value]) => typeof value !== "string" || !value.trim())
      .map(([key]) => key);

    expect(blank).toEqual([]);
    expect(messages["overlay.riven.waitingForRoll"]).toBe(en["overlay.riven.waitingForRoll"]);
  });

  it("carries every key the overlay windows ask for", () => {
    const served = new Set(Object.keys(overlayMessages().messages));
    const asked = overlayKeysReferenced();

    expect([...asked].filter((key) => !served.has(key))).toEqual([]);
    expect(asked.size).toBeGreaterThan(0);
  });

  it("serves no key the overlay windows never ask for", () => {
    // Naming a key in the overlay list also marks it used for the app-wide
    // unused-key test, so a key that loses its last caller needs its own guard.
    const asked = overlayKeysReferenced();

    expect(Object.keys(overlayMessages().messages).filter((key) => !asked.has(key))).toEqual([]);
  });
});
