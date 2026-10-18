# Context

Domain terms for this repository. A glossary only: no implementation detail.

## Inventory pricing

- **Row price state**: what one inventory row knows about its market data, one
  field at a time: its price, the rank-0 and max-rank price pair, the order
  summary pair, ducats and the icon.
- **Field status**: how a row came to hold a field's value. One of not tried,
  fetched, no data (the market confirmed there is none) or failed (a transient
  error, retried after a cooldown). Each carries when it was decided.
- **Intent**: what a caller wants for a row: which fields, and whether the row
  is visible (may fetch) or in the background (snapshot caches only).
- **Fetch plan**: the fields a row still needs to fetch for an intent. The only
  place a skip-or-fetch decision is made.

## Build advisor

- **Build**: the set of mods equipped on one weapon, in slot order.
- **Saved config**: one of a weapon's lettered mod layouts (A, B, C) as stored in
  the inventory.
- **Owned mod**: a mod the inventory holds, at the highest rank held. An unranked
  stack counts as rank 0.
- **Mod effect**: one unconditional numeric bonus a mod gives at a rank.
- **Not modelled**: a stat line or rule the calculator recognises as present but
  leaves out of its numbers. Always reported, never guessed.
- **Mod family**: a mod together with its Flawed, Primed and Galvanized forms.
  Only one member of a family can be in a build.
- **Weapon class**: the group of weapons a mod names as compatible, such as
  rifle, shotgun or pistol.
- **Arsenal stats**: the numbers the game's arsenal screen shows for a weapon
  with a build on it, before any enemy is involved.
- **Burst DPS**: average damage per second while firing, crits averaged in.
- **Sustained DPS**: burst DPS spread over a full magazine and its reload.
- **Validation**: comparing computed arsenal stats for a saved config with the
  arsenal screen. A rule is trusted only after it passes.
