// Picks the mods that give a gun the highest burst damage per second. Greedy
// picks, then single swaps until none helps: the candidate lists are too long
// to try every set of eight.

import { computeGunStats, type GunBaseStats, type GunStats } from "./gunStats";
import type { ModEffect } from "./modEffects";

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

function burstDps(base: GunBaseStats, mods: readonly BuildCandidate[]): number {
  return computeGunStats(
    base,
    mods.map((m) => m.effects),
  ).burstDps;
}

function fits(candidate: BuildCandidate, chosen: readonly BuildCandidate[]): boolean {
  return chosen.every((m) => m.id !== candidate.id && m.family !== candidate.family);
}

export function findBestGunBuild<T extends BuildCandidate>(
  base: GunBaseStats,
  candidates: readonly T[],
  slots = GUN_MOD_SLOTS,
): GunBuild<T> {
  let chosen: T[] = [];
  let best = burstDps(base, chosen);

  const fill = (): void => {
    while (chosen.length < slots) {
      let pick: T | null = null;
      for (const candidate of candidates) {
        if (!fits(candidate, chosen)) continue;
        const dps = burstDps(base, [...chosen, candidate]);
        if (dps > best + MIN_GAIN) {
          best = dps;
          pick = candidate;
        }
      }
      if (!pick) break;
      chosen.push(pick);
    }
  };

  const swapOne = (): boolean => {
    for (let i = 0; i < chosen.length; i++) {
      const rest = chosen.filter((_, index) => index !== i);
      for (const candidate of candidates) {
        if (!fits(candidate, rest)) continue;
        const next = [...rest.slice(0, i), candidate, ...rest.slice(i)];
        const dps = burstDps(base, next);
        if (dps > best + MIN_GAIN) {
          best = dps;
          chosen = next;
          return true;
        }
      }
    }
    return false;
  };

  // A swap can free a family, so fill again after each one.
  do fill();
  while (swapOne());

  return {
    mods: chosen,
    stats: computeGunStats(
      base,
      chosen.map((m) => m.effects),
    ),
  };
}
