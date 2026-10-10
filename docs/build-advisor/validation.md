# Build advisor: next in-game checks

Prepared 2026-10-10. Offline checks cannot establish the game's current damage
or inventory encoding. Record observations here before changing those rules.

## Start with one Upgrade screen

Use an existing local inventory snapshot; do not upload an account export or
session token. Build the diagnostic with `pnpm run build:main`, then run:

```powershell
node scripts/dev/advise-gun-build.cjs "<local inventory.json>" "<weapon name>"
```

The diagnostic defaults to stacks off for both saved configs and the suggested
build. It accepts wrapped inventory exports and weapons available only through
the fallback item database. `--json` emits the same review as structured data;
it includes mod references, but no raw inventory or authentication fields.

Start with one owned Kuva, Tenet or Coda gun. Capture its Upgrade screen with
the bonus percentage, weapon rank, capacity, mod cards, polarities and arcane
visible. Note the selected saved config and your Mastery Rank. Compare:

| Check             | What to record                                                                | What it settles                                                          |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Bonus element     | Shown percentage and element, diagnostic percentage and element               | Whether the fingerprint's integer really maps linearly from 25% to 60%   |
| Capacity          | Rank, Mastery Rank, catalyst, total capacity                                  | Rank and minimum-capacity rules                                          |
| Forma replacement | Original known polarity, current slot, displayed mod cost                     | Whether the override replaces an innate slot and how slots map to the UI |
| Wrong polarity    | Move a 5-drain mod onto a wrong polarity and record its cost, then restore it | A cost of 6 supports nearest rounding; 7 supports rounding up            |

Do not spend Forma, catalysts, adapters or other resources for these checks.
Use existing equipment and reversible mod moves. Also check an already-owned
unranked gun and a rank-40-capable gun if available. Missing mastery data makes
the advisor use a lower capacity floor; it does not mean the game has that floor.

The capacity estimate covers eight regular mods, with cheapest placement. It
does not reserve the exilus mod's drain or solve element order against physical
slot positions. Clear the exilus slot for the comparison, or account for its
cost separately. Preserve the displayed elemental combination when placing mods.

## Then compare two or three builds in the Simulacrum

Choose a supported automatic or semi-automatic gun first, with no Incarnon form,
unmodelled set bonus or damage-per-status mod. Use a heavy armoured target without
shields or Overguard, and keep the same enemy type, level and count throughout.
The current model assumes 2,700 armour for its armoured factions; do not compare
absolute numbers to a target with a different defence profile.

1. Turn Stacks up off. Compare the saved build and recommendation using the same
   inventory snapshot and Target setting. Record all mods and ranks, arcane,
   weapon bonus, and any lines marked as not modelled.
2. Disable companion attacks and avoid frame buffs, headshots and external armour
   strip. Use the same body-hit location and firing distance each time.
3. Record short-burst damage and a longer sustained interval, including reloads.
   Repeat each build several times because critical hits and status are random.
   Separate direct-hit observations from status ticks where possible.
4. Compare a direct-damage build, a Viral/Heat build, and a Corrosive/Heat build
   if the owned mods allow it. The first question is whether the predicted
   ordering agrees; absolute DPS and time to kill are separate checks.
5. Repeat with Stacks up enabled only when the relevant conditional buffs are
   visibly active. Record any time needed to build or refresh the stacks.

The same comparison can be printed without launching Electron:

```powershell
node scripts/dev/advise-gun-build.cjs "<local inventory.json>" "<weapon name>" --target grineer
node scripts/dev/advise-gun-build.cjs "<local inventory.json>" "<weapon name>" --target grineer --stacks --json
```

Do not interpret a steady-state estimate as predicted time to kill. Fast deaths,
Heat refresh, proc uptime through reloads and simultaneous effects are known
simplifications. Disagreement should become a reproducible fixture and a model
change or an explicit limitation, not a fitted multiplier.

## Follow-up checks

### Prepared A/B comparison after Hunter Munitions support

Use the existing level-190 Steel Path Heavy Gunner setup, no companion or
abilities. Preserve config A "Brozime 3yr old" and its screenshot; do not
overwrite a valued config or buy a config slot for this test. The following
candidate is prepared for a temporary reversible loadout change when the user
is ready. All listed mods are already owned at the indicated maximum ranks.

