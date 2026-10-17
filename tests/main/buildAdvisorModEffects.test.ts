import { describe, expect, it } from "vitest";
import { parseModStats } from "../../services/buildAdvisor/modEffects";

describe("parseModStats", () => {
  it("reads Hunter Munitions at each rank even with stacks off", () => {
    for (let rank = 0; rank <= 5; rank++) {
      const chance = 5 * (rank + 1);
      expect(parseModStats([`+${chance}% chance to apply <DT_SLASH_COLOR> on Critical`])).toEqual({
        effects: [{ stat: "slashOnCritical", value: chance / 100 }],
        ignored: [],
        assumed: [],
      });
    }
  });

  it("reads a base damage bonus as a fraction", () => {
    expect(parseModStats(["+165% Damage"])).toEqual({
      effects: [{ stat: "damage", value: 1.65 }],
      ignored: [],
      assumed: [],
    });
  });

  it("reads every plain gun stat in scope", () => {
    const { effects, ignored } = parseModStats([
      "+90% Multishot",
      "+150% Critical Chance",
      "+120% Critical Damage",
      "+60% Fire Rate",
      "+90% Status Chance",
      "+30% Reload Speed",
      "+30% Magazine Capacity",
    ]);
    expect(ignored).toEqual([]);
    expect(effects).toEqual([
      { stat: "multishot", value: 0.9 },
      { stat: "criticalChance", value: 1.5 },
      { stat: "criticalDamage", value: 1.2 },
      { stat: "fireRate", value: 0.6 },
      { stat: "statusChance", value: 0.9 },
      { stat: "reloadSpeed", value: 0.3 },
      { stat: "magazineCapacity", value: 0.3 },
    ]);
  });

  it("reads elemental and physical damage through the colour tag", () => {
    expect(
      parseModStats(["+60% <DT_FIRE_COLOR>Heat", "+90% <DT_PUNCTURE_COLOR>Puncture"]).effects,
    ).toEqual([
      { stat: "typedDamage", damageType: "heat", value: 0.6 },
      { stat: "typedDamage", damageType: "puncture", value: 0.9 },
    ]);
  });

  it("keeps penalties and decimals, and accepts the bow note on fire rate", () => {
    expect(parseModStats(["-20% Fire Rate (x2 for Bows)", "+72.7% Status Chance"]).effects).toEqual(
      [
        { stat: "fireRate", value: -0.2 },
        { stat: "statusChance", value: 0.727 },
      ],
    );
  });

  it("counts a stacking On Kill bonus at full stacks when told to assume them", () => {
    const line = "On Kill:\n+30% Multishot for 20s. Stacks up to 5x.";
    expect(parseModStats(["+80% Multishot", line], { assumeConditionals: true })).toEqual({
      effects: [
        { stat: "multishot", value: 0.8 },
        { stat: "multishot", value: 1.5 },
      ],
      ignored: [],
      assumed: [line],
    });
  });

  it("counts a bonus that needs aiming, and one with no stacks, once", () => {
    const lines = [
      "On Kill:\n+120% Critical Damage when Aiming for 9s",
      "On Reload:\n+60% Fire Rate when Aiming for 9s",
    ];
    expect(parseModStats(lines, { assumeConditionals: true }).effects).toEqual([
      { stat: "criticalDamage", value: 1.2 },
      { stat: "fireRate", value: 0.6 },
    ]);
  });

  it("reads two conditional bonuses written as one line", () => {
    const line =
      "On Weak Point Hit:\n+120% Critical Chance when Aiming for 12s\n" +
      "On Weak Point Kill:\n+40% Critical Chance when Aiming for 12s. Stacks up to 5x.";
    expect(parseModStats([line], { assumeConditionals: true })).toEqual({
      effects: [
        { stat: "criticalChance", value: 1.2 },
        { stat: "criticalChance", value: 2 },
      ],
      ignored: [],
      assumed: [line],
    });
  });

  it("reads the line break the bundled data writes as a backslash and an n", () => {
    // @wfcd/items stores these two characters, not a newline.
    const line =
      "On Weak Point Hit:\\n+120% Critical Chance when Aiming for 12s\\n" +
      "On Weak Point Kill:\\n+40% Critical Chance when Aiming for 12s. Stacks up to 5x.";
    const stacking = "On Kill:\\n+30% Multishot for 20s. Stacks up to 4x.";
    expect(parseModStats([line, stacking], { assumeConditionals: true }).effects).toEqual([
      { stat: "criticalChance", value: 1.2 },
      { stat: "criticalChance", value: 2 },
      { stat: "multishot", value: 1.2 },
    ]);
  });

  it("leaves conditional bonuses out unless told to assume them", () => {
    const line = "On Kill:\n+30% Multishot for 20s. Stacks up to 5x.";
    expect(parseModStats([line])).toEqual({ effects: [], ignored: [line], assumed: [] });
  });

  it("never assumes a conditional bonus it only partly understands", () => {
    const lines = [
      "On Kill:\n+40% Direct Damage per Status Type affecting the target for 20s. Stacks up to 2x.",
      "On Hit:\n+30% Multishot\n-10% Accuracy for 2s. Stacks up to 4x.\n(Non-AOE Bows)",
      "On Reload: Next Magazine has Status Chance and Multishot increased by 2% per shot landed with current Magazine. Max 20 stacks.",
    ];
    expect(parseModStats(lines, { assumeConditionals: true })).toEqual({
      effects: [],
      ignored: lines,
      assumed: [],
    });
  });

  it("ignores conditional and out-of-scope lines instead of guessing", () => {
    const lines = [
      "On Kill:\n+30% Multishot for 20s. Stacks up to 5x.",
      "+110% Damage on first shot in Magazine",
      "x1.55 Damage to Grineer",
      "+0.6 Punch Through",
      "+90% Status Damage",
    ];
    expect(parseModStats(lines)).toEqual({ effects: [], ignored: lines, assumed: [] });
  });
});
