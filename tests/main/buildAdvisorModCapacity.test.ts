import { describe, expect, it } from "vitest";
import {
  minimumDrain,
  possiblePolarities,
  slotCost,
} from "../../services/buildAdvisor/modCapacity";

const ATTACK = "AP_ATTACK";
const TACTIC = "AP_TACTIC";
const DEFENSE = "AP_DEFENSE";

describe("slotCost", () => {
  // Drains read off the mod cards in three arsenal screenshots, 2026-10-05.
  it("halves a mod on a matching polarity, rounding up, as the arsenal shows", () => {
    expect(slotCost(7, ATTACK, ATTACK)).toBe(4); // Malignant Force, rank 3
    expect(slotCost(14, ATTACK, ATTACK)).toBe(7); // Primed Shred, rank 8
    expect(slotCost(9, DEFENSE, DEFENSE)).toBe(5); // Rifle Elementalist, rank 5
    expect(slotCost(16, ATTACK, ATTACK)).toBe(8); // Galvanized Chamber, rank 10
    expect(slotCost(11, ATTACK, ATTACK)).toBe(6); // Barrel Diffusion, rank 5
    expect(slotCost(6, TACTIC, TACTIC)).toBe(3); // Stabilizer, rank 0
  });

  it("charges the full drain on a slot with no polarity", () => {
    expect(slotCost(9, TACTIC, null)).toBe(9); // Critical Delay, rank 5
    expect(slotCost(16, TACTIC, null)).toBe(16); // Primed Convulsion, rank 10
  });

  it("adds a quarter on the wrong polarity, rounded to nearest", () => {
    // The wiki's Mod page table: a 5-drain mod costs 6.
    expect(slotCost(5, ATTACK, DEFENSE)).toBe(6);
    // Max-rank Semi-Shotgun Cannonade, Tenet screenshot 2026-10-10.
    expect(slotCost(9, DEFENSE, ATTACK)).toBe(11);
  });

  it("treats a universal slot as matching every mod", () => {
    expect(slotCost(9, TACTIC, "AP_ANY")).toBe(5);
  });

  it("does not halve an Umbra mod on a universal slot", () => {
    expect(slotCost(16, "AP_UMBRA", "AP_ANY")).toBe(20);
    expect(slotCost(16, "AP_UMBRA", "AP_UMBRA")).toBe(8);
  });
});

describe("minimumDrain", () => {
  const mod = (drain: number, polarity: string) => ({ drain, polarity });

  it("puts the costliest matching mods on the matching slots", () => {
    // Trumna Prime config A from the screenshot: three attack slots and one
    // defense slot. The best placement is 16->8, 14->7, 9->5 on attack and 9->5
    // on defense, with 7 + 7 + 9 + 7 unhalved: 55. The player's own placement
    // came to 56.
    const mods = [
      mod(7, ATTACK),
      mod(14, ATTACK),
      mod(9, DEFENSE),
      mod(7, ATTACK),
      mod(9, ATTACK),
      mod(16, ATTACK),
      mod(9, TACTIC),
      mod(7, ATTACK),
    ];
    expect(minimumDrain(mods, [DEFENSE, ATTACK, ATTACK, ATTACK])).toBe(55);
  });

  it("matches Lex Prime config A to within the one point the player left", () => {
    // Two attack slots: 14->7 and 12->6, then 16 + 11 + 7 + 7 + 4. The player
    // halved the 11 instead of the 12 and used 59.
    const mods = [
      mod(14, ATTACK),
      mod(16, TACTIC),
      mod(11, ATTACK),
      mod(7, ATTACK),
      mod(12, ATTACK),
      mod(7, ATTACK),
      mod(4, ATTACK),
    ];
    expect(minimumDrain(mods, [ATTACK, ATTACK])).toBe(58);
  });

  it("keeps the big mods off the wrong polarity when a plain slot is free", () => {
    // Two slots, one of them attack: 10 sits on the plain slot, 4 pays 5.
    expect(minimumDrain([mod(10, TACTIC), mod(4, TACTIC)], [ATTACK], 2)).toBe(15);
  });

  it("pays the mismatch when every slot is the wrong polarity", () => {
    // 10 costs 13 (12.5 rounds up) and 4 costs 5.
    expect(minimumDrain([mod(10, TACTIC), mod(4, TACTIC)], [ATTACK, ATTACK], 2)).toBe(18);
  });

  it("cannot place more mods than there are slots", () => {
    expect(minimumDrain([mod(1, ATTACK), mod(1, ATTACK)], [], 1)).toBe(Infinity);
  });

  it("reserves a restricted match when another mod can use either polarity", () => {
    expect(minimumDrain([mod(2, "AP_ANY"), mod(2, ATTACK)], [ATTACK, TACTIC], 2)).toBe(2);
  });

  it("agrees with exhaustive slot assignments, including partial and universal layouts", () => {
    const brute = (
      mods: readonly { drain: number; polarity: string }[],
      slots: readonly (string | null)[],
    ): number => {
      if (!mods.length) return 0;
      return Math.min(
        ...slots.map(
          (slot, index) =>
            slotCost(mods[0].drain, mods[0].polarity, slot) +
            brute(
              mods.slice(1),
              slots.filter((_, other) => other !== index),
            ),
        ),
      );
    };
    const polarities = [ATTACK, TACTIC, "AP_UMBRA", "AP_ANY", null];
    for (const first of polarities) {
      for (const second of polarities) {
        for (const third of polarities) {
          const slots = [first, second, third];
          for (const drain of [2, 3, 6, 7]) {
            const mods = [mod(drain, ATTACK), mod(7, "AP_UMBRA"), mod(4, TACTIC)];
            for (const count of [1, 2, 3]) {
              expect(minimumDrain(mods.slice(0, count), slots, 3)).toBe(
                brute(mods.slice(0, count), slots),
              );
            }
          }
        }
      }
    }
  });
});

describe("possiblePolarities", () => {
  it("includes replacement and addition instead of assuming every Forma adds a slot", () => {
    const layouts = possiblePolarities([ATTACK], [TACTIC], 2);
    expect(layouts).toHaveLength(2);
    expect(layouts).toContainEqual([ATTACK, TACTIC]);
    expect(layouts).toContainEqual([TACTIC, null]);
  });

  it("cannot retain an innate polarity when every slot has an override", () => {
    expect(possiblePolarities([ATTACK], [TACTIC, null], 2)).toEqual([[TACTIC, null]]);
  });

  it("deduplicates identical layouts and preserves known innate slots without overrides", () => {
    expect(possiblePolarities([ATTACK, ATTACK], [], 3)).toEqual([[ATTACK, ATTACK, null]]);
    expect(possiblePolarities([ATTACK, ATTACK], [TACTIC], 3)).toHaveLength(2);
  });
});
