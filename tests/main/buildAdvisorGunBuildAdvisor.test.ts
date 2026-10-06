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
const MERCILESS = "/Lotus/Upgrades/CosmeticEnhancers/Offensive/PrimaryDamageOnKill";
const SECONDARY_MERCILESS = "/Lotus/Upgrades/CosmeticEnhancers/Offensive/SecondaryDamageOnKill";
// Two ranks in the shape ExportArcanes ships: stacking damage on kill and a
// passive reload speed bonus, +5% then +30% each.
const mercilessRanks = [5, 30].map((percent) => [
  {
    tag: "/Lotus/Language/Upgrades/CosmeticEnhancerDescriptionNoChanceWithDurationAndStacks",
    sub: {
      CONDITION: "/Lotus/Language/Upgrades/OnKillCondition_Description",
      BONUS: { tag: "/Lotus/Language/Upgrades/WeaponDamageModDesc", sub: { val: `+${percent}` } },
      DURATION: "4",
      STACKS: "12",
    },
  },
  { tag: "/Lotus/Language/Upgrades/WeaponReloadSpeedModDesc", sub: { val: `+${percent}` } },
]);
const CRIT = "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod";
const CRIT_CORRUPTED = "/Lotus/Upgrades/Mods/Rifle/DualStat/CorruptedCritRateFireRateRifle";
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
  polarities: {},
  rivens: { owned: () => [], family: (name) => name, disposition: () => 1 },
  arcanes: {
    [MERCILESS]: { name: "/Lotus/Language/Fixture/MercilessName", levelStats: mercilessRanks },
    [SECONDARY_MERCILESS]: {
      name: "/Lotus/Language/Fixture/SecondaryMercilessName",
      levelStats: mercilessRanks,
    },
  },
  weapons: {
    [RIFLE]: weapon(),
    [BOW]: weapon({
      name: "/Lotus/Language/Fixture/BowName",
      holsterCategory: "BOW",
      trigger: "CHARGE",
    }),
  },
  upgrades: {
    [DAMAGE]: { compat: RIFLE_BASE, baseDrain: 18, polarity: "AP_ATTACK" },
    [DAMAGE_FLAWED]: { compat: RIFLE_BASE },
    [DAMAGE_AMALGAM]: { compat: RIFLE_BASE },
    [CRIT]: { compat: RIFLE_BASE },
    [CRIT_CORRUPTED]: { compat: RIFLE_BASE },
    [HEAT]: { compat: RIFLE_BASE },
    [COLD]: { compat: RIFLE_BASE },
    [TOXIN]: { compat: RIFLE_BASE },
    [MULTISHOT]: { compat: RIFLE_BASE, baseDrain: 9, polarity: "AP_ATTACK" },
    [MULTISHOT_GALVANIZED]: { compat: RIFLE_BASE, baseDrain: 15, polarity: "AP_ATTACK" },
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
      uniqueName: CRIT,
      name: "Fixture Point Strike",
      fusionLimit: 0,
      levelStats: [{ stats: ["+150% Critical Chance"] }],
    },
    {
      uniqueName: CRIT_CORRUPTED,
      name: "Fixture Critical Delay",
      fusionLimit: 0,
      levelStats: [{ stats: ["+200% Critical Chance", "-20% Fire Rate (x2 for Bows)"] }],
    },
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
    "/Lotus/Language/Fixture/MercilessName": "Fixture Merciless",
    "/Lotus/Language/Fixture/SecondaryMercilessName": "Fixture Secondary Merciless",
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
    expect(review.advice.mods.map((m) => m.name)).toEqual([
      "Galvanized Fixture Chamber",
      "Fixture Serration",
    ]);
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

