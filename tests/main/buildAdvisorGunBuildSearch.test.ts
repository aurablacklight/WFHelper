import { describe, expect, it } from "vitest";
import { findBestGunBuild, type BuildCandidate } from "../../services/buildAdvisor/gunBuildSearch";
import type { GunBaseStats, ModEffect } from "../../config/shared/buildAdvisorTypes";

const gun: GunBaseStats = {
  damage: { impact: 100 },
  multishot: 1,
  criticalChance: 0.1,
  criticalMultiplier: 2,
  statusChance: 0.1,
  fireRate: 1,
  magazineSize: 10,
  reloadTime: 2,
};

const mod = (id: string, effects: ModEffect[], family = id): BuildCandidate => ({
  id,
  family,
  effects,
});
const ids = (mods: readonly BuildCandidate[]) => mods.map((m) => m.id).sort();

describe("findBestGunBuild", () => {
  it("prefers bonuses that multiply over a second bonus of the same kind", () => {
    const build = findBestGunBuild(
      gun,
      [
        mod("damageA", [{ stat: "damage", value: 1.65 }]),
        mod("damageB", [{ stat: "damage", value: 1 }]),
        mod("multishot", [{ stat: "multishot", value: 0.9 }]),
      ],
      2,
    );
    // 2.65 * 1.9 beats 3.65 from stacking both damage mods.
    expect(ids(build.mods)).toEqual(["damageA", "multishot"]);
    // 100 * 2.65 damage * 1.9 pellets * 1.1 average crit.
    expect(build.stats.burstDps).toBeCloseTo(553.85, 6);
  });

  it("never equips two mods of one family", () => {
    const build = findBestGunBuild(
      gun,
      [
        mod("serration", [{ stat: "damage", value: 1.65 }], "baseDamage"),
        mod("flawedSerration", [{ stat: "damage", value: 0.4 }], "baseDamage"),
      ],
      2,
    );
    expect(ids(build.mods)).toEqual(["serration"]);
  });

  it("leaves a slot empty rather than fill it with a mod that adds no damage", () => {
    const build = findBestGunBuild(
      gun,
      [
        mod("damage", [{ stat: "damage", value: 1.65 }]),
        mod("slowDown", [{ stat: "fireRate", value: -0.2 }]),
      ],
      2,
    );
    expect(ids(build.mods)).toEqual(["damage"]);
  });

  it("values a mod against bonuses that are always on, such as an arcane", () => {
    const candidates = [
      mod("damage", [{ stat: "damage", value: 1.65 }]),
      mod("multishot", [{ stat: "multishot", value: 0.9 }]),
    ];
    // Alone, +165% damage (2.65x) beats +90% multishot (1.9x).
    expect(ids(findBestGunBuild(gun, candidates, 1).mods)).toEqual(["damage"]);

    // Beside +360% damage the same mod adds 6.25 / 4.6 = 1.36x, so multishot wins.
    const build = findBestGunBuild(gun, candidates, 1, [[{ stat: "damage", value: 3.6 }]]);
    expect(ids(build.mods)).toEqual(["multishot"]);
    // 100 * 4.6 damage * 1.9 pellets * 1.1 average crit.
    expect(build.stats.burstDps).toBeCloseTo(961.4, 6);
  });

  it("swaps out an early pick when a pair of later ones is stronger together", () => {
    const build = findBestGunBuild(
      gun,
      [
        mod("damage", [{ stat: "damage", value: 1 }]),
        mod("critChance", [{ stat: "criticalChance", value: 9 }]),
        mod("critDamage", [{ stat: "criticalDamage", value: 4 }]),
      ],
      2,
    );
    // Damage alone doubles output and is the best first pick, but 100% crit
    // chance at 10x is 1000 against 400 for damage with crit chance.
    expect(ids(build.mods)).toEqual(["critChance", "critDamage"]);
    expect(build.stats.burstDps).toBeCloseTo(1000, 6);
  });
});
