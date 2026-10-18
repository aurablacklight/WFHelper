// Item kind: the one gear vocabulary the item database settles for every entry.
// DE's export and @wfcd/items name categories differently ("Weapon" + "LongGuns"
// against "Primary"), so consumers ask about kind instead of reading either.

export type ItemKind =
  | "warframe"
  | "primary"
  | "secondary"
  | "melee"
  | "archwing"
  | "arch-gun"
  | "arch-melee"
  | "companion"
  | "companion-weapon"
  | "amp"
  | "necramech"
  | "k-drive"
  | "railjack"
  | "gear"
  | "cosmetic";

/** Fields the item database stamps on an entry. All absent on non-gear items. */
export interface ItemKindFields {
  kind?: ItemKind;
  /** A component, blueprint or crafting part of `kind` gear, not the gear itself. */
  kindPart?: true;
  /** A modular build part (kitgun, zaw, amp, K-Drive, Moa) or a part of one. */
  modularPart?: true;
}

/** The raw facts an entry's kind is settled from. */
interface ItemKindSource {
  category?: string | null;
  productCategory?: string | null;
  type?: string | null;
}

export type WeaponSlot = "primary" | "secondary" | "melee";

const EQUIPMENT_KINDS: ReadonlySet<ItemKind> = new Set<ItemKind>([
  "warframe",
  "primary",
  "secondary",
  "melee",
  "archwing",
  "arch-gun",
  "arch-melee",
  "companion",
  "companion-weapon",
  "amp",
  "necramech",
  "k-drive",
  "railjack",
]);

// Suits rank at twice the weapon rate: frames, archwings, mechs, companion
// bodies and K-Drives.
const SUIT_KINDS: ReadonlySet<ItemKind> = new Set<ItemKind>([
  "warframe",
  "archwing",
  "necramech",
  "companion",
  "k-drive",
]);

const RIVEN_WEAPON_KINDS: ReadonlySet<ItemKind> = new Set<ItemKind>([
  "primary",
  "secondary",
  "melee",
  "arch-gun",
  "arch-melee",
  "companion-weapon",
]);

/** Built gear the arsenal equips, as opposed to resources, cosmetics and gear items. */
export function isEquipmentKind(kind: ItemKind | null | undefined): kind is ItemKind {
  return kind != null && EQUIPMENT_KINDS.has(kind);
}

export function isSuitKind(kind: ItemKind | null | undefined): boolean {
  return kind != null && SUIT_KINDS.has(kind);
}

/** A weapon a riven can roll for. Kitgun chambers and zaw strikes count. */
export function isRivenWeaponKind(kind: ItemKind | null | undefined): boolean {
  return kind != null && RIVEN_WEAPON_KINDS.has(kind);
}

/** Primary, secondary or melee for a normal weapon; modular parts have no slot. */
export function weaponSlotOf(entry: ItemKindFields | null | undefined): WeaponSlot | undefined {
  if (!entry || entry.modularPart) return undefined;
  const kind = entry.kind;
  return kind === "primary" || kind === "secondary" || kind === "melee" ? kind : undefined;
}

// DE exports every modular part with productCategory "Pistols" (amp prisms,
// kitgun chambers, zaw strikes, K-Drive decks, Moa heads). Kitgun and zaw paths
// carry no "kitguns"/"zaws" segment, only the SUModular/InfKitGun/ModularMelee ones.
const MODULAR_PART_PATH =
  /\/(?:kdrives|zaws|kitguns|hoverboard|moapets|operatoramplifiers?)\/|\/(?:infkitgun|modularmelee|sumodular)[a-z0-9]*\//i;

// Pet and sentinel parts hit the same "Pistols" export trap.
const PET_PART_PATH = /\/(?:pets|zanukapets|creaturepets|catbrowpets|kubrowpets|sentinels)\//i;

const AMP_PATH = /\/OperatorAmplifiers?\//i;
const ZAW_STRIKE_PATH = /\/Ostron\/Melee\/ModularMelee/i;
const ARCHWING_WEAPON_PATH = /\/Weapons\/Tenno\/Archwing\/(Primary|Melee)\//i;

export function isModularPartPath(path: string): boolean {
  return MODULAR_PART_PATH.test(path);
}

export function isPetPartPath(path: string): boolean {
  return PET_PART_PATH.test(path);
}

const KIND_BY_PRODUCT: Readonly<Record<string, ItemKind>> = {
  Suits: "warframe",
  LongGuns: "primary",
  Pistols: "secondary",
  Melee: "melee",
  Sentinels: "companion",
  KubrowPets: "companion",
  SentinelWeapons: "companion-weapon",
  SpaceSuits: "archwing",
  SpaceGuns: "arch-gun",
  SpaceMelee: "arch-melee",
  OperatorAmps: "amp",
  MechSuits: "necramech",
  CrewShipWeapons: "railjack",
};