describe("Kuva, Tenet and Coda bonus elements", () => {
  // The inventory stores the bonus as a tag and an integer out of 0x3FFFFFFF.
  const MAX_ROLL = 0x3fffffff;
  const lichGun = (Tag: string, Value: number) =>
    inventory({
      LongGuns: [
        {
          ItemId: id(100),
          ItemType: RIFLE,
          UpgradeType: "/Lotus/Weapons/Grineer/KuvaLich/Upgrades/InnateDamageRandomMod",
          UpgradeFingerprint: JSON.stringify({ buffs: [{ Tag, Value }] }),
        },
      ],
      Upgrades: [],
      RawUpgrades: [],
    });
  const unmodded = (owned: unknown) => {
    const advice = adviseGunBuild(owned, RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    return advice;
  };

  it("adds the bonus as base damage of its element, from 25% to 60%", () => {
    // Base 40. The top roll is 60%: 24 magnetic.
    const top = unmodded(lichGun("InnateMagDamage", MAX_ROLL));
    expect(top.stats.damage.magnetic).toBeCloseTo(24, 4);
    expect(top.weapon.bonus).toEqual({ damageType: "magnetic", value: expect.closeTo(0.6, 6) });
    // The bottom roll is 25%: 10 magnetic.
    expect(unmodded(lichGun("InnateMagDamage", 0)).stats.damage.magnetic).toBeCloseTo(10, 4);
  });

  it("combines a bonus element with the weapon's own element", () => {
    // 60% toxin is 24, and the rifle's 30 innate heat pairs with it as gas.
    const advice = unmodded(lichGun("InnateToxinDamage", MAX_ROLL));
    expect(advice.stats.damage.gas).toBeCloseTo(54, 4);
    expect(advice.stats.damage.heat).toBeUndefined();
  });

  it("scales elemental mods from base damage that includes the bonus", () => {
    const owned = lichGun("InnateMagDamage", MAX_ROLL);
    const advice = adviseGunBuild(
      { ...owned, RawUpgrades: [{ ItemType: COLD, ItemCount: 1 }] },
      RIFLE,
      data,
    );
    if (!advice.ok) throw new Error(advice.reason);
    // Base is now 64, so +60% cold is 38.4; it pairs with the 30 innate heat.
    expect(advice.stats.damage.blast).toBeCloseTo(68.4, 4);
  });

  it("reports no bonus for an ordinary weapon or an unknown tag", () => {
    expect(unmodded(inventory({ Upgrades: [], RawUpgrades: [] })).weapon.bonus).toBeNull();
    expect(unmodded(lichGun("InnateMysteryDamage", MAX_ROLL)).weapon.bonus).toBeNull();
  });
});

describe("Rivens", () => {
  const critRiven = {
    itemId: id(4).$oid,
    weaponName: "Fixture Rifle Mk0",
    name: "Fixture Rifle Critacan",
    rank: 8,
    maxRank: 8,
    polarity: "AP_ATTACK",
    stats: [
      { tag: "WeaponCritChanceMod", name: "Critical Chance", displayValue: 200, multiplier: false },
      { tag: "WeaponZoomFovMod", name: "Zoom", displayValue: -5, multiplier: false },
    ],
  };
  // The Riven names the base weapon; the owned rifle is a variant of it with
  // half the disposition.
  const withRiven: AdvisorGameData = {
    ...data,
    rivens: {
      owned: () => [critRiven],
      family: (name) => name.replace(/ Mk0$/, ""),
      disposition: (name) => (name === "Fixture Rifle" ? 0.5 : 1),
    },
  };
  const bare = (extra: Record<string, unknown> = {}) =>
    inventory({ Upgrades: [ranked(4, RIVEN, 8)], RawUpgrades: [], ...extra });

  it("offers a Riven to every weapon in its family, at that weapon's disposition", () => {
    const advice = adviseGunBuild(bare(), RIFLE, withRiven);
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.mods.map((m) => [m.name, m.rank, m.maxRank])).toEqual([
      ["Fixture Rifle Critacan", 8, 8],
    ]);
    // +200% at half the disposition is +100%: 0.2 becomes 0.4.
    expect(advice.stats.criticalChance).toBeCloseTo(0.4, 6);
    expect(advice.mods[0].ignored).toEqual(["-2.5% Zoom"]);
  });

  it("does not offer a Riven for another weapon", () => {
    const other = {
      ...withRiven,
      rivens: { ...withRiven.rivens, owned: () => [{ ...critRiven, weaponName: "Other Gun" }] },
    };
    const advice = adviseGunBuild(bare(), RIFLE, other);
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.mods).toEqual([]);
  });

  it("charges a Riven ten capacity plus its rank", () => {
    const owned = bare({
      LongGuns: [{ ItemId: id(100), ItemType: RIFLE, XP: 450_000, Features: 0 }],
    });
    const advice = adviseGunBuild(owned, RIFLE, withRiven);
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.capacity).toEqual({ used: 18, total: 30 });
  });

  it("counts a Riven equipped on a saved config", () => {
    const owned = bare({
      LongGuns: [{ ItemId: id(100), ItemType: RIFLE, Configs: [{ Upgrades: [id(4).$oid] }] }],
    });
    const result = evaluateGunConfig(owned, RIFLE, 0, withRiven);
    if (!result.ok) throw new Error(result.reason);
    expect(result.mods.map((m) => m.name)).toEqual(["Fixture Rifle Critacan"]);
    expect(result.unrecognised).toEqual([]);
    expect(result.stats.criticalChance).toBeCloseTo(0.4, 6);
  });
});

