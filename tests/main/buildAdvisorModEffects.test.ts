import { describe, expect, it } from "vitest";
import { parseModStats } from "../../services/buildAdvisor/modEffects";

describe("parseModStats", () => {
  it("reads a base damage bonus as a fraction", () => {
    expect(parseModStats(["+165% Damage"])).toEqual({
      effects: [{ stat: "damage", value: 1.65 }],
      ignored: [],
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

  it("ignores conditional and out-of-scope lines instead of guessing", () => {
    const lines = [
      "On Kill:\n+30% Multishot for 20s. Stacks up to 5x.",
      "+110% Damage on first shot in Magazine",
      "x1.55 Damage to Grineer",
      "+0.6 Punch Through",
      "+90% Status Damage",
    ];
    expect(parseModStats(lines)).toEqual({ effects: [], ignored: lines });
  });
});
