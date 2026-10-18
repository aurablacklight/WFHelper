import { beforeAll, describe, expect, it } from "vitest";

import * as itemDb from "../../services/itemDatabase";
import {
  isRivenWeaponKind,
  isSuitKind,
  settleItemKind,
  weaponSlotOf,
  type ItemKindFields,
} from "../../config/shared/itemKind";

type Expected = [name: string, uniqueName: string, fields: ItemKindFields];

const PART = { kindPart: true } as const;
const MODULAR = { modularPart: true } as const;

// Both sources: DE's export (pep) and items only @wfcd/items has (wfcd).
const SETTLED: Expected[] = [
  ["Excalibur", "/Lotus/Powersuits/Excalibur/Excalibur", { kind: "warframe" }],
  ["Citrine Prime (wfcd)", "/Lotus/Powersuits/Geode/CitrinePrime", { kind: "warframe" }],
  [
    "Citrine Prime Chassis Blueprint (wfcd)",
    "/Lotus/Types/Recipes/WarframeRecipes/CitrinePrimeChassisComponent",
    { kind: "warframe", ...PART },
  ],
  ["Braton", "/Lotus/Weapons/Tenno/Rifle/Rifle", { kind: "primary" }],
  [
    "Braton Blueprint",
    "/Lotus/Types/Recipes/Weapons/BratonBlueprint",
    { kind: "primary", ...PART },
  ],
  [
    "Klamora Prism Blueprint",
    "/Lotus/Weapons/Corpus/OperatorAmplifiers/Set1/Barrel/CorpAmpSet1BarrelPartCBlueprint",
    { kind: "amp", ...PART, ...MODULAR },
  ],
  [
    "Braton Prime Barrel",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/BratonPrimeBarrel",
    { kind: "primary", ...PART },
  ],
  [
    "Steflos Prime (wfcd)",
    "/Lotus/Weapons/Tenno/LongGuns/PrimeSteflos/PrimeSteflosShotgun",
    { kind: "primary" },
  ],
  [
    "Steflos Prime Barrel (wfcd)",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/SteflosPrimeBarrel",
    { kind: "primary", ...PART },
  ],
  ["Lex", "/Lotus/Weapons/Tenno/Pistol/HeavyPistol", { kind: "secondary" }],
  ["Skana", "/Lotus/Weapons/Tenno/Melee/LongSword/LongSword", { kind: "melee" }],
  ["Odonata Prime", "/Lotus/Powersuits/Archwing/PrimeJetPack/PrimeJetPack", { kind: "archwing" }],
  [
    "Odonata Prime Wings Blueprint",
    "/Lotus/Types/Recipes/ArchwingRecipes/PrimeArchwing/PrimeArchwingWingsBlueprint",
    { kind: "archwing", ...PART },
  ],
  [
    "Imperator",
    "/Lotus/Weapons/Tenno/Archwing/Primary/FoldingMachineGun/ArchMachineGun",
    { kind: "arch-gun" },
  ],
  [
    "Veritux",
    "/Lotus/Weapons/Tenno/Archwing/Melee/Archsword/ArchSwordWeapon",
    { kind: "arch-melee" },
  ],
  [
    "Corufell Prime (wfcd)",
    "/Lotus/Weapons/Tenno/Archwing/Melee/PrimeCorufell/PrimeCorufellScytheWeapon",
    { kind: "arch-melee" },
  ],
  [
    "Corufell Prime Handle (wfcd)",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/CorufellPrimeHandle",
    { kind: "arch-melee", ...PART },
  ],
  [
    "Carrier Prime",
    "/Lotus/Types/Sentinels/SentinelPowersuits/PrimeCarrierPowerSuit",
    { kind: "companion" },
  ],
  [
    "Carrier Prime Cerebrum",
    "/Lotus/Types/Recipes/Weapons/WeaponParts/PrimeCarrierCerebrum",
    { kind: "companion", ...PART },
  ],
  [
    "Deconstructor",
    "/Lotus/Types/Sentinels/SentinelWeapons/SentGlaiveWeapon",
    { kind: "companion-weapon" },
  ],
  [
    "Smeeta Kavat",
    "/Lotus/Types/Game/CatbrowPet/CheshireCatbrowPetPowerSuit",
    { kind: "companion" },
  ],
  ["Venari", "/Lotus/Powersuits/Khora/Kavat/KhoraKavatPowerSuit", { kind: "companion" }],
  [
    "Bhaira Hound",
    "/Lotus/Types/Friendly/Pets/ZanukaPets/ZanukaPetParts/ZanukaPetPartHeadB",
    { kind: "companion" },
  ],
  [
    "Lambeo Moa",
    "/Lotus/Types/Friendly/Pets/MoaPets/MoaPetParts/MoaPetHeadLambeo",
    { kind: "companion", ...MODULAR },
  ],
  [
    "Catchmoon",
    "/Lotus/Weapons/SolarisUnited/Secondary/SUModularSecondarySet1/Barrel/SUModularSecondaryBarrelAPart",
    { kind: "secondary", ...MODULAR },
  ],
  [
    "Sporelacer",
    "/Lotus/Weapons/Infested/Pistols/InfKitGun/Barrels/InfBarrelEgg/InfModularBarrelEggPart",
    { kind: "secondary", ...MODULAR },
  ],
  ["Balla", "/Lotus/Weapons/Ostron/Melee/ModularMelee01/Tip/TipOne", { kind: "melee", ...MODULAR }],
  [
    "Klamora Prism",
    "/Lotus/Weapons/Corpus/OperatorAmplifiers/Set1/Barrel/CorpAmpSet1BarrelPartC",
    { kind: "amp", ...MODULAR },
  ],
  [
    "Bad Baby",
    "/Lotus/Types/Vehicles/Hoverboard/HoverboardParts/PartComponents/HoverboardSolarisA/HoverboardSolarisADeck",
    { kind: "k-drive", ...MODULAR },
  ],
  [
    "Sirocco",
    "/Lotus/Weapons/Operator/Pistols/DrifterPistol/DrifterPistolPlayerWeapon",
    { kind: "amp" },
  ],
  ["Voidrig", "/Lotus/Powersuits/EntratiMech/NechroTech", { kind: "necramech" }],
  [
    "Felarx (incarnon)",
    "/Lotus/Weapons/Tenno/Zariman/LongGuns/PumpShotgun/ZarimanPumpShotgun",
    { kind: "primary" },
  ],
  [
    "Braton Incarnon Genesis",
    "/Lotus/Types/Items/MiscItems/IncarnonAdapters/Primary/BratonIncarnonUnlocker",
    {},
  ],
];