describe("mod capacity", () => {
  // Rank 30 is 450,000 affinity. Drains here: the rank 2 damage mod 20, the
  // galvanized multishot mod 15, the plain multishot mod 9.
  const gunWith = (gun: Record<string, unknown>) =>
    inventory({ LongGuns: [{ ItemId: id(100), ItemType: RIFLE, XP: 450_000, ...gun }] });
  const names = (advice: ReturnType<typeof adviseGunBuild>) => {
    if (!advice.ok) throw new Error(advice.reason);
    return advice.mods.map((m) => m.name).sort();
  };

  it("keeps the build inside the weapon's capacity", () => {
    // 30 capacity with no catalyst: 20 + 15 does not fit, 20 + 9 does, and it
    // beats the galvanized mod with only the free flawed damage mod beside it.
    const advice = adviseGunBuild(gunWith({ Features: 0 }), RIFLE, data);
    expect(names(advice)).toEqual(["Fixture Chamber", "Fixture Serration"]);
    if (advice.ok) expect(advice.capacity).toEqual({ used: 29, total: 30 });
  });

  it("doubles capacity for a weapon with a catalyst", () => {
    const advice = adviseGunBuild(gunWith({ Features: 1 }), RIFLE, data);
    expect(names(advice)).toEqual(["Fixture Serration", "Galvanized Fixture Chamber"]);
    if (advice.ok) expect(advice.capacity).toEqual({ used: 35, total: 60 });
  });

  it("halves mods on the polarities forma has added", () => {
    const Polarity = [
      { Slot: 0, Value: "AP_ATTACK" },
      { Slot: 3, Value: "AP_ATTACK" },
    ];
    const advice = adviseGunBuild(gunWith({ Features: 0, Polarity }), RIFLE, data);
    // 20 -> 10 and 15 -> 8.
    expect(names(advice)).toEqual(["Fixture Serration", "Galvanized Fixture Chamber"]);
    if (advice.ok) expect(advice.capacity).toEqual({ used: 18, total: 30 });
  });

  it("counts the polarities the weapon comes with", () => {
    const withInnate = { ...data, polarities: { [RIFLE]: ["madurai"] } };
    const advice = adviseGunBuild(gunWith({ Features: 0 }), RIFLE, withInnate);
    // The costlier mod takes the slot: 20 -> 10, plus 15.
    expect(names(advice)).toEqual(["Fixture Serration", "Galvanized Fixture Chamber"]);
    if (advice.ok) expect(advice.capacity).toEqual({ used: 25, total: 30 });
  });

  it("uses the weapon's rank when it is not yet 30", () => {
    // Rank 10 is 50,000 affinity: 20 capacity with a catalyst. The galvanized mod
    // (15) fits and the rank 2 damage mod (20) does not fit beside it; the flawed
    // damage mod has no drain in the fixture, so it comes along.
    const advice = adviseGunBuild(gunWith({ XP: 50_000, Features: 1 }), RIFLE, data);
    expect(names(advice)).toEqual(["Flawed Fixture Serration", "Galvanized Fixture Chamber"]);
    if (advice.ok) expect(advice.capacity).toEqual({ used: 15, total: 20 });
  });

  it("ignores capacity when asked to", () => {
    const advice = adviseGunBuild(gunWith({ Features: 0 }), RIFLE, data, {
      assumeConditionals: true,
      respectCapacity: false,
    });
    expect(names(advice)).toEqual(["Fixture Serration", "Galvanized Fixture Chamber"]);
    if (advice.ok) expect(advice.capacity).toBeNull();
  });

  it("offers an arcane only to a weapon with an arcane adapter", () => {
    const arcane = [ranked(2, DAMAGE, 2), ranked(9, MERCILESS, 1)];
    const without = adviseGunBuild(
      inventory({
        LongGuns: [{ ItemId: id(100), ItemType: RIFLE, XP: 450_000, Features: 1 }],
        Upgrades: arcane,
      }),
      RIFLE,
      data,
    );
    const withAdapter = adviseGunBuild(
      inventory({
        LongGuns: [{ ItemId: id(100), ItemType: RIFLE, XP: 450_000, Features: 33 }],
        Upgrades: arcane,
      }),
      RIFLE,
      data,
    );
    if (!without.ok || !withAdapter.ok) throw new Error("advice failed");
    expect(without.arcane).toBeNull();
    expect(withAdapter.arcane?.type).toBe(MERCILESS);
  });
});

