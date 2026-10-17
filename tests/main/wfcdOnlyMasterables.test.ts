import { beforeAll, describe, expect, it } from "vitest";

import * as itemDb from "../../services/itemDatabase";
import { computeMasteryProgress, getAllMasterableItems } from "../../services/masteryHelper";

// Missing from warframe-public-export-plus (through 0.6.12); only @wfcd/items has it,
// under its own "Arch-Melee" category.
const CORUFELL_PRIME =
  "/Lotus/Weapons/Tenno/Archwing/Melee/PrimeCorufell/PrimeCorufellScytheWeapon";
const CORUFELL_PRIME_HANDLE = "/Lotus/Types/Recipes/Weapons/WeaponParts/CorufellPrimeHandle";

describe("masterable items only @wfcd/items knows", () => {
  beforeAll(() => {
    itemDb.buildDatabase();
  });

  it("lists Corufell Prime as an Archwing item", () => {
    const entry = getAllMasterableItems().find((item) => item.uniqueName === CORUFELL_PRIME);
    expect(entry?.name).toBe("Corufell Prime");
    expect(entry?.category).toBe("Archwing");
    expect(entry?.isPrime).toBe(true);
  });

  it("credits its mastery from XPInfo", () => {
    const { items } = computeMasteryProgress({
      XPInfo: [{ ItemType: CORUFELL_PRIME, XP: 2_924_608 }],
    });
    expect(items.find((item) => item.uniqueName === CORUFELL_PRIME)?.status).toBe("mastered");
  });

  it("keeps the handle's Baro value", () => {
    expect(itemDb.lookupItem(CORUFELL_PRIME_HANDLE)?.ducats).toBe(45);
  });
});
