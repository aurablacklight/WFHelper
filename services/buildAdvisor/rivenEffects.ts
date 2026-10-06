// Turns a decoded Riven's stats into the bonuses the calculator models. The
// values come from the app's own Riven decoder, as percentages at the mod's
// current rank for the weapon the Riven names.

import type { DamageType, ModEffect, PlainGunStat } from "../../config/shared/buildAdvisorTypes";

interface RivenStat {
  /** DE's upgrade tag, such as WeaponCritChanceMod. */
  tag: string;
  name: string;
  displayValue: number;
  /** True for faction damage and other stats shown as a multiplier. */
  multiplier: boolean;
}

const PLAIN_BY_TAG: Readonly<Record<string, PlainGunStat>> = {
  WeaponDamageAmountMod: "damage",
  WeaponFireIterationsMod: "multishot",
  WeaponCritChanceMod: "criticalChance",
  WeaponCritDamageMod: "criticalDamage",
  WeaponFireRateMod: "fireRate",
  WeaponStunChanceMod: "statusChance",
  WeaponReloadSpeedMod: "reloadSpeed",
  WeaponClipMaxMod: "magazineCapacity",
};

const TYPED_BY_TAG: Readonly<Record<string, DamageType>> = {
  WeaponImpactDamageMod: "impact",
  WeaponArmorPiercingDamageMod: "puncture",
  WeaponSlashDamageMod: "slash",
  WeaponFireDamageMod: "heat",
  WeaponFreezeDamageMod: "cold",
  WeaponElectricityDamageMod: "electricity",
  WeaponToxinDamageMod: "toxin",
};

function describe(stat: RivenStat, value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (stat.multiplier) return `x${rounded} ${stat.name}`;
  return `${rounded > 0 ? "+" : ""}${rounded}% ${stat.name}`;
}

/** `scale` is the disposition of the weapon the Riven is used on over that of
 *  the weapon it names; a Riven's stats scale with disposition. */
export function rivenEffects(
  stats: readonly RivenStat[],
  scale: number,
): { effects: ModEffect[]; ignored: string[] } {
  const effects: ModEffect[] = [];
  const ignored: string[] = [];
  for (const stat of stats) {
    const plain = stat.multiplier ? undefined : PLAIN_BY_TAG[stat.tag];
    const typed = stat.multiplier ? undefined : TYPED_BY_TAG[stat.tag];
    const value = (stat.displayValue * scale) / 100;
    if (plain) effects.push({ stat: plain, value });
    else if (typed) effects.push({ stat: "typedDamage", damageType: typed, value });
    else
      ignored.push(describe(stat, stat.multiplier ? stat.displayValue : stat.displayValue * scale));
  }
  return { effects, ignored };
}
