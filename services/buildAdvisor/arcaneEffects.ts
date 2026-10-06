// Reads one rank of a weapon arcane from ExportArcanes. Unlike mods, arcane
// bonuses are structured: a language tag names the stat and `sub` holds values.

import { asRecord } from "../../config/shared/objectValidation";
import type { ModEffect, PlainGunStat } from "../../config/shared/buildAdvisorTypes";

interface ParsedArcaneRank {
  effects: ModEffect[];
  /** Bonuses the calculator does not model, rendered as the game words them. */
  ignored: string[];
  /** Stacking bonuses counted at full stacks. */
  assumed: string[];
}

// The last segment of the language tag that names each modelled stat.
const STAT_BY_TAG: Readonly<Record<string, PlainGunStat>> = {
  WeaponDamageModDesc: "damage",
  WeaponReloadSpeedModDesc: "reloadSpeed",
};
// "|CONDITION|: |BONUS| for |DURATION|s. Stacks up to |STACKS|x."
const STACKING_TAG = "CosmeticEnhancerDescriptionNoChanceWithDurationAndStacks";

function segment(tag: unknown): string {
  return typeof tag === "string" ? tag.slice(tag.lastIndexOf("/") + 1) : "";
}

function fraction(percent: number): number {
  return Number(`${percent}e-2`);
}

/** The entry in the game's own words, for showing what was assumed or left out. */
function describe(entry: unknown, strings: Readonly<Record<string, string>>): string {
  if (typeof entry === "string") return strings[entry] ?? entry;
  const record = asRecord(entry);
  if (!record) return "";
  const sub = asRecord(record.sub) ?? {};
  const template =
    typeof record.tag === "string" ? (strings[record.tag] ?? segment(record.tag)) : "";
  return template
    .replace(/\|(\w+)\|/g, (_match, key: string) => describe(sub[key], strings))
    .replace(/\s+/g, " ")
    .trim();
}

function plainEffect(
  entry: Record<string, unknown>,
): { stat: PlainGunStat; percent: number } | null {
  const stat = STAT_BY_TAG[segment(entry.tag)];
  const percent = Number(asRecord(entry.sub)?.val);
  return stat && Number.isFinite(percent) ? { stat, percent } : null;
}

export function parseArcaneRank(
  rank: unknown,
  strings: Readonly<Record<string, string>>,
  options: { assumeConditionals: boolean },
): ParsedArcaneRank {
  const result: ParsedArcaneRank = { effects: [], ignored: [], assumed: [] };
  for (const raw of Array.isArray(rank) ? rank.slice(0, 16) : []) {
    const entry = asRecord(raw);
    if (!entry) continue;
    const text = describe(entry, strings);

    if (segment(entry.tag) === STACKING_TAG) {
      const sub = asRecord(entry.sub);
      const bonus = asRecord(sub?.BONUS);
      const effect = bonus ? plainEffect(bonus) : null;
      const stacks = Number(sub?.STACKS);
      if (effect && Number.isInteger(stacks) && stacks > 0 && options.assumeConditionals) {
        result.effects.push({ stat: effect.stat, value: fraction(effect.percent * stacks) });
        result.assumed.push(text);
      } else {
        result.ignored.push(text);
      }
      continue;
    }

    const effect = plainEffect(entry);
    if (effect) result.effects.push({ stat: effect.stat, value: fraction(effect.percent) });
    else result.ignored.push(text);
  }
  return result;
}
