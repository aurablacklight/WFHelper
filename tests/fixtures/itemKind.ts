import { settleItemKind, type ItemKindFields } from "../../config/shared/itemKind.js";
import type { ItemDbEntry } from "../../src/types/inventory.js";

/**
 * A hand-built item database with every entry's kind settled the way the real
 * one does it: parts inherit from componentOf, blueprints from buildsProduct.
 */
export function withSettledKinds<T extends Record<string, ItemDbEntry>>(db: T): T {
  const settled = new Map<string, ItemKindFields>();
  const settle = (uniqueName: string, depth = 0): ItemKindFields => {
    const done = settled.get(uniqueName);
    if (done) return done;
    const entry = db[uniqueName];
    if (!entry || depth > 8) return {};
    const parentUn = entry.componentOf ?? entry.buildsProduct;
    const inherited = parentUn && parentUn !== uniqueName ? settle(parentUn, depth + 1) : null;
    const fields = settleItemKind(uniqueName, entry, inherited);
    settled.set(uniqueName, fields);
    return fields;
  };
  const out: Record<string, ItemDbEntry> = {};
  for (const [uniqueName, entry] of Object.entries(db)) {
    out[uniqueName] = { ...entry, ...settle(uniqueName) };
  }
  return out as T;
}

/** One entry with its kind settled, for tests that pass a single db entry. */
export function settledEntry(uniqueName: string, entry: ItemDbEntry): ItemDbEntry {
  return withSettledKinds({ [uniqueName]: entry })[uniqueName];
}
