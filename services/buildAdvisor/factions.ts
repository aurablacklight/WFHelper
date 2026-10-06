// What each damage type is worth against a faction. Since Update 36 the game
// multiplies a type by 1.5 or 0.5 by faction alone, whatever the enemy's health,
// shields or armour. Armour is left out: it scales every type alike, so it does
// not change which build ranks first.

import type {
  AdvisorFaction,
  DamageByType,
  DamageType,
  FactionDps,
  GunStats,
} from "../../config/shared/buildAdvisorTypes";

const WEAK = 1.5;
const RESISTANT = 0.5;

// The wiki's Damage overview table, read 2026-10-05. Sub-factions (Kuva
// Grineer, Amalgams, Deimos Infested) and per-enemy exceptions are not listed.
const VULNERABLE: Readonly<Record<AdvisorFaction, readonly DamageType[]>> = {
  grineer: ["impact", "corrosive"],
  corpus: ["puncture", "magnetic"],
  infested: ["slash", "heat"],
  corrupted: ["puncture", "viral"],
  sentient: ["cold", "radiation"],
  narmer: ["slash", "toxin"],
  murmur: ["electricity", "radiation"],
  scaldra: ["impact", "corrosive"],
  techrot: ["gas", "magnetic"],
  anarchs: ["impact", "electricity"],
};
const RESISTS: Readonly<Record<AdvisorFaction, readonly DamageType[]>> = {
  grineer: [],
  corpus: [],
  infested: [],
  corrupted: ["radiation"],
  sentient: ["corrosive"],
  narmer: ["magnetic"],
  murmur: ["viral"],
  scaldra: ["gas"],
  techrot: ["cold"],
  anarchs: ["radiation"],
};

/** The multipliers that differ from 1 for a faction. */
export function factionModifiers(faction: AdvisorFaction): DamageByType {
  const modifiers: DamageByType = {};
  for (const type of VULNERABLE[faction]) modifiers[type] = WEAK;
  for (const type of RESISTS[faction]) modifiers[type] = RESISTANT;
  return modifiers;
}

/** How much more or less a hit of this make-up deals to the faction. */
export function factionDamageMultiplier(damage: DamageByType, faction: AdvisorFaction): number {
  const modifiers = factionModifiers(faction);
  let total = 0;
  let weighted = 0;
  for (const [type, amount] of Object.entries(damage) as [DamageType, number][]) {
    total += amount;
    weighted += amount * (modifiers[type] ?? 1);
  }
  return total > 0 ? weighted / total : 1;
}

export function versusFaction(stats: GunStats, faction: AdvisorFaction): FactionDps {
  const multiplier = factionDamageMultiplier(stats.damage, faction);
  return {
    faction,
    burstDps: stats.burstDps * multiplier,
    sustainedDps: stats.sustainedDps * multiplier,
  };
}