| Top row, left to right | Rank |
| ---------------------- | ---- |
| Frigid Blast           | 3    |
| Shotgun Barrage        | 5    |
| Hell's Chamber         | 5    |
| Toxic Barrage          | 3    |

| Bottom row, left to right | Rank |
| ------------------------- | ---- |
| Scattering Inferno        | 3    |
| Blaze                     | 3    |
| Primed Point Blank        | 10   |
| Incendiary Coat           | 5    |

The recommendation has no weapon arcane with stacks off. For an exact
comparison to its printed stats, leave that slot empty on the candidate.
Fatal Acceleration can remain: it is excluded from the damage calculation;
its four drain plus the candidate's conservative 52 regular drain fits 80.
Polarity placement may differ from the printed order: preserve Cold + Toxin
before Heat, and confirm Viral + Heat + innate Radiation in the Arsenal.
Expected candidate stats: Radiation 2,470; Viral 4,518.4; Heat 6,670.8;
multishot 2.2; critical chance 22%; critical damage 2×; status 95.2%;
fire rate 1.9; magazine 10; reload 3s. Get an Upgrade screenshot before firing
to confirm the actual equipped ranks, capacity and element order.

For each build, record three separate fresh enemies from first torso shot to
death, firing consistently and reloading normally. Start each trial with a
full magazine and no remaining kill-triggered weapon buffs; let those expire
after each kill. Use one fixed firing position with clear space behind the
enemy. Record misses and reloads rather than trimming them away. The model
estimates 62.7k burst/51.0k sustained for the saved config and 184.1k/117.3k
for this candidate against Grineer, stacks off. These are hypotheses to test,
not measured DPS or predicted time-to-kill ratios. Heat ramp-up and saved
config effects not modelled remain important limitations.

- Compare Merciless, Deadhead and Dexterity while active on otherwise identical
  builds to verify the shared additive damage bucket. Use arcanes already owned.
- Measure one full firing/reload cycle for burst, held and charge weapons. Test
  fire-rate changes too; an incorrect timing model can change mod rankings.
- Ask native German and Chinese readers to review the Builds labels and notes.

## Observation record

### Completed initial A/B series (2026-10-10)

All trial files are now named with prefix `2026-10-10_Tenet-Arca-Plasmor_`
in the user's NVIDIA/Warframe captures directory. Renames preserve the videos
without trimming or re-encoding. The suffixes below map original recordings:

| Original start time / suffix | Current filename suffix                  | Approximate TTK | Rounds expended |
| ---------------------------- | ---------------------------------------- | --------------- | --------------- |
| 12.42.45.04                  | Codex_Trial-01.mp4                       | 2.7s            | 6               |
| 13.19.03.09                  | Codex_Trial-02.mp4                       | 2.4s            | 6               |
| 13.19.28.10                  | Codex_Trial-03_Van-explosion.mp4         | 3.2s            | 7               |
| 13.20.52.11                  | Codex_Trial-04_Van-already-destroyed.mp4 | 2.3s            | 5               |
| 12.45.47.05                  | Brozime-3yr-old_Trial-01.mp4             | 8.1s            | 9               |
| 13.12.17.06                  | Brozime-3yr-old_Trial-02.mp4             | 6.1s            | 7               |
| 13.16.08.08                  | Brozime-3yr-old_Trial-03.mp4             | 5.1s            | 6               |

Times run from first discharge to visible death/health-label disappearance,
with approximately 0.2s sampling/occlusion uncertainty. Rounds expended are
total magazine consumption in each clip, not necessarily rounds required to
kill: Codex trial 2 has a further shot after the target's label disappears,
and trial 3's final shot is close to the death boundary. No trial reloads.

Trial 2 (7.700s clip): first discharge ~2.2s; death ~4.6s. Trial 3 (9.101s):
first discharge ~2.3s; death ~5.5s. The van explodes around 3s, before death;
its contribution cannot be ruled out. Keep the trial marked as confounded.
Trial 4 (7.331s): first discharge ~2.4s; death ~4.7s. The user intentionally
repeated with the van already destroyed, visible throughout this clip.
This repeat shows that a mid-fight van explosion is not necessary for a fast
Codex kill; it does not prove the explosion had no effect in trial 3.

