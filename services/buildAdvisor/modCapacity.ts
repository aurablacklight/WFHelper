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
  if (UNIVERSAL.has(slotPolarity)) return modPolarity !== "AP_UMBRA";
  if (modPolarity === null) return false;
  return modPolarity === slotPolarity || UNIVERSAL.has(modPolarity);
}

/** Capacity one mod uses in one slot. The arsenal halves a match rounding up.
 *  Wrong polarity rounds to nearest: the 2026-10-10 Tenet Arca Plasmor
 *  screenshot shows a 9-drain Cannonade costing 11, not 12. */
export function slotCost(
  drain: number,
  modPolarity: string | null,
  slotPolarity: string | null,
): number {
  if (slotPolarity === null) return drain;
  return matches(modPolarity, slotPolarity) ? Math.ceil(drain / 2) : Math.round(drain * 1.25);
}

/** The least capacity over every placement. Equivalent slots are grouped so
 *  the search visits counts of used polarities rather than slot permutations. */
export function minimumDrain(
  mods: readonly SlottedMod[],
  slotPolarities: readonly (string | null)[],
  slots = 8,
): number {
  if (mods.length > slots) return Infinity;
  const counts = new Map<string | null, number>();
  for (let slot = 0; slot < slots; slot++) {
    const polarity = slotPolarities[slot] ?? null;
    counts.set(polarity, (counts.get(polarity) ?? 0) + 1);
  }
  const groups = [...counts];
  const weights: number[] = [];
  let states = 1;
  for (const [, count] of groups) {
    weights.push(states);
    states *= count + 1;
  }
  const memo = new Float64Array(states).fill(-1);
  const visit = (index: number, state: number): number => {
    if (index === mods.length) return 0;
    if (memo[state] >= 0) return memo[state];
    let best = Infinity;
    for (let group = 0; group < groups.length; group++) {
      const [polarity, count] = groups[group];
      const used = Math.floor(state / weights[group]) % (count + 1);
      if (used === count) continue;
      best = Math.min(
        best,
        slotCost(mods[index].drain, mods[index].polarity, polarity) +
          visit(index + 1, state + weights[group]),
      );
    }
    memo[state] = best;
    return best;
  };
  return visit(0, 0);
}

/** Original slot positions are absent from the bundled data. An override may
 *  replace an innate polarity or a plain slot, so keep every possible multiset.
 *  The caller uses the highest drain to avoid relying on a replaced polarity. */
export function possiblePolarities(
  innate: readonly string[],
  overrides: readonly (string | null)[],
  slots = 8,
): (string | null)[][] {
  const originals = innate.slice(0, slots);
  const changed = overrides.slice(0, slots);
  const layouts = new Map<string, (string | null)[]>();
  for (let mask = 0; mask < 2 ** originals.length; mask++) {
    const kept = originals.filter((_, index) => (mask & (1 << index)) !== 0);
    if (originals.length - kept.length > changed.length) continue;
    if (kept.length + changed.length > slots) continue;
    const layout = [...changed, ...kept];
    while (layout.length < slots) layout.push(null);
    layout.sort();
    layouts.set(JSON.stringify(layout), layout);
  }
  return [...layouts.values()];
}
