import { describe, expect, it } from "vitest";
import { parseArcaneRank } from "../../services/buildAdvisor/arcaneEffects";

const UPGRADES = "/Lotus/Language/Upgrades/";
const STACKING = `${UPGRADES}CosmeticEnhancerDescriptionNoChanceWithDurationAndStacks`;

// The shapes ExportArcanes ships for one rank, copied from Primary Merciless
// and Primary Deadhead at rank 5.
const merciless = [
  {
    tag: STACKING,
    sub: {
      CONDITION: `${UPGRADES}OnKillCondition_Description`,
      BONUS: { tag: `${UPGRADES}WeaponDamageModDesc`, sub: { val: "+30" } },
      DURATION: "4",
      STACKS: "12",
    },
  },
  { tag: `${UPGRADES}WeaponReloadSpeedModDesc`, sub: { val: "+30" } },
];
const deadhead = [
  {
    tag: STACKING,
    sub: {
      CONDITION: `${UPGRADES}OnHeadshotKillCondition_Description`,
      BONUS: { tag: `${UPGRADES}WeaponDamageModDesc`, sub: { val: "+120" } },
      DURATION: "24",
      STACKS: "3",
    },
  },
  { tag: `${UPGRADES}SniperHeadshotMultiplierModDesc`, sub: { val: "+30" } },
  { tag: `${UPGRADES}WeaponRecoilModDesc`, sub: { val: "-50" } },
];

const strings = {
  [STACKING]: "|CONDITION|:\r\n|BONUS| for |DURATION|s. Stacks up to |STACKS|x.",
  [`${UPGRADES}OnKillCondition_Description`]: "On Kill",
  [`${UPGRADES}OnHeadshotKillCondition_Description`]: "On Headshot Kill",
  [`${UPGRADES}WeaponDamageModDesc`]: "|val|% Damage",
  [`${UPGRADES}WeaponReloadSpeedModDesc`]: "|val|% Reload Speed",
  [`${UPGRADES}SniperHeadshotMultiplierModDesc`]: "|val|% to Headshot Multiplier",
  [`${UPGRADES}WeaponRecoilModDesc`]: "|val|% Weapon Recoil",
};

const MERCILESS_LINE = "On Kill: +30% Damage for 4s. Stacks up to 12x.";

describe("parseArcaneRank", () => {
  it("counts the stacking damage bonus at full stacks beside the passive", () => {
    expect(parseArcaneRank(merciless, strings, { assumeConditionals: true })).toEqual({
      // 12 stacks of +30%.
      effects: [
        { stat: "damage", value: 3.6 },
        { stat: "reloadSpeed", value: 0.3 },
      ],
      ignored: [],
      assumed: [MERCILESS_LINE],
    });
  });

  it("keeps only the passive when stacks are not assumed", () => {
    expect(parseArcaneRank(merciless, strings, { assumeConditionals: false })).toEqual({
      effects: [{ stat: "reloadSpeed", value: 0.3 }],
      ignored: [MERCILESS_LINE],
      assumed: [],
    });
  });

  it("reports the bonuses it does not model in readable words", () => {
    const parsed = parseArcaneRank(deadhead, strings, { assumeConditionals: true });
    // 3 stacks of +120%.
    expect(parsed.effects).toEqual([{ stat: "damage", value: 3.6 }]);
    expect(parsed.ignored).toEqual(["+30% to Headshot Multiplier", "-50% Weapon Recoil"]);
  });

  it("returns nothing for a rank that is not a list of entries", () => {
    expect(parseArcaneRank(undefined, strings, { assumeConditionals: true })).toEqual({
      effects: [],
      ignored: [],
      assumed: [],
    });
  });
});