// Fallback when productCategory is missing or is the modular "Pistols" trap.
const KIND_BY_PATH: ReadonlyArray<{ pattern: RegExp; kind: ItemKind }> = [
  { pattern: /\/OperatorAmps?\//i, kind: "amp" },
  { pattern: /\/Sentinels\/.*Weapons?\//i, kind: "companion-weapon" },
  { pattern: /\/Sentinels?\//i, kind: "companion" },
  { pattern: /\/SpaceSuits?\//i, kind: "archwing" },
  { pattern: /\/SpaceGuns?\//i, kind: "arch-gun" },
  { pattern: /\/SpaceMelee\//i, kind: "arch-melee" },
  { pattern: /\/MechSuits?\//i, kind: "necramech" },
  { pattern: /\/CrewShip.*Weapons?\//i, kind: "railjack" },
  { pattern: /\/Suits\//i, kind: "warframe" },
  { pattern: /\/ModularMelee\b|\/Ostron.*Melee|\/Zaw/i, kind: "melee" },
  { pattern: /\/ModularPistol|\/SolarisUnited.*Secondary|\/Kitgun.*Pistol/i, kind: "secondary" },
  { pattern: /\/ModularPrimary|\/SolarisUnited.*Primary|\/Kitgun.*Rifle/i, kind: "primary" },
  { pattern: /\/LongGuns\//i, kind: "primary" },
  { pattern: /\/Pistols\//i, kind: "secondary" },
  { pattern: /\/Melee\//i, kind: "melee" },
];

// Both sources' category names for gear. DE's are by export table, @wfcd's by slot.
const KIND_BY_CATEGORY: Readonly<Record<string, ItemKind | null>> = {
  Warframe: "warframe",
  Weapon: null,
  Companion: "companion",
  Railjack: "railjack",
  Warframes: "warframe",
  Primary: "primary",
  Secondary: "secondary",
  Melee: "melee",
  Companions: "companion",
  Sentinels: "companion",
  Pets: "companion",
  Archwing: "archwing",
  "Arch-Gun": "arch-gun",
  "Arch-Melee": "arch-melee",
};

const NON_EQUIPMENT_KIND_BY_CATEGORY: Readonly<Record<string, ItemKind>> = {
  Gear: "gear",
  Cosmetic: "cosmetic",
};

function equipmentKind(uniqueName: string, source: ItemKindSource): ItemKind | undefined {
  const type = String(source.type || "");
  // K-Drive boards and pets are exported as Weapon/Pistols.
  if (/\/Hoverboard\//i.test(uniqueName) || /k-drive/i.test(type)) return "k-drive";
  if (/\/Pets?\//i.test(uniqueName) || /\bpets?\b/i.test(type)) {
    return source.productCategory === "SentinelWeapons" ? "companion-weapon" : "companion";
  }
  if (AMP_PATH.test(uniqueName)) return "amp";
  if (ZAW_STRIKE_PATH.test(uniqueName)) return "melee";
  // DE exports Corufell as plain "Melee"; its path says Archwing.
  const archwingWeapon = ARCHWING_WEAPON_PATH.exec(uniqueName);
  if (archwingWeapon)
    return archwingWeapon[1].toLowerCase() === "melee" ? "arch-melee" : "arch-gun";

  const product = source.productCategory ? KIND_BY_PRODUCT[source.productCategory] : undefined;
  const pistolsTrap = product === "secondary" && isModularPartPath(uniqueName);
  if (product && !pistolsTrap) return product;

  for (const { pattern, kind } of KIND_BY_PATH) {
    if (pattern.test(uniqueName)) return kind;
  }
  if (product) return product;
  return KIND_BY_CATEGORY[String(source.category || "")] ?? undefined;
}

/** True when the raw category names arsenal gear in either source's vocabulary. */
function isEquipmentCategory(category: string | null | undefined): boolean {
  return category != null && category in KIND_BY_CATEGORY;
}

/**
 * Settles one entry's kind. `inherited` is the kind of the gear it is a part of
 * or builds, already settled; parts take it over whole.
 */
export function settleItemKind(
  uniqueName: string,
  source: ItemKindSource,
  inherited?: ItemKindFields | null,
): ItemKindFields {
  const modular = isModularPartPath(uniqueName) || inherited?.modularPart === true;
  const flags: ItemKindFields = modular ? { modularPart: true } : {};

  if (inherited?.kind) return { kind: inherited.kind, kindPart: true, ...flags };

  if (isEquipmentCategory(source.category)) {
    const kind = equipmentKind(uniqueName, source);
    return kind ? { kind, ...flags } : flags;
  }

  const nonEquipment = NON_EQUIPMENT_KIND_BY_CATEGORY[String(source.category || "")];
  if (nonEquipment) return { kind: nonEquipment, ...flags };

  // Loose crafting parts with no parent link still sit under their gear's path.
  if (AMP_PATH.test(uniqueName)) return { kind: "amp", kindPart: true, ...flags };
  if (isPetPartPath(uniqueName)) return { kind: "companion", kindPart: true, ...flags };
  return flags;
}
