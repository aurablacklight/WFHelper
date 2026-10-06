// Estimates damage per second against a faction once armour and status effects
// are counted. The game rules are the wiki's (read 2026-10-05); turning them
// into one number assumes sustained fire on one target, procs arriving at random
// (Poisson), and Viral, armour strip and status ticks acting independently. That
// combination is this project's model and has not been checked in the Simulacrum.

import type {
  AdvisorFaction,
  DamageByType,
  DamageType,
  FactionDps,
  GunStats,
} from "../../config/shared/buildAdvisorTypes";
import { factionDamageMultiplier, factionModifiers } from "./factions";

const ARMOUR_CAP = 2700;
const MAX_ARMOUR_REDUCTION = 0.9;
// A heavy unit at Steel Path level sits at the armour cap; lighter units have
// less. Factions without an entry are treated as unarmoured.
const TARGET_ARMOUR: Partial<Record<AdvisorFaction, number>> = {
  grineer: ARMOUR_CAP,
  corrupted: ARMOUR_CAP,
  scaldra: ARMOUR_CAP,
  techrot: ARMOUR_CAP,
  anarchs: ARMOUR_CAP,
};

const STACK_CAP = 10;
const VIRAL_SECONDS = 6;
const CORROSIVE_SECONDS = 8;
const HEAT_SECONDS = 6;
const HEAT_ARMOUR_STRIP = 0.5;
const TICKS_PER_PROC = 6;

// Share of modded base damage one tick deals, for statuses that deal damage.
// Heat is counted as six ticks a proc like the others, which ignores the way a
// refreshed burn keeps every stack alive, so sustained Heat is understated.
const TICK_SHARE: Partial<Record<DamageType, number>> = {
  slash: 0.35,
  heat: 0.5,
  toxin: 0.5,
  electricity: 0.5,
  gas: 0.5,
};
// Blast detonates once per stack instead of ticking.
const BLAST_SHARE = 0.3;

/** The expected value of `value(stacks)` for stacks ~ Poisson(mean). */
function expectOverStacks(mean: number, value: (stacks: number) => number): number {
  if (mean <= 0) return value(0);
  // Past the cap every term is the same, so the tail is one lump.
  let probability = Math.exp(-mean);
  let covered = 0;
  let total = 0;
  for (let stacks = 0; stacks <= STACK_CAP; stacks++) {
    total += probability * value(stacks);
    covered += probability;
    probability *= mean / (stacks + 1);
  }
  return total + Math.max(0, 1 - covered) * value(STACK_CAP + 1);
}

function viralMultiplier(stacks: number): number {
  return stacks === 0 ? 1 : 2 + 0.25 * (Math.min(stacks, STACK_CAP) - 1);
}

function corrosiveStrip(stacks: number): number {
  return stacks === 0 ? 0 : Math.min(0.8, 0.2 + 0.06 * stacks);
}

function armourPassThrough(armour: number): number {
  const capped = Math.min(Math.max(armour, 0), ARMOUR_CAP);
  return 1 - MAX_ARMOUR_REDUCTION * Math.sqrt(capped / ARMOUR_CAP);
}

export function targetDps(stats: GunStats, faction: AdvisorFaction): FactionDps {
  const modifiers = factionModifiers(faction);
  const worth = (type: DamageType): number => modifiers[type] ?? 1;

  const procsPerSecond = stats.fireRate * stats.multishot * stats.statusChance;
  const procRate = (type: DamageType): number =>
    stats.totalDamage > 0 ? (procsPerSecond * (stats.damage[type] ?? 0)) / stats.totalDamage : 0;

  const viral = expectOverStacks(procRate("viral") * VIRAL_SECONDS, viralMultiplier);

  const armour = TARGET_ARMOUR[faction] ?? 0;
  const heatUp = 1 - Math.exp(-procRate("heat") * HEAT_SECONDS);
  const armourMultiplier =
    armour > 0
      ? expectOverStacks(procRate("corrosive") * CORROSIVE_SECONDS, (stacks) => {
          const left = armour * (1 - corrosiveStrip(stacks));
          return (
            heatUp * armourPassThrough(left * (1 - HEAT_ARMOUR_STRIP)) +
            (1 - heatUp) * armourPassThrough(left)
          );
        })
      : 1;

  const typeMultiplier = factionDamageMultiplier(stats.damage, faction);
  const directDps = stats.burstDps * typeMultiplier * viral * armourMultiplier;

  // A tick takes the crit of the hit that caused it; the average stands in.
  const averageCrit = 1 + stats.criticalChance * (stats.criticalMultiplier - 1);
  const bonus: DamageByType = stats.elementBonus;
  let statusDps = 0;
  for (const [type, share] of Object.entries(TICK_SHARE) as [DamageType, number][]) {
    const perProc =
      TICKS_PER_PROC * share * stats.moddedBaseDamage * (1 + (bonus[type] ?? 0)) * averageCrit;
    // A bleed is true damage: no faction modifier and no armour.
    const landed = type === "slash" ? 1 : worth(type) * armourMultiplier;
    statusDps += procRate(type) * perProc * landed * viral;
  }
  statusDps +=
    procRate("blast") *
    BLAST_SHARE *
    stats.moddedBaseDamage *
    averageCrit *
    worth("blast") *
    armourMultiplier *
    viral;

  const burstDps = directDps + statusDps;
  const sustainedShare = stats.burstDps > 0 ? stats.sustainedDps / stats.burstDps : 0;
  return {
    faction,
    burstDps,
    sustainedDps: burstDps * sustainedShare,
    directDps,
    statusDps,
    viralMultiplier: viral,
    armourMultiplier,
  };
}
