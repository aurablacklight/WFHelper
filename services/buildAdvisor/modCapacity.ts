// Mod capacity: what a mod costs in a slot, and the least a set of mods can
// cost on a weapon's polarities. Positions are not modelled; the player is
// assumed to put each mod in the slot that suits it best.

export interface SlottedMod {
  /** Base drain plus rank. */
  drain: number;
  /** DE's polarity tag, such as AP_ATTACK. */
  polarity: string | null;
}

// A slot or mod with one of these matches anything.
const UNIVERSAL: ReadonlySet<string> = new Set(["AP_ANY", "AP_UNIVERSAL"]);

function matches(modPolarity: string | null, slotPolarity: string): boolean {
  if (UNIVERSAL.has(slotPolarity)) return true;
  if (modPolarity === null) return false;
  return modPolarity === slotPolarity || UNIVERSAL.has(modPolarity);
}

/** Capacity one mod uses in one slot. The arsenal halves a match rounding up.
 *  For the wrong polarity the wiki's pages disagree on rounding; its Mod page
 *  table (a 5-drain mod costs 6) is followed here. */
export function slotCost(
  drain: number,
  modPolarity: string | null,
  slotPolarity: string | null,
): number {
  if (slotPolarity === null) return drain;
  return matches(modPolarity, slotPolarity) ? Math.ceil(drain / 2) : Math.round(drain * 1.25);
}

/** The least capacity the mods can use on a weapon with these slot polarities.
 *  Greedy: the costliest mods take matching slots, the next costliest take
 *  plain slots, and the cheapest are left to pay for a wrong polarity. */
export function minimumDrain(
  mods: readonly SlottedMod[],
  slotPolarities: readonly string[],
  slots = 8,
): number {
  if (mods.length > slots) return Infinity;
  const polarised = slotPolarities.slice(0, slots);
  const free = [...polarised];
  let plain = slots - polarised.length;
  let total = 0;

  const unmatched: SlottedMod[] = [];
  for (const mod of [...mods].sort((a, b) => b.drain - a.drain)) {
    // An exact polarity first, so a universal slot is kept for a mod that needs it.
    let at = free.findIndex((slot) => !UNIVERSAL.has(slot) && matches(mod.polarity, slot));
    if (at < 0) at = free.findIndex((slot) => matches(mod.polarity, slot));
    if (at < 0) {
      unmatched.push(mod);
      continue;
    }
    total += slotCost(mod.drain, mod.polarity, free[at]);
    free.splice(at, 1);
  }

  for (const mod of unmatched) {
    if (plain > 0) {
      plain--;
      total += mod.drain;
    } else {
      total += slotCost(mod.drain, mod.polarity, free.pop() ?? null);
    }
  }
  return total;
}
