// Picks the mods that give a gun the highest burst damage per second. Greedy
// picks, then single swaps until none helps: the candidate lists are too long
// to try every set of eight.

import type { GunBaseStats, GunStats, ModEffect } from "../../config/shared/buildAdvisorTypes";
import { computeGunStats } from "./gunStats";

export interface BuildCandidate {
  id: string;
  /** Mods of one family exclude each other, as a mod and its Primed form do. */
  family: string;
  effects: readonly ModEffect[];
}

interface GunBuild<T extends BuildCandidate = BuildCandidate> {
  mods: T[];
  stats: GunStats;
}

const GUN_MOD_SLOTS = 8;
// Float noise must not count as an improvement, or the swap loop never settles.
const MIN_GAIN = 1e-9;

function fits(candidate: BuildCandidate, chosen: readonly BuildCandidate[]): boolean {
  return chosen.every((m) => m.id !== candidate.id && m.family !== candidate.family);
}

type PrimaryElement = "heat" | "cold" | "electricity" | "toxin";
const PRIMARY_ELEMENTS: ReadonlySet<string> = new Set(["heat", "cold", "electricity", "toxin"]);

function primaryElement(candidate: BuildCandidate): PrimaryElement | null {
  for (const effect of candidate.effects) {
    if (effect.stat === "typedDamage" && PRIMARY_ELEMENTS.has(effect.damageType)) {
      return effect.damageType as PrimaryElement;
    }
  }
  return null;
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [
      item,
      ...rest,
    ]),
  );
}

export function findBestGunBuild<T extends BuildCandidate>(
  base: GunBaseStats,
  candidates: readonly T[],
  slots = GUN_MOD_SLOTS,
  /** Bonuses that apply whatever is chosen, such as an equipped arcane. */
  always: readonly (readonly ModEffect[])[] = [],
  /** What to maximise. Without one the build is ranked on burst DPS, which no
   *  element order changes; with one, elemental mods are also put in the order
   *  that scores best, since the order decides which elements combine. */
  score?: (stats: GunStats) => number,
): GunBuild<T> {
  const statsOf = (mods: readonly BuildCandidate[]): GunStats =>
    computeGunStats(base, [...mods.map((m) => m.effects), ...always]);

  const arrange = (mods: readonly T[]): { mods: T[]; stats: GunStats; value: number } => {
    const plain = statsOf(mods);
    if (!score) return { mods: [...mods], stats: plain, value: plain.burstDps };
    let best = { mods: [...mods], stats: plain, value: score(plain) };
    const elements = [...new Set(mods.map(primaryElement).filter((e) => e !== null))];
    // Two elements pair up either way round; only a third makes order matter.
    if (elements.length < 3) return best;
    const others = mods.filter((m) => primaryElement(m) === null);
    for (const order of permutations(elements)) {
      const elemental = order.flatMap((element) =>
        mods.filter((m) => primaryElement(m) === element),
      );
      const ordered = [...elemental, ...others];
      const stats = statsOf(ordered);
      const value = score(stats);
      if (value > best.value + MIN_GAIN) best = { mods: ordered, stats, value };
    }
    return best;
  };
  const valueOf = (mods: readonly T[]): number => arrange(mods).value;

  let chosen: T[] = [];
  let best = valueOf(chosen);

  const fill = (): void => {
    while (chosen.length < slots) {
      let pick: T | null = null;
      for (const candidate of candidates) {
        if (!fits(candidate, chosen)) continue;
        const value = valueOf([...chosen, candidate]);
        if (value > best + MIN_GAIN) {
          best = value;
          pick = candidate;
        }
      }
      if (pick) {
        chosen.push(pick);
        continue;
      }
      // Two elemental mods can be worth adding together when either alone is
      // not, because one more element changes which ones combine.
      const pair = score && chosen.length + 2 <= slots ? bestPair() : null;
      if (!pair) break;
      chosen.push(...pair);
    }
  };

  const bestPair = (): [T, T] | null => {
    let pair: [T, T] | null = null;
    const elemental = candidates.filter((c) => primaryElement(c) !== null && fits(c, chosen));
    for (let i = 0; i < elemental.length; i++) {
      for (let j = i + 1; j < elemental.length; j++) {
        if (!fits(elemental[j], [elemental[i]])) continue;
        const value = valueOf([...chosen, elemental[i], elemental[j]]);
        if (value > best + MIN_GAIN) {
          best = value;
          pair = [elemental[i], elemental[j]];
        }
      }
    }
    return pair;
  };

  const swapOne = (): boolean => {
    for (let i = 0; i < chosen.length; i++) {
      const rest = chosen.filter((_, index) => index !== i);
      for (const candidate of candidates) {
        if (!fits(candidate, rest)) continue;
        const next = [...rest.slice(0, i), candidate, ...rest.slice(i)];
        const value = valueOf(next);
        if (value > best + MIN_GAIN) {
          best = value;
          chosen = next;
          return true;
        }
      }
    }
    return false;
  };

  // Bringing in a second element one mod at a time can pass through a worse
  // combination (heat with cold is blast before toxin makes it viral and heat),
  // so two chosen mods are also traded for two elemental ones at once.
  const swapPair = (): boolean => {
    if (!score) return false;
    const elemental = candidates.filter((c) => primaryElement(c) !== null);
    for (let i = 0; i < chosen.length; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        const rest = chosen.filter((_, index) => index !== i && index !== j);
        for (let a = 0; a < elemental.length; a++) {
          if (!fits(elemental[a], rest)) continue;
          for (let b = a + 1; b < elemental.length; b++) {
            if (!fits(elemental[b], [...rest, elemental[a]])) continue;
            const next = [...rest, elemental[a], elemental[b]];
            const value = valueOf(next);
            if (value > best + MIN_GAIN) {
              best = value;
              chosen = next;
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  // A swap can free a family, so fill again after each one.
  do fill();
  while (swapOne() || swapPair());

  const arranged = arrange(chosen);
  return { mods: arranged.mods, stats: arranged.stats };
}
