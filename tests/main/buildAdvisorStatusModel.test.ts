import { describe, expect, it } from "vitest";
import type { GunStats } from "../../config/shared/buildAdvisorTypes";
import { targetDps } from "../../services/buildAdvisor/statusModel";

// One projectile a second, no crits, 1000 burst DPS unless a test says otherwise.
const stats = (overrides: Partial<GunStats>): GunStats => {
  const damage = overrides.damage ?? { puncture: 100 };
  const total = Object.values(damage).reduce((sum, amount) => sum + (amount ?? 0), 0);
  return {
    damage,
    totalDamage: total,
    moddedBaseDamage: total,
    elementBonus: {},
    multishot: 1,
    criticalChance: 0,
    criticalMultiplier: 2,
    statusChance: 0,
    fireRate: 1,
    magazineSize: 10,
    reloadTime: 1,
    burstDps: 1000,
    sustainedDps: 800,
    ...overrides,
  };
};

describe("targetDps", () => {
  it.each([
    [0, 0],
    [0.5, 94.5],
    [1, 189],
    [1.5, 252],
    [2, 315],
  ])("weights Hunter Munitions by critical hits at %s crit chance", (criticalChance, expected) => {
    const result = targetDps(
      stats({
        damage: { radiation: 100 },
        statusChance: 0,
        criticalChance,
        criticalMultiplier: 3,
        slashOnCritical: 0.3,
      }),
      "grineer",
    );
    // 100 base × .35 × 6 ticks × .3 roll. At 50% crit only half the hits
    // qualify, each at 3×. At 150%, half are 3× and half 5×, all qualify.
    expect(result.statusDps).toBeCloseTo(expected, 8);
  });

  it("adds forced bleeds alongside natural Slash without changing its proc rate", () => {
    const base = stats({
      damage: { slash: 100 },
      statusChance: 1,
      criticalChance: 1,
      criticalMultiplier: 3,
    });
    const natural = targetDps(base, "grineer");
    const combined = targetDps({ ...base, slashOnCritical: 0.3 }, "grineer");
    expect(natural.statusDps).toBeCloseTo(630, 8);
    expect(combined.statusDps - natural.statusDps).toBeCloseTo(189, 8);
    expect(combined.directDps).toBe(natural.directDps);
  });

  it("scales forced bleeds with projectiles, fire rate and Viral, ignoring armour", () => {
    const base = stats({
      damage: { viral: 100 },
      statusChance: 1,
      criticalChance: 1,
      criticalMultiplier: 3,
      slashOnCritical: 0.3,
      multishot: 2,
      fireRate: 3,
    });
    const armoured = targetDps(base, "grineer");
    const unarmoured = targetDps(base, "corpus");
    expect(armoured.statusDps).toBeCloseTo(189 * 6 * armoured.viralMultiplier, 8);
    expect(armoured.statusDps).toBe(unarmoured.statusDps);
  });

  it("is the faction's type multiplier alone with no status and no armour", () => {
    // The Murmur resist viral and have no armour in the model.
    expect(targetDps(stats({ damage: { viral: 100 } }), "murmur")).toEqual({
      faction: "murmur",
      burstDps: 500,
      sustainedDps: 400,
      directDps: 500,
      statusDps: 0,
      viralMultiplier: 1,
      armourMultiplier: 1,
    });
  });

  it("lets a tenth of the damage through capped armour", () => {
    // 2,700 armour is 90% reduction; puncture is neutral to Grineer.
    const result = targetDps(stats({}), "grineer");
    expect(result.armourMultiplier).toBeCloseTo(0.1, 6);
    expect(result.directDps).toBeCloseTo(100, 6);
  });

  it("averages the viral multiplier over the stacks a proc rate keeps up", () => {
    // One viral proc a second lasting 6s: Poisson(6) stacks, capped at 10, each
    // worth 1.75 + 0.25 per stack. Worked by hand: 3.2288.
    const result = targetDps(stats({ damage: { viral: 100 }, statusChance: 1 }), "corpus");
    expect(result.viralMultiplier).toBeCloseTo(3.2288, 3);
    expect(result.directDps).toBeCloseTo(3228.8, 0);
  });

  it("strips four fifths of the armour at full corrosive stacks", () => {
    // Ten procs a second for 8s is far past the 10-stack cap: 540 armour left,
    // 0.9 * sqrt(0.2) = 40.25% reduction.
    const result = targetDps(
      stats({ damage: { corrosive: 100 }, statusChance: 1, fireRate: 10 }),
      "grineer",
    );
    expect(result.armourMultiplier).toBeCloseTo(0.59751, 4);
    // Corrosive is also worth half again to Grineer.
    expect(result.directDps).toBeCloseTo(1000 * 1.5 * 0.59751, 1);
  });

  it("halves armour while heat is kept up, and adds the burn", () => {
    const result = targetDps(
      stats({ damage: { heat: 100 }, statusChance: 1, fireRate: 10 }),
      "grineer",
    );
    // 1,350 armour: 0.9 * sqrt(0.5) = 63.64% reduction.
    expect(result.armourMultiplier).toBeCloseTo(0.3636, 3);
    // Ten procs a second, each six ticks of half the modded base damage (300),
    // through that armour.
    expect(result.statusDps).toBeCloseTo(10 * 300 * 0.3636, 0);
  });

  it("counts a bleed as six ticks of 35% that ignore armour and faction", () => {
    const result = targetDps(stats({ damage: { slash: 100 }, statusChance: 1 }), "grineer");
    // 6 * 0.35 * 100 a proc, one proc a second.
    expect(result.statusDps).toBeCloseTo(210, 6);
    expect(result.directDps).toBeCloseTo(100, 6);
    expect(result.burstDps).toBeCloseTo(310, 6);
  });

  it("carries the hit's average crit into the bleed", () => {
    const result = targetDps(
      stats({
        damage: { slash: 100 },
        statusChance: 1,
        criticalChance: 0.5,
        criticalMultiplier: 3,
      }),
      "grineer",
    );
    // Average crit 1 + 0.5 * 2 = 2.
    expect(result.statusDps).toBeCloseTo(420, 6);
  });

  it("boosts a poison only by toxin mods, not by the toxin they add", () => {
    // 100 modded base with a +90% toxin mod: 190 toxin a hit, but each tick is
    // 0.5 * 100 * 1.9. Six ticks: 570 a proc.
    const result = targetDps(
      stats({
        damage: { toxin: 190 },
        moddedBaseDamage: 100,
        elementBonus: { toxin: 0.9 },
        statusChance: 1,
      }),
      "corpus",
    );
    expect(result.statusDps).toBeCloseTo(570, 6);
  });

  it("shares procs between damage types by their share of the hit", () => {
    // Half the hit is slash, so half a bleed a second; cold has no damage proc.
    const result = targetDps(stats({ damage: { slash: 50, cold: 50 }, statusChance: 1 }), "corpus");
    expect(result.statusDps).toBeCloseTo(0.5 * 210, 6);
  });

  it("multiplies bleeds by viral on the target", () => {
    const mixed = targetDps(stats({ damage: { slash: 50, viral: 50 }, statusChance: 1 }), "corpus");
    // Half a bleed a second at 210, times the viral multiplier kept up by half a
    // viral proc a second.
    expect(mixed.statusDps).toBeCloseTo(0.5 * 210 * mixed.viralMultiplier, 6);
    expect(mixed.viralMultiplier).toBeGreaterThan(2);
  });

  it("scales sustained damage like burst damage", () => {
    const result = targetDps(stats({ damage: { slash: 100 }, statusChance: 1 }), "grineer");
    expect(result.sustainedDps).toBeCloseTo(310 * 0.8, 6);
  });
});