Codex trials 1, 2 and 4 (excluding the mid-fight explosion) average ~2.5s,
median 2.4s, range 2.3–2.7s. Brozime averages ~6.4s, median 6.1s, range
5.1–8.1s. The Codex mean is about 61% shorter in this small observed series.
Including trial 3 gives Codex ~2.7s across four trials. These observations
support the predicted ordering for this specific stacks-off matchup. They
do not validate absolute DPS, all weapons/enemies, or performance with kill
stacks already active. Arena walls, changing props, exact aim and random
critical/status outcomes remain limitations. Do not fit damage constants to
these times. The initial requested comparison is complete; no further repeat
of this same setup is required before returning to offline work.

### Brozime combat trial 3 (2026-10-10)

Reviewed `Warframe 2026.10.10 - 13.16.08.08.mp4` (8.668s) and renamed it
`2026-10-10_Tenet-Arca-Plasmor_Brozime-3yr-old_Trial-03.mp4` in the same
directory, preserving content. First discharge around 1.7s, kill around 6.8s
with the health/name bar disappearing and kill-triggered buffs appearing:
approximately 5.1s time to kill (about 0.2s uncertainty). Magazine 10 → 4,
six shots, no reload. One completed trial.

Brozime's three recorded times are approximately 8.1s, 6.1s and 5.1s;
mean 6.4s, median 6.1s, range 5.1–8.1s. Shot counts are nine, seven and six.
Codex still has one trial at approximately 2.7s/six shots; its two additional
trials remain pending. This small sample retains the previously documented
arena/aim/rebound limitations and is not an absolute-DPS validation.

### Brozime combat trial 2 (2026-10-10)

Original clip `Warframe 2026.10.10 - 13.12.17.06.mp4` was reviewed and renamed
at the user's request to
`2026-10-10_Tenet-Arca-Plasmor_Brozime-3yr-old_Trial-02.mp4` in the same
NVIDIA/Warframe directory. Duration 10.133 seconds. First discharge around
1.6s; kill around 7.7s (health/name bar disappears and kill buffs appear).
Approximate time to kill 6.1s, allowing 0.2s sampling/occlusion uncertainty.
Magazine 10 → 3: seven shots, no reload. One kill in the clip. The wall
remains behind the target. The source of the earlier fire-like projectiles
is unknown to the user; do not assume it has been identified or controlled.

The next file, `Warframe 2026.10.10 - 13.13.12.07.mp4`, was still growing
on initial inspection. After the user stopped it, it was readable (90.367s).
Sampled frames show idle footage starting with three rounds remaining, then
movement/reloading and an Arsenal switch from Brozime to Codex; no complete
combat trial was captured. Renamed, without trimming or modifying content, to
`2026-10-10_Tenet-Arca-Plasmor_After-test-idle-and-config-switch.mp4` in the
same directory. This is not trial 3. Brozime currently has two measured trials
(8.1s/nine shots and 6.1s/seven shots), not three.

### Brozime combat trial 1 and first paired result (2026-10-10)

Clip `Warframe 2026.10.10 - 12.45.47.05.mp4` is 14.983 seconds. The first
discharge is around 2.3s and the target's health/name bar disappears around
10.4–10.5s, with kill-triggered weapon buff icons appearing. Estimated
time to kill is approximately 8.1 seconds (about 0.2s sampling/occlusion
uncertainty). Magazine falls from 10 to 1: nine shots and no reload.
It contains one kill. The supplied config-switch screenshots
`Warframe.x64_GTI9pFTGtB.jpg` and `Warframe.x64_gZ2dxibW2D.png` confirm the
previously checked Brozime config and its stats.

The first pair is Codex ~2.7s/six shots versus Brozime ~8.1s/nine shots:
Codex took approximately one third as long in these two runs. This agrees
with the model's predicted ordering, but is not a robust average or a
validation of its absolute DPS. Neither run required reloading. Both retain
a wall behind the enemy; rebounds, random critical/status rolls and exact aim
remain uncontrolled. The Brozime footage also shows fire-like projectiles
crossing from the left; their source and effect are not established here.
Repeat trials are needed before generalising the result; do not tune model
constants from this pair.

### Codex candidate combat trial 1 (2026-10-10)