describe("ranking against a faction", () => {
  const elemental = (...types: string[]) =>
    inventory({
      Upgrades: [],
      RawUpgrades: types.map((ItemType) => ({ ItemType, ItemCount: 1 })),
    });

  it("reports damage per second after the faction's weaknesses", () => {
    const advice = adviseGunBuild(elemental(COLD, TOXIN), RIFLE, data, {
      assumeConditionals: true,
      faction: "corrupted",
    });
    if (!advice.ok) throw new Error(advice.reason);
    // Impact 10, innate heat 30, and cold with toxin as 48 viral: 88 a hit.
    expect(advice.stats.totalDamage).toBeCloseTo(88, 6);
    // Corrupted are armoured and weak to viral; the 48 viral a hit also keeps
    // Viral stacks up. The model's own numbers are tested in statusModel.
    const versus = advice.versus;
    expect(versus?.faction).toBe("corrupted");
    // Capped armour lets 10% through; the innate heat keeps a burn up most of
    // the time, which lifts that towards the 36.4% of halved armour.
    expect(versus?.armourMultiplier).toBeGreaterThan(0.3);
    expect(versus?.armourMultiplier).toBeLessThan(0.3637);
    expect(versus?.viralMultiplier).toBeGreaterThan(1);
    // 112 of 88 for the type weakness, then Viral and armour.
    expect(versus?.directDps).toBeCloseTo(
      ((advice.stats.burstDps * 112) / 88) *
        (versus?.viralMultiplier ?? 0) *
        (versus?.armourMultiplier ?? 0),
      6,
    );
    expect(versus?.burstDps).toBeCloseTo((versus?.directDps ?? 0) + (versus?.statusDps ?? 0), 6);
  });

  it("leaves the element a faction is weak to uncombined", () => {
    const advice = adviseGunBuild(elemental(HEAT, COLD, TOXIN), RIFLE, data, {
      assumeConditionals: true,
      faction: "infested",
    });
    if (!advice.ok) throw new Error(advice.reason);
    // Infested are weak to heat, so cold and toxin pair up and heat (24 from the
    // mod plus 30 innate) stays single.
    expect(advice.stats.damage.heat).toBeCloseTo(54, 6);
    expect(advice.stats.damage.viral).toBeCloseTo(48, 6);
    // The mods are listed in the order that produces that: heat last.
    expect(advice.mods.map((m) => m.type).indexOf(HEAT)).toBe(2);
  });

  it("combines into the element a faction is weak to", () => {
    const advice = adviseGunBuild(elemental(HEAT, COLD, TOXIN), RIFLE, data, {
      assumeConditionals: true,
      faction: "corrupted",
    });
    if (!advice.ok) throw new Error(advice.reason);
    // Corrupted are weak to viral, and nothing else on offer is.
    expect(advice.stats.damage.viral).toBeCloseTo(48, 6);
  });

  it("reports no faction figures when none is chosen", () => {
    const advice = adviseGunBuild(elemental(COLD, TOXIN), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.versus).toBeNull();
  });

  it("gives saved configs the same faction figures for comparison", () => {
    const owned = inventory({
      LongGuns: [{ ItemId: id(100), ItemType: RIFLE, Configs: [{ Upgrades: [COLD, TOXIN] }] }],
    });
    const review = reviewGun(owned, RIFLE, data, { assumeConditionals: true, faction: "murmur" });
    // The Murmur have no armour in the model and resist viral: 48 at half value
    // and 40 at face value, of 88. Viral stacks still multiply what lands.
    const config = review.configs[0];
    expect(config.versus?.faction).toBe("murmur");
    expect(config.versus?.armourMultiplier).toBe(1);
    expect(config.versus?.directDps).toBeCloseTo(
      ((config.stats.burstDps * 64) / 88) * (config.versus?.viralMultiplier ?? 0),
      6,
    );
  });
});