function kindFields(entry: ItemKindFields | null): ItemKindFields {
  if (!entry) return {};
  return {
    ...(entry.kind ? { kind: entry.kind } : {}),
    ...(entry.kindPart ? { kindPart: entry.kindPart } : {}),
    ...(entry.modularPart ? { modularPart: entry.modularPart } : {}),
  };
}

describe("item database settles one kind per entry", () => {
  beforeAll(() => {
    itemDb.buildDatabase();
  });

  it.each(SETTLED)("%s", (_name, uniqueName, expected) => {
    const entry = itemDb.lookupItem(uniqueName);
    expect(entry, "item database entry").toBeTruthy();
    expect(kindFields(entry)).toEqual(expected);
  });

  it("hands the kind to the renderer projection", () => {
    const lookup = itemDb.getRendererLookup();
    expect(kindFields(lookup["/Lotus/Weapons/Tenno/Rifle/Rifle"])).toEqual({ kind: "primary" });
    expect(
      kindFields(lookup["/Lotus/Types/Recipes/Weapons/WeaponParts/CorufellPrimeHandle"]),
    ).toEqual({ kind: "arch-melee", kindPart: true });
  });

  it("files a wfcd-only archwing part under the export's archwing product", () => {
    const handle = itemDb.lookupItem(
      "/Lotus/Types/Recipes/Weapons/WeaponParts/CorufellPrimeHandle",
    );
    expect(handle?.productCategory).toBe("SpaceMelee");
  });
});

describe("kind queries", () => {
  it("gives a weapon slot to normal weapons only", () => {
    expect(weaponSlotOf({ kind: "secondary" })).toBe("secondary");
    expect(weaponSlotOf({ kind: "secondary", modularPart: true })).toBeUndefined();
    expect(weaponSlotOf({ kind: "arch-melee" })).toBeUndefined();
    expect(weaponSlotOf({ kind: "companion-weapon" })).toBeUndefined();
    expect(weaponSlotOf(undefined)).toBeUndefined();
  });

  it("ranks suits at the suit rate and companion weapons at the weapon rate", () => {
    expect(isSuitKind("warframe")).toBe(true);
    expect(isSuitKind("companion")).toBe(true);
    expect(isSuitKind("companion-weapon")).toBe(false);
    expect(isSuitKind("arch-gun")).toBe(false);
  });

  it("counts kitgun chambers and companion weapons as riven weapons, not amps", () => {
    expect(isRivenWeaponKind("secondary")).toBe(true);
    expect(isRivenWeaponKind("companion-weapon")).toBe(true);
    expect(isRivenWeaponKind("amp")).toBe(false);
    expect(isRivenWeaponKind("k-drive")).toBe(false);
  });

  it("does not trust the modular Pistols label", () => {
    const pistolsPart = (uniqueName: string) =>
      settleItemKind(uniqueName, { category: "Weapon", productCategory: "Pistols" });
    expect(
      pistolsPart(
        "/Lotus/Weapons/SolarisUnited/Primary/SUModularPrimarySet1/Barrel/SUModularPrimaryBarrelAPart",
      ),
    ).toEqual({ kind: "primary", modularPart: true });
    expect(
      pistolsPart("/Lotus/Types/Friendly/Pets/CreaturePets/CreaturePetParts/InfestedCritterHead"),
    ).toEqual({ kind: "companion" });
  });

  it("files a loose pet part with no parent link as a companion part", () => {
    expect(
      settleItemKind("/Lotus/Types/Friendly/Pets/CreaturePets/CreaturePetParts/Mutagen", {
        category: "Resource",
        productCategory: "Pistols",
      }),
    ).toEqual({ kind: "companion", kindPart: true });
  });
});
