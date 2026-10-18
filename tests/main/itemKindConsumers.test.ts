import { beforeAll, describe, expect, it } from "vitest";

import * as itemDb from "../../services/itemDatabase";
import { computeMasteryProgress, getAllMasterableItems } from "../../services/masteryHelper";
import { classifyForFoundry } from "../../src/lib/inventory/foundryResources";
import { inferCategory } from "../../src/lib/inventory/itemClassification";
import type { ItemDbEntry } from "../../src/types/inventory";

// Every gear consumer's answer for one item, read off the built database. Rows
// cover both sources: DE's export (pep) and items only @wfcd/items has (wfcd).
interface Row {
  name: string;
  uniqueName: string;
  /** Mastery list category, null when the item is not on the list. */
  mastery: string | null;
  foundry: string;
  /** Inventory category for an entry that arrived in a "default" collection. */
  inventory: string;
  /** Mastery credited for 1,000,000 XP in XPInfo, null when not masterable. */
  xpCredit: number | null;
}

const ROWS: Row[] = [
  // Warframes
  row(
    "Excalibur",
    "/Lotus/Powersuits/Excalibur/Excalibur",
    "Warframes",
    "Warframe",
    "warframes",
    6000,
  ),
  row(
    "Excalibur Prime",
    "/Lotus/Powersuits/Excalibur/ExcaliburPrime",
    "Warframes",
    "Warframe",
    "warframes",
    6000,
  ),
  row(
    "Citrine Prime (wfcd)",
    "/Lotus/Powersuits/Geode/CitrinePrime",
    "Warframes",
    "Warframe",
    "warframes",
    3000,
  ),
  row(
    "Citrine Prime Chassis Blueprint (wfcd)",
    "/Lotus/Types/Recipes/WarframeRecipes/CitrinePrimeChassisComponent",
    null,
    "Warframe",
    "warframes",
    null,
  ),
  // Weapons
  row("Braton", "/Lotus/Weapons/Tenno/Rifle/Rifle", "Primary", "Primary", "primary", 3000),
  row(
    "Felarx",
    "/Lotus/Weapons/Tenno/Zariman/LongGuns/PumpShotgun/ZarimanPumpShotgun",
    "Primary",
    "Primary",
    "primary",
    3000,
  ),
  row(
    "Braton Prime Barrel",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/BratonPrimeBarrel",
    null,
    "Primary",
    "default",
    null,
  ),
  row(
    "Steflos Prime (wfcd)",
    "/Lotus/Weapons/Tenno/LongGuns/PrimeSteflos/PrimeSteflosShotgun",
    "Primary",
    "Primary",
    "primary",
    3000,
  ),
  row(
    "Steflos Prime Barrel (wfcd)",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/SteflosPrimeBarrel",
    null,
    "Primary",
    "primary",
    null,
  ),
  row(
    "Lex",
    "/Lotus/Weapons/Tenno/Pistol/HeavyPistol",
    "Secondary",
    "Secondary",
    "secondary",
    3000,
  ),
  row(
    "Laetum",
    "/Lotus/Weapons/Tenno/Zariman/Pistols/HeavyPistol/ZarimanHeavyPistol",
    "Secondary",
    "Secondary",
    "secondary",
    3000,
  ),
  row("Skana", "/Lotus/Weapons/Tenno/Melee/LongSword/LongSword", "Melee", "Melee", "melee", 3000),
  // Archwing
  row(
    "Odonata Prime",
    "/Lotus/Powersuits/Archwing/PrimeJetPack/PrimeJetPack",
    "Archwing",
    "Archwing",
    "archwing",
    6000,
  ),
  row(
    "Odonata Prime Wings Blueprint",
    "/Lotus/Types/Recipes/ArchwingRecipes/PrimeArchwing/PrimeArchwingWingsBlueprint",
    null,
    "Archwing",
    "default",
    null,
  ),
  row(
    "Imperator",
    "/Lotus/Weapons/Tenno/Archwing/Primary/FoldingMachineGun/ArchMachineGun",
    "Archwing",
    "Archwing",
    "archwing",
    3000,
  ),
  row(
    "Veritux",
    "/Lotus/Weapons/Tenno/Archwing/Melee/Archsword/ArchSwordWeapon",
    "Archwing",
    "Archwing",
    "archwing",
    3000,
  ),
  row(
    "Mausolon",
    "/Lotus/Weapons/Tenno/Archwing/Primary/ThanoTechArchLongGun/ThanoTechLongGun",
    "Archwing",
    "Archwing",
    "archwing",
    3000,
  ),
  row(
    "Corufell Prime (wfcd)",
    "/Lotus/Weapons/Tenno/Archwing/Melee/PrimeCorufell/PrimeCorufellScytheWeapon",
    "Archwing",
    "Archwing",
    "archwing",
    3000,
  ),
  row(
    "Corufell Prime Handle (wfcd)",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/CorufellPrimeHandle",
    null,
    "Archwing",
    "melee",
    null,
  ),
  // Companions
  row(
    "Carrier Prime",
    "/Lotus/Types/Sentinels/SentinelPowersuits/PrimeCarrierPowerSuit",
    "Companions",
    "Companion",
    "companions",
    6000,
  ),
  row(
    "Carrier Prime Cerebrum",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/PrimeCarrierCerebrum",
    null,
    "Companion",
    "default",
    null,
  ),
  row(
    "Deconstructor",
    "/Lotus/Types/Sentinels/SentinelWeapons/SentGlaiveWeapon",
    "Companions",
    "Companion",
    "companions",
    3000,
  ),
  row(
    "Smeeta Kavat",
    "/Lotus/Types/Game/CatbrowPet/CheshireCatbrowPetPowerSuit",
    "Companions",
    "Companion",
    "default",
    6000,
  ),
  row(
    "Venari",
    "/Lotus/Powersuits/Khora/Kavat/KhoraKavatPowerSuit",
    "Companions",
    "Warframe",
    "default",
    6000,
  ),
  row(
    "Bhaira Hound",
    "/Lotus/Types/Friendly/Pets/ZanukaPets/ZanukaPetParts/ZanukaPetPartHeadB",
    "Companions",
    "Companion",
    "default",
    6000,
  ),
  // Modular gear: DE exports every part as productCategory "Pistols".
  row(
    "Lambeo Moa",
    "/Lotus/Types/Friendly/Pets/MoaPets/MoaPetParts/MoaPetHeadLambeo",
    "Companions",
    "Modular",
    "default",
    6000,
  ),
  row(
    "Catchmoon",
    "/Lotus/Weapons/SolarisUnited/Secondary/SUModularSecondarySet1/Barrel/SUModularSecondaryBarrelAPart",
    "Secondary",
    "Modular",
    "default",
    3000,
  ),
  row(
    "Balla",
    "/Lotus/Weapons/Ostron/Melee/ModularMelee01/Tip/TipOne",
    "Melee",
    "Modular",
    "default",
    3000,
  ),
  row(
    "Klamora Prism",
    "/Lotus/Weapons/Corpus/OperatorAmplifiers/Set1/Barrel/CorpAmpSet1BarrelPartC",
    "Amps",
    "Modular",
    "amps",
    3000,
  ),
  row(
    "Mote Prism",
    "/Lotus/Weapons/Sentients/OperatorAmplifiers/SentTrainingAmplifier/SentAmpTrainingBarrel",
    "Amps",
    "Modular",
    "amps",
    3000,
  ),
  row(
    "Bad Baby",
    "/Lotus/Types/Vehicles/Hoverboard/HoverboardParts/PartComponents/HoverboardSolarisA/HoverboardSolarisADeck",
    "Misc",
    "Modular",
    "default",
    6000,
  ),
  // Amps, Necramechs, non-gear
  row(
    "Sirocco",
    "/Lotus/Weapons/Operator/Pistols/DrifterPistol/DrifterPistolPlayerWeapon",
    "Amps",
    "Misc",
    "amps",
    3000,
  ),
  row(
    "Voidrig",
    "/Lotus/Powersuits/EntratiMech/NechroTech",
    "Necramech",
    "Warframe",
    "necramech",
    6200,
  ),
  row(
    "Bonewidow",
    "/Lotus/Powersuits/EntratiMech/ThanoTech",
    "Necramech",
    "Warframe",
    "necramech",
    6200,
  ),
  row(
    "Braton Incarnon Genesis",
    "/Lotus/Types/Items/MiscItems/IncarnonAdapters/Primary/BratonIncarnonUnlocker",
    null,
    "Misc",
    "default",
    null,
  ),
];

