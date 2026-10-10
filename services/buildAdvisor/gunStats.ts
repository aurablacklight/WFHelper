// The arsenal's numbers for a gun with a set of mods on it. Covers unconditional
// mod bonuses only: no enemy, no faction, no status weighting.

import type {
  DamageByType,
  DamageType,
  GunBaseStats,
  GunStats,
  ModEffect,
  PlainGunStat,
} from "../../config/shared/buildAdvisorTypes";

type PrimaryElement = "heat" | "cold" | "electricity" | "toxin";

const PHYSICAL: ReadonlySet<DamageType> = new Set(["impact", "puncture", "slash"]);
const PRIMARY_ELEMENTS: ReadonlySet<DamageType> = new Set(["heat", "cold", "electricity", "toxin"]);

const COMBINED: Readonly<Record<PrimaryElement, Partial<Record<PrimaryElement, DamageType>>>> = {
  heat: { cold: "blast", electricity: "radiation", toxin: "gas" },
  cold: { heat: "blast", electricity: "magnetic", toxin: "viral" },
  electricity: { heat: "radiation", cold: "magnetic", toxin: "corrosive" },
  toxin: { heat: "gas", cold: "viral", electricity: "corrosive" },
};

function isPrimaryElement(type: DamageType): type is PrimaryElement {
  return PRIMARY_ELEMENTS.has(type);
}

function add(damage: DamageByType, type: DamageType, amount: number): void {
  if (amount > 0) damage[type] = (damage[type] ?? 0) + amount;
}

interface ModdedDamage {
  damage: DamageByType;
  baseTotal: number;
  elementBonus: DamageByType;
}

function moddedDamage(base: DamageByType, mods: readonly (readonly ModEffect[])[]): ModdedDamage {
  let baseBonus = 0;
  const typedBonus: DamageByType = {};
  // Insertion order is slot order: an element sits where its first mod does.
  const elementBonus = new Map<PrimaryElement, number>();
  for (const effects of mods) {
    for (const effect of effects) {
      if (effect.stat === "damage") baseBonus += effect.value;
      if (effect.stat !== "typedDamage") continue;
      if (isPrimaryElement(effect.damageType)) {
        const sofar = elementBonus.get(effect.damageType) ?? 0;
        elementBonus.set(effect.damageType, sofar + effect.value);
      } else {
        typedBonus[effect.damageType] = (typedBonus[effect.damageType] ?? 0) + effect.value;
      }
    }
  }

  const scale = Math.max(0, 1 + baseBonus);
  let baseTotal = 0;
  for (const amount of Object.values(base)) baseTotal += (amount ?? 0) * scale;

  const damage: DamageByType = {};
  const elements = new Map<PrimaryElement, number>();
  for (const [element, bonus] of elementBonus) elements.set(element, baseTotal * bonus);
  for (const [type, amount] of Object.entries(base) as [DamageType, number][]) {
    const modded = amount * scale;
    if (PHYSICAL.has(type)) add(damage, type, modded * Math.max(0, 1 + (typedBonus[type] ?? 0)));
    // An innate element joins a mod of the same element, or goes last.
    else if (isPrimaryElement(type)) elements.set(type, (elements.get(type) ?? 0) + modded);
    else add(damage, type, modded);
  }
  for (const [type, bonus] of Object.entries(typedBonus) as [DamageType, number][]) {
    if (!PHYSICAL.has(type)) add(damage, type, baseTotal * bonus);
  }

  const ordered = [...elements];
  for (let i = 0; i < ordered.length; i += 2) {
    const [first, firstAmount] = ordered[i];
    const second = ordered[i + 1];
    const combined = second ? COMBINED[first][second[0]] : undefined;
    if (second && combined) add(damage, combined, firstAmount + second[1]);
    else add(damage, first, firstAmount);
  }
  const bonuses: DamageByType = {};
  for (const [element, bonus] of elementBonus) bonuses[element] = bonus;
  for (const [type, bonus] of Object.entries(typedBonus) as [DamageType, number][]) {
    if (!PHYSICAL.has(type)) bonuses[type] = bonus;
  }
  return { damage, baseTotal, elementBonus: bonuses };
}

export function computeGunStats(
  base: GunBaseStats,
  mods: readonly (readonly ModEffect[])[],
): GunStats {
  const bonus: Record<PlainGunStat, number> = {
    damage: 0,
    multishot: 0,
    criticalChance: 0,
    criticalDamage: 0,
    fireRate: 0,
    statusChance: 0,
    reloadSpeed: 0,
    magazineCapacity: 0,
  };
  let fireRateLocked = false;
  let slashOnCritical = 0;
  for (const effects of mods) {
    for (const effect of effects) {
      if (effect.stat === "lockFireRate") fireRateLocked = true;
      else if (effect.stat === "slashOnCritical") slashOnCritical += effect.value;
      else if (effect.stat !== "typedDamage") bonus[effect.stat] += effect.value;
    }
  }
  if (fireRateLocked) bonus.fireRate = 0;
  const scaled = (value: number, by: number): number => value * Math.max(0, 1 + by);

  const { damage, baseTotal, elementBonus } = moddedDamage(base.damage, mods);
  let totalDamage = 0;
  for (const amount of Object.values(damage)) totalDamage += amount ?? 0;

  const multishot = scaled(base.multishot, bonus.multishot);
  const criticalChance = scaled(base.criticalChance, bonus.criticalChance);
  const criticalMultiplier = scaled(base.criticalMultiplier, bonus.criticalDamage);
  const fireRate = scaled(base.fireRate, bonus.fireRate);
  const magazineSize = Math.max(1, Math.round(scaled(base.magazineSize, bonus.magazineCapacity)));
  const reloadTime = base.reloadTime / Math.max(0.01, 1 + bonus.reloadSpeed);

  const averageCrit = 1 + criticalChance * (criticalMultiplier - 1);
  const burstDps = totalDamage * multishot * averageCrit * fireRate;
  const firingTime = fireRate > 0 ? magazineSize / fireRate : 0;
  const cycleTime = firingTime + reloadTime;
  const sustainedDps = cycleTime > 0 ? (burstDps * firingTime) / cycleTime : 0;

  return {
    damage,
    slashOnCritical: Math.min(1, Math.max(0, slashOnCritical)),
    totalDamage,
    moddedBaseDamage: baseTotal,
    elementBonus,
    multishot,
    criticalChance,
    criticalMultiplier,
    statusChance: scaled(base.statusChance, bonus.statusChance),
    fireRate,
    magazineSize,
    reloadTime,
    burstDps,
    sustainedDps,
  };
}
