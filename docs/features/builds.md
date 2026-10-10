---
title: Builds
summary: Suggested gun builds from owned mods, saved-config comparisons, and estimated target damage.
group: Features
order: 3
version: "Development beta"
view: builds
screenshot: docs-builds.png
screenshotAlt: WFHelper Builds showing Lex Prime, recommended owned mods, a conservative capacity estimate, and saved config A.
screenshotCaption: A beta build recommendation using sample inventory data, with conditional stacks enabled.
---

## Before you start

**Builds is a beta feature on the development branch.** Connect an inventory
source using [Getting started](/docs/getting-started#choose-an-inventory-source).
It needs the guns, mods and arcanes you own. A market sign-in is not required.

The advisor suggests primary and secondary weapon builds. It does not equip
mods, spend resources or change your game inventory.

## Compare a gun

1. Open **Builds** in the sidebar.
2. Search for an owned primary or secondary weapon and select it.
3. Compare **Recommended from owned mods** with your saved configurations in the
   stats table. Mod ranks come from the highest-ranked copies in your inventory.
4. Leave **Target** at **None** for an arsenal comparison. Turn **Stacks up** off
   to remove conditional bonuses from both the recommendation and saved configs.
5. Choose a faction to rank builds using estimated damage against that target.
   Enable **Stacks up** only when comparing with the relevant buffs active.

The recommendation may include an owned Merciless, Deadhead or Dexterity arcane
when the weapon has an unlocked arcane slot. Conditional assumptions and
unmodelled stat lines are listed with the affected mod or arcane.

## Read capacity estimates

**Fit capacity** limits the search using weapon XP, Mastery Rank, catalyst and
polarity data. Turning it off removes the capacity limit, but still requires an
unlocked arcane slot for a recommended arcane.

**Capacity at most** means an inventory polarity change may have replaced an
original polarity. The advisor uses the highest cost across the possible
layouts. Your actual cost can be lower. Place mods on suitable polarities and
check that the resulting elemental combinations match the recommendation.

If weapon XP is missing from an imported inventory, capacity cannot be checked
and the view explains that. Exilus capacity is not reserved. The capacity figure
covers the recommended regular mods only.

## Understand the limits

The search suggests a strong build; it does not guarantee the best possible
combination. Target estimates represent sustained fire on one heavy unit and
include armour and status effects. They omit shields, Overguard, status immunity
and the time needed to build stacks. Test recommendations in the Simulacrum.

Hunter Munitions' critical-hit bleeds are included when a Target is selected,
even with Stacks up off. They do not change the raw Arsenal damage rows.
Companion bonuses such as Tenacious Bond are not included.

Bows, burst, held, charge and duplex weapons use approximate firing rates, which
can affect both damage estimates and the recommended mods. Some weapons combine
direct and radial damage in the table; the view identifies this because the
arsenal shows those attacks separately.

Melee, warframes, companions, kitguns, Incarnon forms, set bonuses, the exilus
slot, most arcanes and some conditional damage effects are not modelled. A gun
without usable base stats is shown as unsupported. Owned Rivens and Kuva, Tenet
and Coda bonus elements are included, but their supported stats and the bonus
percentage should be checked against the game.

## Report a mismatch

Use **Feedback** in the app or open a
[bug report](https://github.com/WFHelper/WFHelper/issues). Include the weapon,
mod ranks, selected Target, Stacks up and Fit capacity settings, expected value
and displayed value. A cropped Upgrade-screen comparison helps. Do not include
session tokens or a full account inventory export.