describe("weapon arcanes", () => {
  const withArcane = (arcane: string, rank = 1) =>
    inventory({
      Upgrades: [ranked(2, DAMAGE, 2), ranked(3, MULTISHOT_GALVANIZED, 0), ranked(9, arcane, rank)],
    });

  it("recommends an owned arcane and values the mods beside it", () => {
    const advice = adviseGunBuild(withArcane(MERCILESS), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);

    expect(advice.arcane).toMatchObject({ type: MERCILESS, name: "Fixture Merciless", rank: 1 });
    expect(advice.arcane?.maxRank).toBe(1);
    // Base 40 with +150% from the mod and 12 x +30% from the arcane: 40 * 6.1.
    expect(advice.stats.totalDamage).toBeCloseTo(244, 6);
    // The passive: 2s at +30% reload speed.
    expect(advice.stats.reloadTime).toBeCloseTo(2 / 1.3, 6);

    // The damage mod is now worth 1.5 of 6.1, not 1.5 of 2.5.
    const serration = advice.mods.find((m) => m.type === DAMAGE);
    expect(serration?.burstDpsShare).toBeCloseTo(60 / 244, 6);
    // Without the arcane the same mods deal 100 a projectile.
    expect(advice.arcane?.burstDpsShare).toBeCloseTo(144 / 244, 6);
  });

  it("does not offer a secondary arcane to a primary", () => {
    const advice = adviseGunBuild(withArcane(SECONDARY_MERCILESS), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.arcane).toBeNull();
    expect(advice.stats.totalDamage).toBeCloseTo(100, 6);
  });

  it("recommends no arcane when its only burst bonus needs stacks", () => {
    const advice = adviseGunBuild(withArcane(MERCILESS), RIFLE, data, {
      assumeConditionals: false,
    });
    if (!advice.ok) throw new Error(advice.reason);
    expect(advice.arcane).toBeNull();
  });

  it("uses the lower rank's values for a lower rank arcane", () => {
    const advice = adviseGunBuild(withArcane(MERCILESS, 0), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    // 12 x +5% beside +150%: 40 * 3.1.
    expect(advice.stats.totalDamage).toBeCloseTo(124, 6);
  });

  it("reads the arcane equipped on a saved config and applies its passive", () => {
    const refs = ["", "", "", "", "", "", "", "", "", id(9).$oid];
    const owned = inventory({
      LongGuns: [{ ItemId: id(100), ItemType: RIFLE, Configs: [{ Upgrades: refs }] }],
      Upgrades: [ranked(9, MERCILESS, 1)],
    });
    const result = evaluateGunConfig(owned, RIFLE, 0, data);
    if (!result.ok) throw new Error(result.reason);

    expect(result.arcane).toMatchObject({ type: MERCILESS, name: "Fixture Merciless", slot: 9 });
    expect(result.unrecognised).toEqual([]);
    // Arsenal numbers: the stacks are not counted, the reload passive is.
    expect(result.stats.totalDamage).toBeCloseTo(40, 6);
    expect(result.stats.reloadTime).toBeCloseTo(2 / 1.3, 6);
  });
});

describe("adviseGunBuild", () => {
  it("builds from owned, compatible mods at the best rank owned", () => {
    const advice = adviseGunBuild(inventory(), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);

    expect(advice.weapon).toEqual({ type: RIFLE, name: "Fixture Rifle", bonus: null });
    // The galvanized multishot mod at full stacks (+80% and 5 x +30%) over the
    // plain +90% one of the same family, then the rank 2 copy of the damage mod.
    expect(advice.mods.map((m) => [m.name, m.rank, m.maxRank])).toEqual([
      ["Galvanized Fixture Chamber", 0, 0],
      ["Fixture Serration", 2, 2],
    ]);
    // Impact 10 and heat 30, both * 2.5.
    expect(advice.stats.damage.impact).toBeCloseTo(25, 6);
    expect(advice.stats.damage.heat).toBeCloseTo(75, 6);
    // 100 damage * 3.3 pellets * 1.2 average crit * 5 shots a second.
    expect(advice.stats.burstDps).toBeCloseTo(1980, 6);
    // 40 * 1.2 * 5 with nothing equipped.
    expect(advice.unmodded.burstDps).toBeCloseTo(240, 6);
  });

  it("says how much burst damage each mod is worth to the build", () => {
    const advice = adviseGunBuild(inventory(), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    // Without multishot 1980 falls to 600; without the damage mod, to 792.
    expect(advice.mods[0].burstDpsShare).toBeCloseTo(1380 / 1980, 6);
    expect(advice.mods[1].burstDpsShare).toBeCloseTo(0.6, 6);
  });

  it("names the conditional lines it counted at full stacks", () => {
    const advice = adviseGunBuild(inventory(), RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    const galvanized = advice.mods.find((m) => m.type === MULTISHOT_GALVANIZED);
    expect(galvanized?.assumed).toEqual(["On Kill:\n+30% Multishot for 20s. Stacks up to 5x."]);
    expect(galvanized?.ignored).toEqual([]);
  });

  it("ranks on arsenal numbers alone when stacks are not assumed", () => {
    const advice = adviseGunBuild(inventory(), RIFLE, data, { assumeConditionals: false });
    if (!advice.ok) throw new Error(advice.reason);
    // The galvanized mod is only +80% without its stacks, so the plain +90% wins.
    expect(advice.mods.map((m) => m.name)).toEqual(["Fixture Serration", "Fixture Chamber"]);
    // 100 damage * 1.9 pellets * 1.2 average crit * 5 shots a second.
    expect(advice.stats.burstDps).toBeCloseTo(1140, 6);

    const owned = inventory({ RawUpgrades: [] });
    const forced = adviseGunBuild(owned, RIFLE, data, { assumeConditionals: false });
    if (!forced.ok) throw new Error(forced.reason);
    const galvanized = forced.mods.find((m) => m.type === MULTISHOT_GALVANIZED);
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

  it("never pairs a corrupted crit chance mod with its standard counterpart", () => {
    const owned = inventory({
      Upgrades: [],
      RawUpgrades: [
        { ItemType: CRIT, ItemCount: 1 },
        { ItemType: CRIT_CORRUPTED, ItemCount: 1 },
      ],
    });
    const advice = adviseGunBuild(owned, RIFLE, data);
    if (!advice.ok) throw new Error(advice.reason);
    // Both together would be strongest (0.9 crit chance at 0.8 fire rate), but
    // the game refuses the pair. Alone, +150% beats +200% with -20% fire rate.
    expect(advice.mods.map((m) => m.name)).toEqual(["Fixture Point Strike"]);
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
