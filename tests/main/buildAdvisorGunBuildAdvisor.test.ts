import { describe, expect, it } from "vitest";
import {
  adviseGunBuild,
  evaluateGunConfig,
  listOwnedGuns,
  reviewGun,
  type AdvisorGameData,
} from "../../services/buildAdvisor/gunBuildAdvisor";

const RIFLE = "/Lotus/Weapons/Fixture/Rifle/FixtureRifle";
const RIFLE_BASE = "/Lotus/Weapons/Fixture/Rifle/LotusFixtureRifle";
const PISTOL_BASE = "/Lotus/Weapons/Fixture/Pistol/LotusFixturePistol";
const BOW = "/Lotus/Weapons/Fixture/Bows/FixtureBow";

const DAMAGE = "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod";
const DAMAGE_FLAWED = "/Lotus/Upgrades/Mods/Rifle/Beginner/WeaponDamageAmountModBeginner";
const MULTISHOT = "/Lotus/Upgrades/Mods/Rifle/WeaponFireIterationsMod";
const MULTISHOT_GALVANIZED = "/Lotus/Upgrades/Mods/Rifle/WeaponFireIterationsSPMod";
const PISTOL_DAMAGE = "/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod";
const PVP_DAMAGE = "/Lotus/Upgrades/Mods/PvPMods/Rifle/FixturePvPMod";
const BEAM_ONLY = "/Lotus/Upgrades/Mods/Rifle/FixtureBeamMod";
const DAMAGE_AMALGAM = "/Lotus/Upgrades/Mods/DualSource/Rifle/FixtureRushMod";
const HEAT = "/Lotus/Upgrades/Mods/Rifle/FixtureHeatMod";
const COLD = "/Lotus/Upgrades/Mods/Rifle/FixtureColdMod";
const TOXIN = "/Lotus/Upgrades/Mods/Rifle/FixtureToxinMod";
const CANNONADE = "/Lotus/Upgrades/Mods/Rifle/FixtureCannonadeMod";
const FIRE_RATE = "/Lotus/Upgrades/Mods/Rifle/FixtureFireRateMod";
const CONDITIONAL = "/Lotus/Upgrades/Mods/Rifle/FixtureConditionalMod";
const RIVEN = "/Lotus/Upgrades/Mods/Randomized/LotusRifleRandomModRare";