Clip `Warframe 2026.10.10 - 12.42.45.04.mp4` is 7.584 seconds, 2560×1440,
60 fps. It contains one kill, not three trials. The level-190 Heavy Gunner
starts with a visibly full health bar. First discharge is around 1.4s; the
health/name bar disappears around 4.0–4.2s amid projectile effects. Estimated
time from first discharge to death is approximately 2.7 seconds (allow about
0.2s uncertainty from sampled frames/effect occlusion). Magazine falls from
10 to 4: six shots, no reload. Heat/status effects and multiple impact numbers
are visible, but the overlapping labels are not an exhaustive damage tally.
The wall remains behind the target, so rebounds are still a potential confound.
This is one observed trial; no mean or comparative winner is established.
Keep the same firing position for the paired Brozime trial and label this as
the observed arena setup, not a verified no-rebound test.

### Candidate Arsenal check (2026-10-10)

User equipped the prepared candidate as config B "Codex". Screenshots
`Warframe.x64_GS60JjPw3J.png` and `Warframe.x64_WMJBt3he1z.png` show the
requested eight mods, with arcane and exilus slots empty. All modelled
Arsenal stats match: fire rate 1.9, multishot 2.2, magazine 10, reload 3s,
critical chance 22%, critical multiplier 2×, status 95.2%, Heat 6,670.8,
Radiation 2,470, Viral 4,518.4, and Total 30,050.3 (unrounded per-projectile
sum × 2.2). The observed physical placement costs 59, leaving 21/80.
Hell's Chamber occupies a mismatched slot and costs 19. The advisor's 52
is an estimate assuming cheapest placement across possible layouts, not the
cost of the printed slot order. This screenshot does not contradict that
minimum-placement estimate; the candidate fits without rearrangement.
Fatal Acceleration is absent, so the displayed falloff is 18–36m. Keep
comparison shots comfortably inside 18m and avoid nearby rebound surfaces.
Combat comparison remains pending.

### 2026-10-10: Tenet Arca Plasmor, config A "Brozime 3yr old"

User supplied Upgrade and Mastery Rank screenshots (game build not visible).
The existing local snapshot was saved October 5; its config name, nine mod
names/ranks, arcane, five Forma and MR 27 agree with the screenshots. No game
memory access or inventory refresh was needed. Screenshot originals remain
in the user's private ShareX directory (`Warframe.x64_hbJLYoRQx4.jpg` and
`Warframe.x64_hxZY4NPEjm.png`).

- **Bonus passes for this sample:** fingerprint roll 110617664 gives 28.6%
  Toxin at the displayed precision, matching the Upgrade screen. One sample
  supports the linear decoding; it does not establish the whole range.
- **Rank-40 total capacity passes:** the weapon is rank 40, with five Forma,
  and the snapshot's catalyst flag is set. Both game and advisor give 80 total.
  This does not test the low-rank MR floor or Legendary Rank rule.
- **Displayed drain reconciles:** regular mods cost 8 + 4 + 9 + 11 + 15 + 5 +
  7 + 9 = 68, plus Fatal Acceleration's 4 in exilus = 72, leaving 8/80.
  The recommendation's 63/80 is a different build and excludes exilus;
  it must not be compared directly with this saved config's remaining capacity.
- **Wrong-polarity rounding passes:** max-rank Semi-Shotgun Cannonade has
  normal drain 9 and displays red drain 11 in the mismatched slot. Nearest
  rounding of 9 × 1.25 gives 11; rounding up would give 12. Toxic Barrage's
  7 → 9 and Galvanized Savvy's 12 → 15 also agree, but do not distinguish
  those rounding rules.
- **Visible stats pass with stacks off:** fire rate 1, multishot 2.1, magazine
  10, reload 2.3s (computed 2.31s), critical chance 66%, status 102%.
