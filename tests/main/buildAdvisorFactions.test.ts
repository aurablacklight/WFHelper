import { describe, expect, it } from "vitest";
import { ADVISOR_FACTIONS } from "../../config/shared/buildAdvisorTypes";
import { factionDamageMultiplier, factionModifiers } from "../../services/buildAdvisor/factions";

describe("faction damage modifiers", () => {
  // Rows from the wiki's Damage overview table, read 2026-10-05.
  it("has the wiki's weaknesses and resistances", () => {
    expect(factionModifiers("grineer")).toEqual({ impact: 1.5, corrosive: 1.5 });
    expect(factionModifiers("corpus")).toEqual({ puncture: 1.5, magnetic: 1.5 });
    expect(factionModifiers("infested")).toEqual({ slash: 1.5, heat: 1.5 });
    expect(factionModifiers("corrupted")).toEqual({ puncture: 1.5, viral: 1.5, radiation: 0.5 });
    expect(factionModifiers("murmur")).toEqual({ electricity: 1.5, radiation: 1.5, viral: 0.5 });
    expect(factionModifiers("techrot")).toEqual({ gas: 1.5, magnetic: 1.5, cold: 0.5 });
  });

  it("only ever makes a type worth one and a half or half", () => {
    for (const faction of ADVISOR_FACTIONS) {
      const values = Object.values(factionModifiers(faction));
      expect(values.length).toBeGreaterThan(0);
      for (const value of values) expect([0.5, 1.5]).toContain(value);
    }
  });
});

describe("factionDamageMultiplier", () => {
  it("weights each damage type by its share of the hit", () => {
    // 10 impact and 30 corrosive are both weak spots for Grineer.
    expect(factionDamageMultiplier({ impact: 10, corrosive: 30 }, "grineer")).toBeCloseTo(1.5, 6);
    // 50 at x1.5 and 50 at x0.5 cancel out against Corrupted.
    expect(factionDamageMultiplier({ puncture: 50, radiation: 50 }, "corrupted")).toBeCloseTo(1, 6);
    // 25 slash at x1.5 and 75 neutral cold: 112.5 of 100.
    expect(factionDamageMultiplier({ slash: 25, cold: 75 }, "infested")).toBeCloseTo(1.125, 6);
  });

  it("is neutral for a hit with no damage", () => {
    expect(factionDamageMultiplier({}, "grineer")).toBe(1);
  });
});
