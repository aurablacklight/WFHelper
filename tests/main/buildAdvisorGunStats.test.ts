import { describe, expect, it } from "vitest";
import { computeGunStats, type GunBaseStats } from "../../services/buildAdvisor/gunStats";
import type { ModEffect } from "../../services/buildAdvisor/modEffects";

// Expected values below are worked by hand from the base stats, not recomputed.
const lexPrime: GunBaseStats = {
  damage: { impact: 18, puncture: 144, slash: 18 },
  multishot: 1,
  criticalChance: 0.25,
  criticalMultiplier: 2,
  statusChance: 0.25,
  fireRate: 2,
  magazineSize: 8,
  reloadTime: 2.4,
};

const innateHeatRifle: GunBaseStats = {
  damage: { impact: 32, heat: 53 },
  multishot: 1,
  criticalChance: 0.24,
  criticalMultiplier: 2.4,
  statusChance: 0.34,
  fireRate: 4,
  magazineSize: 250,
  reloadTime: 4,
};

const typed = (
  damageType: "heat" | "cold" | "electricity" | "toxin",
  value: number,
): ModEffect => ({
  stat: "typedDamage",
  damageType,
  value,
});

function expectDamage(
  actual: Record<string, number | undefined>,
  expected: Record<string, number>,
) {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
  for (const [type, amount] of Object.entries(expected))
    expect(actual[type]).toBeCloseTo(amount, 6);
}

describe("computeGunStats", () => {
  it("returns the base stats for an empty build", () => {
    const stats = computeGunStats(lexPrime, []);
    expectDamage(stats.damage, { impact: 18, puncture: 144, slash: 18 });
    expect(stats.totalDamage).toBeCloseTo(180, 6);
    expect(stats.criticalChance).toBeCloseTo(0.25, 6);
    expect(stats.fireRate).toBeCloseTo(2, 6);
    // 180 damage, average crit 1 + 0.25 * (2 - 1) = 1.25, 2 shots a second.
    expect(stats.burstDps).toBeCloseTo(450, 6);
  });

  it("adds base damage bonuses together before applying them", () => {
    const stats = computeGunStats(lexPrime, [
      [{ stat: "damage", value: 2.2 }],
      [{ stat: "damage", value: 0.9 }],
    ]);
    // 1 + 2.2 + 0.9 = 4.1 on every base type.
    expectDamage(stats.damage, { impact: 73.8, puncture: 590.4, slash: 73.8 });
  });

  it("scales a physical bonus from that type alone", () => {
    const stats = computeGunStats(lexPrime, [
      [{ stat: "typedDamage", damageType: "puncture", value: 0.9 }],
    ]);
    expectDamage(stats.damage, { impact: 18, puncture: 273.6, slash: 18 });
  });

  it("scales elements from the modded base total and combines them in slot order", () => {
    const stats = computeGunStats(lexPrime, [
      [typed("electricity", 0.6)],
      [{ stat: "damage", value: 0.9 }],
      [typed("toxin", 0.9)],
      [typed("heat", 0.9)],
      [{ stat: "damage", value: 2.2 }],
      [typed("electricity", 0.9)],
    ]);
    // Modded base total 180 * 4.1 = 738. Electricity 1.5 * 738 = 1107 keeps its
    // first slot and joins toxin 664.2 as corrosive; heat 664.2 is left over.
    expectDamage(stats.damage, {
      impact: 73.8,
      puncture: 590.4,
      slash: 73.8,
      corrosive: 1771.2,
      heat: 664.2,
    });
    expect(stats.totalDamage).toBeCloseTo(3173.4, 6);
  });

  it("puts an innate element after the modded ones", () => {
    const stats = computeGunStats(innateHeatRifle, [[typed("cold", 0.6)], [typed("toxin", 0.6)]]);
    // Cold and toxin are 0.6 * 85 = 51 each and pair up; heat stays 53.
    expectDamage(stats.damage, { impact: 32, viral: 102, heat: 53 });
  });

  it("adds an innate element into the slot of a mod of the same element", () => {
    const stats = computeGunStats(innateHeatRifle, [
      [typed("heat", 0.6)],
      [typed("cold", 0.6)],
      [typed("toxin", 0.6)],
    ]);
    // Heat 51 + 53 innate pairs with cold 51; toxin 51 is left over.
    expectDamage(stats.damage, { impact: 32, blast: 155, toxin: 51 });
  });

  it("keeps a combined-element bonus separate from the pairing", () => {
    const stats = computeGunStats(lexPrime, [
      [{ stat: "typedDamage", damageType: "magnetic", value: 0.6 }],
      [typed("cold", 0.6)],
    ]);
    expectDamage(stats.damage, { impact: 18, puncture: 144, slash: 18, magnetic: 108, cold: 108 });
  });

  it("multiplies each remaining stat by one plus its summed bonus", () => {
    const stats = computeGunStats(innateHeatRifle, [
      [
        { stat: "criticalChance", value: 2 },
        { stat: "fireRate", value: -0.2 },
      ],
      [{ stat: "multishot", value: 0.8 }],
      [{ stat: "criticalDamage", value: 1.2 }],
      [{ stat: "fireRate", value: 0.45 }],
      [{ stat: "statusChance", value: 0.6 }],
      [{ stat: "statusChance", value: 0.6 }],
      [{ stat: "magazineCapacity", value: 0.3 }],
      [{ stat: "reloadSpeed", value: 0.6 }],
    ]);
    expect(stats.criticalChance).toBeCloseTo(0.72, 6);
    expect(stats.criticalMultiplier).toBeCloseTo(5.28, 6);
    expect(stats.multishot).toBeCloseTo(1.8, 6);
    expect(stats.fireRate).toBeCloseTo(5, 6);
    expect(stats.statusChance).toBeCloseTo(0.748, 6);
    expect(stats.magazineSize).toBe(325);
    expect(stats.reloadTime).toBeCloseTo(2.5, 6);
  });

  it("drops every fire rate bonus when a mod locks fire rate", () => {
    const stats = computeGunStats(lexPrime, [
      [{ stat: "damage", value: 3 }, { stat: "lockFireRate" }],
      [{ stat: "fireRate", value: 0.6 }],
      [{ stat: "fireRate", value: -0.2 }],
    ]);
    expect(stats.fireRate).toBeCloseTo(2, 6);
    expect(stats.totalDamage).toBeCloseTo(720, 6);
  });

  it("reports burst and sustained damage per second", () => {
    const stats = computeGunStats(lexPrime, [[{ stat: "multishot", value: 1 }]]);
    // 180 * 2 pellets * 1.25 average crit * 2 shots a second.
    expect(stats.burstDps).toBeCloseTo(900, 6);
    // 8 shots take 4s, then 2.4s reloading: 4 / 6.4 of the burst figure.
    expect(stats.sustainedDps).toBeCloseTo(562.5, 6);
  });
});