function row(
  name: string,
  uniqueName: string,
  mastery: string | null,
  foundry: string,
  inventory: string,
  xpCredit: number | null,
): Row {
  return { name, uniqueName, mastery, foundry, inventory, xpCredit };
}

describe("gear consumers agree on every item's kind", () => {
  let lookup: Record<string, ItemDbEntry> = {};
  let mastery = new Map<string, string>();
  let credit = new Map<string, number>();

  beforeAll(() => {
    itemDb.buildDatabase();
    lookup = itemDb.getRendererLookup() as unknown as Record<string, ItemDbEntry>;
    mastery = new Map(getAllMasterableItems().map((item) => [item.uniqueName, item.category]));
    const { items } = computeMasteryProgress({
      XPInfo: ROWS.map((r) => ({ ItemType: r.uniqueName, XP: 1_000_000 })),
    });
    credit = new Map(items.map((item) => [item.uniqueName, item.masteryXp]));
  });

  it.each(ROWS)("$name", (r) => {
    const entry = lookup[r.uniqueName];
    expect(entry, "item database entry").toBeTruthy();
    const blueprint = entry.recipe?.blueprintUniqueName ?? `${r.uniqueName}Blueprint`;
    expect({
      mastery: mastery.get(r.uniqueName) ?? null,
      foundry: classifyForFoundry(r.uniqueName, blueprint, lookup),
      inventory: inferCategory(r.uniqueName, "default", entry),
      xpCredit: credit.get(r.uniqueName) ?? null,
    }).toEqual({
      mastery: r.mastery,
      foundry: r.foundry,
      inventory: r.inventory,
      xpCredit: r.xpCredit,
    });
  });
});