- **Critical damage passes with the companion removed:**
  the follow-up Huras Kubrow screenshot (`Warframe.x64_AEnxlfGinY.jpg`) shows
  max-rank Tenacious Bond. Its conditional +1.2× final critical multiplier
  exactly reconciles the weapon-only 4.2× with the arsenal's 5.4×.
  [Tenacious Bond reference](https://wiki.warframe.com/w/Tenacious_Bond), read
  October 10, states that the companion needs at least 50% critical chance.
  The user then unequipped the companion and supplied
  `Warframe.x64_bTXLrnxgI1.jpg`: critical damage fell to 4.2×, exactly matching
  the calculator, with the same weapon config and displayed mods. This isolates
  the companion contribution and resolves the discrepancy. The claws stats
  themselves were not shown. No weapon formula change is warranted.
  Kullervo is equipped (`Warframe.x64_GFgEK1JhWn.jpg`); the inspected shard
  tooltips show ability strength (`Warframe.x64_mXBuaGJjUc.png`) and melee-only
  critical damage (`Warframe.x64_bIbxZqbCxA.png`), neither explaining gun critical
  damage. The screenshots do not show every shard's selected effect.
- **Damage rows pass:** the scrolled companion-off screenshot
  `Warframe.x64_i4lFT7FDbP.png` shows Radiation 2,584, Viral 4,727 and Total
  15,353.1. Re-running the diagnostic on the matching saved config gives
  Radiation 2584 and Viral 4726.978281550573 per projectile. Their sum,
  7310.978281550573, multiplied by 2.1 multishot is 15353.054391256204:
  all three rows match at the game's displayed precision. The Arsenal
  comparison for this config's modelled stats is complete. This does not
  validate conditional damage, status ticks, target DPS or build ranking.

### Simulacrum setup supplied (2026-10-10)

Screenshot `Warframe.x64_XKLogF5K4L.png` shows one Heavy Gunner, enemy level
190, Steel Path enabled, player invincibility enabled and AI paused. Friendly
fire and companion invincibility are disabled. This records the selected setup,
not measured enemy armour or any combat result. Preserve these settings across
comparisons. The next observation is a single torso shot on a fresh enemy with
the existing Tenet config, companion unequipped and conditional buffs expired;
record the impact and subsequent status ticks before testing sustained fire.

First clip received: `Warframe 2026.10.10 - 12.03.11.01.mp4` in the user's
NVIDIA/Warframe captures. Local probing confirms 28.90 seconds, 2560×1440,
60 fps. Sampled frames show the level-190 Heavy Gunner, initial magazine 10,
then repeated shots reducing the magazine to zero, with the enemy close to
a wall behind it. This is useful exploratory footage, but does not isolate
one shot followed by ten seconds of status ticks. Wall rebounds are a possible
confound, not established from the sampled frames. No quantitative combat
validation result is claimed. Request one shot on a fresh target with open
space behind it and ten seconds without further fire.

Second clip: `Warframe 2026.10.10 - 12.06.33.02.mp4`, 18.98 seconds,
2560×1440 at 60 fps. Sampled frames show one shot around 3.2 seconds, magazine
10 → 9 and no subsequent ammunition use through the end. Detailed impact
numbers include 6,195, 3,098, 7,744, 1,659 and 2,028, with overlapping labels;
do not sum those observations as an exhaustive hit list. Later frames show
repeated 13,438 damage ticks and four Viral stacks. The target remains close
to the wall, so the impact sequence is not an isolated no-rebound baseline.

A manual critical Slash tick calculation using the snapshot's bonus roll,
Cannonade and four Viral stacks gives
`760 × (1 + 0.2860572547056314) × 3.4 × 0.35 × 4.2 × 2.75 = 13433.9226`.
This is within 0.031% of the observed 13,438, but is not an exact match;
the residual has not been explained. References checked October 10:
[Slash](https://wiki.warframe.com/w/Damage/Slash_Damage) and
[Viral](https://wiki.warframe.com/w/Damage/Viral_Damage).
This is evidence consistent with Hunter Munitions bleed and Viral amplification,
not validation of the advisor's output: Hunter Munitions was unmodelled when
the clip was reviewed. It has since been added to faction estimates with
critical-hit-conditioned proc damage, including higher crit tiers. The same
saved build's stacks-off Grineer estimate now includes 45,060 bleed DPS;
that steady-state figure is not a measurement from this single shot.
No fitted adjustment or combat-ranking pass is warranted.

For each further check, record
the game version/date, weapon and config, exact setup, expected output, observed
output, screenshots or a short clip, and whether the result passes, fails or
remains inconclusive. Keep private artifacts outside version control and add
only synthetic regression fixtures to tests.
