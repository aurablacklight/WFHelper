# 2. Mod effects are parsed from stat text, whole lines only

Date: 2026-10-05

## Status

Accepted

## Context

The calculator needs each mod's bonuses as numbers. Of the two bundled data
packages, `warframe-public-export-plus` has structured weapon stats but no
numeric mod effects, and `@wfcd/items` has mod effects only as per-rank text
such as `"+165% Damage"`. The alternatives were a hand-maintained table of mod
numbers, which goes stale with every game update, or parsing the text.

## Decision

Parse the `@wfcd/items` stat lines. A line counts only when it matches a known
pattern from start to end; every other line is returned as not modelled and
shown to the user. Rules written in a mod's description are treated the same
way, and a mod carrying a rule the calculator does not model is never
recommended. Conditional bonuses are not modelled.

## Consequences

- New mods work without a code change when their text uses a known pattern, and
  are visibly incomplete when it does not.
- A wording change upstream turns a modelled line into a not-modelled one. That
  is a silent drop in a mod's value, so the tests pin the patterns in use.
- Galvanized and other conditional mods are undervalued until their stacks are
  modelled.