const weapon = (extra: Record<string, unknown> = {}) => ({
  name: "/Lotus/Language/Fixture/RifleName",
  parentName: RIFLE_BASE,
  productCategory: "LongGuns",
  holsterCategory: "RIFLE",
  trigger: "AUTO",
  // Impact, puncture, slash, heat, ... in DE's damage type order.
  damagePerShot: [10, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  totalDamage: 40,
  criticalChance: 0.2,
  criticalMultiplier: 2,
  procChance: 0.3,
  fireRate: 5,
  multishot: 1,
  magazineSize: 50,
  reloadTime: 2,
  compatibilityTags: ["ASSAULT_AMMO"],
  ...extra,
});

const ranks = (...percents: number[]) => percents.map((p) => ({ stats: [`+${p}% Damage`] }));

const data: AdvisorGameData = {
  weapons: {
    [RIFLE]: weapon(),
    [BOW]: weapon({
      name: "/Lotus/Language/Fixture/BowName",
      holsterCategory: "BOW",
      trigger: "CHARGE",
    }),
  },
  upgrades: {
    [DAMAGE]: { compat: RIFLE_BASE },
    [DAMAGE_FLAWED]: { compat: RIFLE_BASE },
    [DAMAGE_AMALGAM]: { compat: RIFLE_BASE },
    [HEAT]: { compat: RIFLE_BASE },
    [COLD]: { compat: RIFLE_BASE },
    [TOXIN]: { compat: RIFLE_BASE },
    [MULTISHOT]: { compat: RIFLE_BASE },
    [MULTISHOT_GALVANIZED]: { compat: RIFLE_BASE },
    [PISTOL_DAMAGE]: { compat: PISTOL_BASE },
    [PVP_DAMAGE]: { compat: RIFLE_BASE },
    [BEAM_ONLY]: { compat: RIFLE_BASE, compatibilityTags: ["BEAM"] },
    [CANNONADE]: { compat: RIFLE_BASE, description: "/Lotus/Language/Fixture/CannonadeDesc" },
    [FIRE_RATE]: { compat: RIFLE_BASE },
    [CONDITIONAL]: { compat: RIFLE_BASE, description: "/Lotus/Language/Fixture/ConditionalDesc" },
  },
  mods: [
    {
      uniqueName: DAMAGE,
      name: "Fixture Serration",
      fusionLimit: 2,
      levelStats: ranks(50, 100, 150),
    },
    {
      uniqueName: DAMAGE_FLAWED,
      name: "Flawed Fixture Serration",
      fusionLimit: 0,
      levelStats: ranks(40),
    },
    ...(
      [
        [HEAT, "Fixture Heat", "<DT_FIRE_COLOR>Heat"],
        [COLD, "Fixture Cold", "<DT_FREEZE_COLOR>Cold"],
        [TOXIN, "Fixture Toxin", "<DT_POISON_COLOR>Toxin"],
      ] as const
    ).map(([uniqueName, name, element]) => ({
      uniqueName,
      name,
      fusionLimit: 0,
      levelStats: [{ stats: [`+60% ${element}`] }],
    })),
    {
      uniqueName: DAMAGE_AMALGAM,
      name: "Amalgam Fixture Serration",
      fusionLimit: 0,
      levelStats: ranks(155),
    },
    {
      uniqueName: MULTISHOT,
      name: "Fixture Chamber",
      fusionLimit: 0,
      levelStats: [{ stats: ["+90% Multishot"] }],
    },
    {
      uniqueName: MULTISHOT_GALVANIZED,
      name: "Galvanized Fixture Chamber",
      fusionLimit: 0,
      levelStats: [
        { stats: ["+80% Multishot", "On Kill:\n+30% Multishot for 20s. Stacks up to 5x."] },
      ],
    },
    { uniqueName: PISTOL_DAMAGE, name: "Fixture Hornet", fusionLimit: 0, levelStats: ranks(220) },
    { uniqueName: PVP_DAMAGE, name: "Fixture Conclave", fusionLimit: 0, levelStats: ranks(500) },
    { uniqueName: BEAM_ONLY, name: "Fixture Beam", fusionLimit: 0, levelStats: ranks(500) },
    { uniqueName: CANNONADE, name: "Fixture Cannonade", fusionLimit: 0, levelStats: ranks(240) },
    {
      uniqueName: FIRE_RATE,
      name: "Fixture Speed Trigger",
      fusionLimit: 0,
      levelStats: [{ stats: ["+60% Fire Rate"] }],
    },
    {
      uniqueName: CONDITIONAL,
      name: "Fixture Conditional",
      fusionLimit: 0,
      levelStats: ranks(900),
    },
  ],
  strings: {
    "/Lotus/Language/Fixture/RifleName": "Fixture Rifle",
    "/Lotus/Language/Fixture/BowName": "Fixture Bow",
    "/Lotus/Language/Fixture/CannonadeDesc":
      "Only compatible with Semi-Auto Trigger. Fire Rate cannot be modified.",
    "/Lotus/Language/Fixture/ConditionalDesc": "Damage is halved while airborne.",
  },
};

const id = (n: number) => ({ $oid: n.toString(16).padStart(24, "0") });
const ranked = (n: number, ItemType: string, lvl?: number) => ({
  ItemId: id(n),
  ItemType,
  UpgradeFingerprint: lvl === undefined ? "{}" : JSON.stringify({ lvl }),
});

const inventory = (extra: Record<string, unknown> = {}) => ({
  LongGuns: [
    { ItemId: id(100), ItemType: RIFLE },
    { ItemId: id(101), ItemType: BOW },
  ],
  Upgrades: [
    ranked(1, DAMAGE, 1),
    ranked(2, DAMAGE, 2),
    ranked(3, MULTISHOT_GALVANIZED, 0),
    ranked(4, RIVEN, 8),
  ],
  RawUpgrades: [
    { ItemType: DAMAGE_FLAWED, ItemCount: 3 },
    { ItemType: MULTISHOT, ItemCount: 1 },
    { ItemType: PISTOL_DAMAGE, ItemCount: 1 },
    { ItemType: PVP_DAMAGE, ItemCount: 1 },
    { ItemType: BEAM_ONLY, ItemCount: 1 },
  ],
  ...extra,
});

describe("listOwnedGuns", () => {
  it("lists owned primaries and secondaries by name and says which it cannot build for", () => {
    const unknown = "/Lotus/Weapons/Fixture/Unknown";
    const owned = inventory({
      Pistols: [{ ItemId: id(102), ItemType: unknown }],
      Melee: [{ ItemId: id(103), ItemType: "/Lotus/Weapons/Fixture/Sword" }],
    });
    expect(listOwnedGuns(owned, data)).toEqual([
      { type: BOW, name: "Fixture Bow", category: "LongGuns", unsupported: "unsupported-weapon" },
      { type: RIFLE, name: "Fixture Rifle", category: "LongGuns", unsupported: null },
      { type: unknown, name: "Unknown", category: "Pistols", unsupported: "unknown-weapon" },
    ]);
  });

  it("lists a weapon owned twice once", () => {
    const owned = inventory({
      LongGuns: [
        { ItemId: id(100), ItemType: RIFLE },
        { ItemId: id(104), ItemType: RIFLE },
      ],
    });
    expect(listOwnedGuns(owned, data).map((gun) => gun.type)).toEqual([RIFLE]);
  });

  it("lists nothing for a payload that is not an inventory", () => {
    expect(listOwnedGuns(null, data)).toEqual([]);
  });
});

describe("reviewGun", () => {
  it("returns the recommendation next to the saved configs that hold mods", () => {
    const owned = inventory({
      LongGuns: [
        {
          ItemId: id(100),
          ItemType: RIFLE,
          Configs: [{ Upgrades: ["", ""] }, { Name: "Boss", Upgrades: [id(1).$oid] }, {}],
        },
      ],
    });
    const review = reviewGun(owned, RIFLE, data);
    if (!review.advice.ok) throw new Error(review.advice.reason);
    expect(review.advice.mods.map((m) => m.name)).toEqual(["Fixture Serration", "Fixture Chamber"]);
    expect(review.configs.map((c) => [c.index, c.name, c.mods.map((m) => m.name)])).toEqual([
      [1, "Boss", ["Fixture Serration"]],
    ]);
    // The rank 1 copy: 40 damage with +100%.
    expect(review.configs[0].stats.totalDamage).toBeCloseTo(80, 6);
  });

  it("returns no configs with the refusal for a weapon it cannot build for", () => {
    expect(reviewGun(inventory(), BOW, data)).toEqual({
      advice: { ok: false, reason: "unsupported-weapon" },
      configs: [],
    });
  });
});

describe("evaluateGunConfig", () => {
  const withConfigs = (Upgrades: string[]) =>
    inventory({
      LongGuns: [{ ItemId: id(100), ItemType: RIFLE, Configs: [{}, { Upgrades }] }],
    });

  it("computes the stats of a saved mod config in slot order", () => {
    // The rank 1 damage mod by id, an empty slot, then an unranked multishot mod.
    const owned = withConfigs([id(1).$oid, "", MULTISHOT]);
    const result = evaluateGunConfig(owned, RIFLE, 1, data);
    if (!result.ok) throw new Error(result.reason);

    // Listed as the arsenal shows them: the stored order is the reverse.
    expect(result.mods.map((m) => [m.slot, m.name, m.rank])).toEqual([
      [2, "Fixture Chamber", 0],
      [0, "Fixture Serration", 1],
    ]);
    // Impact 10 and heat 30 with +100%, then 1.9 pellets.
    expect(result.stats.totalDamage).toBeCloseTo(80, 6);
    expect(result.stats.multishot).toBeCloseTo(1.9, 6);
    expect(result.unrecognised).toEqual([]);
  });

  it("combines elements in arsenal order, which is the stored order reversed", () => {
    // Seen in game on Trumna Prime: heat stored first sits in the last mod
    // slot, so toxin and cold pair up and heat joins the innate heat.
    const result = evaluateGunConfig(withConfigs([HEAT, COLD, TOXIN]), RIFLE, 1, data);
    if (!result.ok) throw new Error(result.reason);
    // Base 40: toxin and cold 24 each; heat 24 plus 30 innate.
    expect(result.stats.damage.viral).toBeCloseTo(48, 6);
    expect(result.stats.damage.heat).toBeCloseTo(54, 6);
    expect(result.stats.damage.blast).toBeUndefined();
  });

  it("keeps the exilus slot after the eight mod slots", () => {
    const refs = ["", "", "", "", "", "", "", MULTISHOT, DAMAGE_FLAWED];
    const result = evaluateGunConfig(withConfigs(refs), RIFLE, 1, data);
    if (!result.ok) throw new Error(result.reason);
    expect(result.mods.map((m) => m.slot)).toEqual([7, 8]);
  });

  it("lists what it could not account for instead of dropping it silently", () => {
    const arcane = "/Lotus/Upgrades/CosmeticEnhancers/Offensive/FixtureArcane";
    const result = evaluateGunConfig(withConfigs([id(4).$oid, arcane]), RIFLE, 1, data);
    if (!result.ok) throw new Error(result.reason);
    expect(result.mods).toEqual([]);
    expect(result.unrecognised).toEqual([RIVEN, arcane]);
    expect(result.stats.totalDamage).toBeCloseTo(40, 6);
  });

  it("refuses a config the weapon does not have", () => {
    expect(evaluateGunConfig(withConfigs([]), RIFLE, 5, data)).toEqual({
      ok: false,
      reason: "no-such-config",
    });
  });
});

describe("adviseGunBuild", () => {
  it("builds from owned, compatible mods at the best rank owned", () => {
    const advice = adviseGunBuild(inventory(), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);

    expect(advice.weapon).toEqual({ type: RIFLE, name: "Fixture Rifle" });
    // The rank 2 copy of the damage mod and the plain multishot mod: the
    // galvanized one is the same family and only +80% without its stacks.
    expect(advice.mods.map((m) => [m.name, m.rank, m.maxRank])).toEqual([
      ["Fixture Serration", 2, 2],
      ["Fixture Chamber", 0, 0],
    ]);
    // Impact 10 and heat 30, both * 2.5.
    expect(advice.stats.damage.impact).toBeCloseTo(25, 6);
    expect(advice.stats.damage.heat).toBeCloseTo(75, 6);
    // 100 damage * 1.9 pellets * 1.2 average crit * 5 shots a second.
    expect(advice.stats.burstDps).toBeCloseTo(1140, 6);
    // 40 * 1.2 * 5 with nothing equipped.
    expect(advice.unmodded.burstDps).toBeCloseTo(240, 6);
  });

  it("says how much burst damage each mod is worth to the build", () => {
    const advice = adviseGunBuild(inventory(), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    // Without the damage mod 1140 falls to 456; without multishot, to 600.
    expect(advice.mods[0].burstDpsShare).toBeCloseTo(0.6, 6);
    expect(advice.mods[1].burstDpsShare).toBeCloseTo(540 / 1140, 6);
  });

  it("reports the stat lines it could not use", () => {
    const owned = inventory({ RawUpgrades: [] });
    const advice = adviseGunBuild(owned, RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    const galvanized = advice.mods.find((m) => m.type === MULTISHOT_GALVANIZED);
    expect(galvanized?.ignored).toEqual(["On Kill:\n+30% Multishot for 20s. Stacks up to 5x."]);
  });

  it("treats an Amalgam form as the same family even though its path differs", () => {
    const owned = inventory({
      Upgrades: [ranked(2, DAMAGE, 2)],
      RawUpgrades: [
        { ItemType: DAMAGE_AMALGAM, ItemCount: 1 },
        { ItemType: MULTISHOT, ItemCount: 1 },
      ],
    });
    const advice = adviseGunBuild(owned, RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    // +155% beats +150%, and the two cannot be equipped together.
    expect(advice.mods.map((m) => m.name).sort()).toEqual([
      "Amalgam Fixture Serration",
      "Fixture Chamber",
    ]);
  });

  it("applies a fire rate lock written in the mod's description", () => {
    const owned = inventory({
      Upgrades: [],
      RawUpgrades: [
        { ItemType: CANNONADE, ItemCount: 1 },
        { ItemType: FIRE_RATE, ItemCount: 1 },
      ],
    });
    const advice = adviseGunBuild(owned, RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    // +240% damage is worth more than +60% fire rate, which it switches off.
    expect(advice.mods.map((m) => m.name)).toEqual(["Fixture Cannonade"]);
    expect(advice.stats.fireRate).toBeCloseTo(5, 6);
  });

  it("leaves out a mod whose description states a rule it does not model", () => {
    const owned = inventory({
      Upgrades: [],
      RawUpgrades: [{ ItemType: CONDITIONAL, ItemCount: 1 }],
    });
    const advice = adviseGunBuild(owned, RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.mods).toEqual([]);

    const equipped = inventory({
      LongGuns: [{ ItemId: id(100), ItemType: RIFLE, Configs: [{ Upgrades: [CONDITIONAL] }] }],
    });
    const result = evaluateGunConfig(equipped, RIFLE, 0, data);
    if (!result.ok) throw new Error(result.reason);
    expect(result.mods[0].ignored).toEqual(["Damage is halved while airborne."]);
  });

  it("refuses a weapon that is not in the inventory", () => {
    const advice = adviseGunBuild(inventory({ LongGuns: [] }), RIFLE, data);
    expect(advice).toEqual({ ok: false, reason: "weapon-not-owned" });
  });

  it("refuses a weapon the game data does not know", () => {
    const unknown = "/Lotus/Weapons/Fixture/Unknown";
    const owned = inventory({ LongGuns: [{ ItemId: id(100), ItemType: unknown }] });
    expect(adviseGunBuild(owned, unknown, data)).toEqual({ ok: false, reason: "unknown-weapon" });
  });

  it("refuses bows and charge weapons, whose numbers it would get wrong", () => {
    expect(adviseGunBuild(inventory(), BOW, data)).toEqual({
      ok: false,
      reason: "unsupported-weapon",
    });
  });

  it("reads a real primary and secondary from the bundled game data", () => {
    const trumnaPrime = "/Lotus/Weapons/Tenno/LongGuns/PrimeTrumna/PrimeTrumnaWeapon";
    const lexPrime = "/Lotus/Weapons/Tenno/Pistols/PrimeLex/PrimeLex";
    const serration = "/Lotus/Upgrades/Mods/Rifle/WeaponDamageAmountMod";
    const hornetStrike = "/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod";
    const hek = "/Lotus/Weapons/Tenno/Shotgun/QuadShotgun";
    const pointBlank = "/Lotus/Upgrades/Mods/Shotgun/WeaponDamageAmountMod";
    const owned = {
      LongGuns: [
        { ItemId: id(100), ItemType: trumnaPrime },
        { ItemId: id(102), ItemType: hek },
      ],
      Pistols: [{ ItemId: id(101), ItemType: lexPrime }],
      Upgrades: [ranked(1, serration, 10), ranked(2, hornetStrike, 10), ranked(3, pointBlank, 5)],
    };

    const shotgun = adviseGunBuild(owned, hek);
    if (!shotgun.ok) throw new Error(shotgun.reason);
    expect(shotgun.mods.map((m) => m.name)).toEqual(["Point Blank"]);
    // Puncture 48.75 a pellet with +90%.
    expect(shotgun.stats.damage.puncture).toBeCloseTo(92.625, 4);

    const rifle = adviseGunBuild(owned, trumnaPrime);
    if (!rifle.ok) throw new Error(rifle.reason);
    expect(rifle.weapon.name).toBe("Trumna Prime");
    expect(rifle.mods.map((m) => m.name)).toEqual(["Serration"]);
    // Impact 32 and heat 53 with +165%.
    expect(rifle.stats.damage.impact).toBeCloseTo(84.8, 4);
    expect(rifle.stats.damage.heat).toBeCloseTo(140.45, 4);

    const pistol = adviseGunBuild(owned, lexPrime);
    if (!pistol.ok) throw new Error(pistol.reason);
    expect(pistol.mods.map((m) => m.name)).toEqual(["Hornet Strike"]);
    // Puncture 144 with +220%.
    expect(pistol.stats.damage.puncture).toBeCloseTo(460.8, 4);
  });
});
