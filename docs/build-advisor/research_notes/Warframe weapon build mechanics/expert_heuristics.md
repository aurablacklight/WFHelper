# Expert heuristics for Warframe weapon builds (Brozime, TheKengineer, Tactical Potato) and where they differ from naive DPS calculators

Research date: 2026-10-05. Researcher notes for the build-advisor report writer.

**How to read these notes**

- Labels: **WIKI-CONFIRMED** (official wiki, wiki.warframe.com), **CREATOR-STATED** (who, where, when), **COMMUNITY-CONSENSUS**, **DISPUTED**, **UNKNOWN**.
- "Pre-U36" means the source predates Update 36 (Jade Shadows, June 2024), which removed enemy health/armor types, moved weaknesses to factions, capped enemy armor and reworked several status effects. Pre-U36 advice about *element choice* and *armor* is unsafe unless a later source repeats it. Pre-U36 advice about *how mods stack* is mostly still valid and is flagged where I could check it against the wiki.
- Creator quotes come from auto-generated YouTube transcripts that I read in full. Transcripts mis-hear game terms ("Kuva Nukor" becomes "kuvanuka", "Murmur" becomes "murma"). I have corrected obvious mis-hearings inside quotes and kept the wording otherwise.
- **Access limits, stated plainly:**
  - YouTube began IP-blocking transcript requests partway through. I have full transcripts for 13 videos (listed in the sources below). I could **not** read any Tactical Potato video, any Brozime video other than "Basic Modding YOU SHOULD KNOW", or TheKengineer's shard, Steel Path, AoE-meta and "Utility Primaries" videos. Where I cite those videos I cite only their title and date.
  - Reddit blocked every direct fetch. Reddit opinions below are **search-result excerpts only** (one or two sentences per thread); I did not read the threads, their dates or their vote counts.
  - The wiki's faction weakness table (`Damage/Overview_Table`) would not render through my tools. Faction weaknesses below are from TheKengineer's video and from individual wiki faction pages.
  - `wmux` was not available in this session, so normal web tools were used.

---

## 1. Brozime's public Obsidian vault: structure and what it contains on weapons

### Takeaway
The vault exists and is easy to read programmatically, but it is **not** a written modding rulebook: its one modding page is a pointer to a video, and Brozime says he deliberately did not write the rules down. Its weapon-relevant value is in three reference tables (best progenitor element per Kuva/Tenet/Coda weapon, Incarnon grades with evolution choices, companion and sentinel-weapon picks) plus a few stated rules of thumb.

### Cited Findings

**Location and structure**

- The vault is at `publish.obsidian.md/brozime`; the welcome page says it "aggregates all of the notes I've released for free for everyone to view and follow alongside my videos" and that a second, larger notes site is restricted to Patrons and Twitch subscribers. CREATOR-STATED (Brozime, undated page) — [Welcome page](https://publish.obsidian.md/brozime/Public/Welcome+to+Brozime's+Public+Notes)
- Top-level folders: Critical Progression Route; Devstreams & Data; Guides & Builds; Soulframe; Warframe Lore; Warframe Ranking & Top 10's; plus Duviri Decrees Tierlist and Patreon Credits. — [Welcome page](https://publish.obsidian.md/brozime/Public/Welcome+to+Brozime's+Public+Notes)
- The whole site index is a public JSON file (566 entries including images) at `https://publish-01.obsidian.md/cache/e24d3ab0728206012febd6e4fcc69c6e`, and each note's raw markdown is at `https://publish-01.obsidian.md/access/e24d3ab0728206012febd6e4fcc69c6e/<path>`. This is how I read the notes; an app could do the same. — [Vault index](https://publish-01.obsidian.md/cache/e24d3ab0728206012febd6e4fcc69c6e)
- `Guides & Builds` contains: `Modding/Basic Modding Overview`; `Weapon Builds/2023 Most Used Weapon Builds` and `Quest Weapons`; `Best Companions`; `Guides/Other/` (Incarnons, Using Archon Shards, Focus, Tauron Weapons & Focus, Amps, Prime Access Farming); `Guides/Kuva Lich, Sisters of Parvos, & Coda/` (Lich Weapons, Progenitor List, Kuva Lich, Sister of Parvos, Coda, Requiem Mod Usage); roughly 65 per-Warframe build pages (A-G, H-N, O-Z) up to Narin, Follie, Uriel and Sirius & Orion; quest, junction, event and reputation guides. `Devstreams & Data` holds notes for Devstreams 163 to 197 and TennoCon 2022 to 2026. `Warframe Ranking & Top 10's` holds Full Roster tier lists for 2021, 2023, 2024, 2025 and 2026. — [Vault index](https://publish-01.obsidian.md/cache/e24d3ab0728206012febd6e4fcc69c6e)
- The per-Warframe pages I sampled (Saryn, Xaku) are about 140 characters each, i.e. a video embed and nothing else. — [Saryn page](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Warframe+Builds/O-Z/Saryn)

**What is not there**

- The modding page reads, in full: "The above video is a general best practices guideline for modding in Warframe. I won't be putting the information in the video into text here as I feel it is honestly too confusing without the visual aid of seeing how it actually is in-game." CREATOR-STATED (Brozime; the linked video is dated 2023-12-09, pre-U36) — [Basic Modding Overview](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Modding/Basic+Modding+Overview)
- There are no public notes on damage formulas, status mechanics, enemy scaling, weapon arcanes, Rivens or a weapon tier list. `Quest Weapons` is a bare list of six names; `2023 Most Used Weapon Builds` is three video embeds based on DE's 2022 usage stats (pre-U36). — [Quest Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Weapon+Builds/Quest+Weapons); [2023 Most Used Weapon Builds](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Weapon+Builds/2023+Most+Used+Weapon+Builds)

**Lich / Sister / Coda weapons: best bonus element and tier** (page embeds videos dated 2025-01-22 Kuva, 2025-01-29 Tenet, 2025-03-26 Coda rotation one, and a "Latest Update" video dated 2026-03-31; all post-U36)

- Stated rules: "the below suggestions assume a basic knowledge of weapon modding. Weapons that want Toxin for example usually use that to combine into Corrosive/Viral with only 1 elemental mod in the build. Also worth noting that Magnetic is a safe choice for any gun as it will always help them deal with Eximus more effectively though you can easily add it with the single Magnetic mods." CREATOR-STATED (Brozime) — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
- Tier definitions: Excellent = "Fantastic weapons often with upsides that sometimes compete with Incarnons"; Good = "Solid weapons that can do content well but often have some downsides"; Mastery Fodder = "Not worth farming unless you are just leveling up your Mastery Rank." — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
- Kuva table (element, tier): Ayanga Heat, Fodder; Brakk Heat, Excellent; Bramma Toxin, Good; Chakkhurr Heat or Toxin, Good; Drakgoon Heat, Fodder; Ghoulsaw Electric or Heat, Fodder; Grattler Heat, Excellent; Hek Heat, Excellent; Hind Heat, Good; Karak Heat, Fodder; Kohm Heat or Magnetic, Excellent; Kraken Heat, Fodder; Nukor Heat or Magnetic, Excellent; Ogris Heat, Excellent; Quartakk Heat or Magnetic, Excellent; Seer Heat, Fodder; Shildeg Electric, Fodder; Sobek Electric, Excellent; Tonkor Heat, Excellent; Twin Stubbas Heat, Fodder; Zarr Heat or Toxin, Good. — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
- Tenet table: Agendus Electric, Excellent; Arca Plasmor Heat or Magnetic, Excellent; Cycron Magnetic, Excellent; Detron Magnetic or Heat, Good; Diplos Magnetic, Fodder; Envoy Heat, Good; Exec Electric, Fodder; Ferrox Heat, Fodder; Flux Rifle Heat, Fodder; Glaxion Magnetic, Excellent; Grigori Electric, Excellent; Livia Electric, Good; Plinx Heat, Fodder; Spirex Heat, Fodder; Tetra Heat, Good; Quanta Magnetic, Good. — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
- Coda table: Catabolyst Heat, Excellent; Hema Magnetic, Good; Mire Heat, Excellent; Motovore Heat or Electric, Fodder; Pox Heat, Good; Sporothrix Heat, Good; Torxica Magnetic, Good; Bassocyst Heat, Magnetic or Toxin, Excellent; Bubonico Magnetic, Excellent; Caustacyst Electric, Excellent; Hirudo Electric, Good; Pathocyst Electric, Excellent; Synapse Heat, Excellent; Tysis Magnetic, Good. — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)

**Incarnons** (page embeds a Zariman/Labs video dated 2025-03-05; the Circuit tier list video "COMPLETE CIRCUIT INCARNON TIERLIST(with Builds)" is about two years old)

- Grade scale: S = "Raising the bar for weapon power in Warframe significantly"; A = "Meeting or slightly exceeding high-power weapons"; B = "Powerful weapons that are held back by a downside or niche"; C = "Weapons that can do high level content meaningfully better"; F = "No notable improvement." CREATOR-STATED (Brozime) — [Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)
- Evolution choices are encoded as digit strings: "the first number is always 0 because Incarnons don't have a choice of Evolution 1"; Zariman Incarnons use five digits, Circuit adapters four. — [Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)
- Zariman/Labs/Isleweaver (grade, evolutions): Laetum S 02131; Innodem A+ 03213; Phenmor A 01131; Felarx S 03231; Praedos S 03323; Onos B+ 03232; Ruvox B 02112; Thalys A- 02113. — [Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)
- Circuit adapters: Wk1 Braton A 0121, Lato A- 0212, Skana A- 0212, Paris B+ 0112, Kunai C 0131. Wk2 Boar A 0133, Gammacor B 0231, Angstrum B 0221, Gorgon C 0232, Anku C- 0112. Wk3 Bo A- 0213, Latron S 0133, Furis S 0223, Furax B- 0123, Strun S- 0211. Wk4 Lex A 0123, Magistar B+ 0213, Boltor A 0212, Bronco B- 0132, Ceramic Dagger B+ 0113. Wk5 Torid S 0112, Dual Toxocyst S 0131, Dual Ichor A 0211, Miter S 0112, Atomos A 0213. Wk6 Ack & Brunt F 0113, Soma A 0122, Vasto B 0211, Nami Solo S 0112, Burston S 0212. Wk7 Zylok F 0221, Sibear B 0212, Dread C+ 0113, Despair B+ 0123, Hate B 0112. Wk8 Sybaris S 0233, Sicarus S 0113, Dera A 0112, Cestra A- 0132, Okina S- 0212. Wk9 Destreza A 0213, Ballistica S 0121, Obex B+ 0123, Stug A 0223, Vectis C+ 0233. — [Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)

**Companions as build inputs** (video dated 2024-11-05, post-U36)

- Ranking: 1 Panzer Vulpaphyla (universal), 2 Nautilus Prime (crowd clearing), 3 Dethcube Prime (energy), 4 Diriga (best for new players), 5 Sahasa Kubrow, 6 Wyrm Prime, 7 Chesa Kubrow, 8 Adarza Kavat ("Critical Buffs"), 9 Huras Kubrow, 10 Hounds ("Damage Output"). CREATOR-STATED (Brozime) — [Best Companions](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Best+Companions)
- Sentinel weapons: Tazicor is a "Primer for Manifold Bond & excellent Crowd Control"; Verglas Prime is the "Weapon of choice for Sentinel killing power"; Laser Rifle Prime, Burst Laser Prime and Vulklok are noted for having "the stats for Tenacious Bond". — [Best Companions](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Best+Companions)

**Archon Shards, Focus, Tauron weapons**

- The shard page only defines a key for a Google Sheet, and the key covers Crimson, Amber and Azure only (for example "R1 | Crimson +25% Melee Critical Damage", "R2 | Crimson +25% Primary Status Chance", "R3 | Crimson +25% Secondary Critical Chance"). It has no Violet, Emerald or Topaz entries, so it predates those shards. CREATOR-STATED (Brozime, undated; outdated) — [Using Archon Shards](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Using+Archon+Shards)
- Focus is described as offering "powerful Energy Economy, Armor Stripping, and Damage Boosts for your Warframes"; the notes name Madurai Void Strike, Unairu Caustic Strike and Naramon Power Spike ("Used for Khora and other melee focused frames to maintain combo"). — [Focus](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Focus)
- On Tauron (Focus) weapons: "Truthfully, none of the direct Weapon attacks/effects currently matter... Pick your Focus based on the regular abilities that you can count on like Wellspring(Zenurik) or Power Spike(Naramon)". The one weapon-build-relevant exception: the operator arcane Zid-An Uskos, "for Warframes mainly using Secondaries you get a fairly large Heat damage bonus if you are willing to go through the hoop of killing 100 enemies with your Operator each mission." Madurai's Thara "Grants 5% Strength for each enemy hit up to 50% Strength for 30s." CREATOR-STATED (Brozime; content is from the 2026 Perita Rebellion era) — [Tauron Weapons & Focus](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Tauron+Weapons+%26+Focus)

**Devstream notes useful as "what changed" flags**

- Devstream 197 notes (Iceblade of Narin, dated 23 September in the note; the year is 2026 by sequence) list "Riven System Expansion" and "ETA/EDA changes" under QOL, with no detail. Brozime also has a video titled "The Narin Buff | Warframe Hotfix" published about five days before this research. — [Devstream 197](https://publish.obsidian.md/brozime/Public/Devstreams+%26+Data/Devstreams/Devstream+197)

### Inferences
- The owner's impression of "a wealth of written knowledge" is true for progression, lore, devstreams and Warframe builds, but for weapon modding the public vault is thin. The advisor cannot be seeded with Brozime's modding rules from the vault; they have to come from his videos.
- Brozime's progenitor table is directly usable as data: Heat is his default bonus element (40 of 51 entries include it), Magnetic is his alternative for weapons he rates highly, Electric appears on melee and a few specific guns, and Toxin only where the weapon wants a one-mod Viral or Corrosive.
- Brozime grades weapons on outcome ("held back by a downside or niche"), not on a DPS number. That is evidence for an advisor that reports caveats beside a score.

### Gaps
- The Patron-only notes site may contain the written modding material; it is not public and I did not attempt access.
- I could not read the transcripts of the Kuva, Tenet, Coda or Incarnon videos, so I have Brozime's element picks but not his stated reasons for each weapon.
- The archon shard Google Sheet was not opened.
- The details of the "Riven System Expansion" (September 2026) are unknown to me; any Riven logic should be re-checked against it.

---

## 2. TheKengineer: modding methodology and stated rules

### Takeaway
TheKengineer's method is "one multiplier per stat category, and never trust the number on the mod": bonuses to the same stat add, different stats multiply, so the value of a mod is its *marginal* increase to its own category. He then layers practical corrections on top of the formula: ramp-up time, status weighting, attack type (hitscan, projectile, radial), range limits and whether the condition will actually be met.

### Cited Findings

**He maintains a topical index of his videos**, which is the best map of his material: sections for Weapon Guides, Other Equipment (Archon Shards by colour, Galvanized mods, Internal Bleeding/Hemorrhage, Rivens, Primary Crux, Primary Bulwark, melee arcanes), Mechanics (Damage calculation, Damage types (2024), Level scaling 2024, Armor removal, HCET element order, Roar vs Eclipse, Viral vs Corrosive, Accuracy) and Mythbusting. — [TheKengineer catalogue](https://www.thekengineer.com/catalogue)

**Damage buckets** (video "Damage calculation guide - 165% doesn't mean 165%", 2021-08-01, pre-U36; the stacking rules below are consistent with current wiki pages cited in sections 5 and 8)

- "all mods and most bonuses are additive to the respective base value"; Serration then Heavy Caliber gives 100 + 165 + 165 = 430%, which "is only 62 percent higher than the 265 total... This is why additive bonuses are considered the weakest type". CREATOR-STATED (TheKengineer, 2021-08-01) — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- Serration plus a 165% elemental instead gives 265% x 265% = 702%: "different stats multiplying together is why using different types of mods is loosely considered multiplicative". — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- Three kinds of bonus: additive, multiplicative, and "absolute" (flat) such as Arcane Avenger's +45 percentage points of crit chance; "absolute buffs are stronger the lower the base and modded values are" (Kuva Nukor: 7% base, 20.1% with Primed Pistol Gambit, 65.1% with Avenger active). — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- The "pure damage" bucket contains more than the obvious mods: "damage mods like Serration, corrupted damage mods like Heavy Caliber, nightmare mods like Blaze, arcanes like [Primary Merciless-type arcanes], status overload mods like Condition Overload, some abilities like Vex Armor or Shooting Gallery, even... Helminth invigorations; all of these modifiers are added together". — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- Crit damage mods are worth more than they read because the arsenal multiplier includes the base 1x: going from 3x to 6x "increases the bonus on a yellow crit from two times to five times extra damage, so that bonus is actually 150". — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- The multiplied terms are base damage, pure damage, crit, faction, elemental, and multishot: "doubling the value of each of these terms... would give you a final multiplier of 32 times... if you just instead... increased elemental damage by 100 five times over your final multiplier... would just be six times". — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- Physical (IPS) mods "only buff up the portion of the base damage which matches"; "there is precious little reason to use the physical damage mods". Repeated post-U36: "physical mods are in effect weaker Elemental mods". — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Damage-over-time procs use "modded damage" (base x pure x crit x faction) "not including elemental or physical mods"; faction is then applied again; Toxin, Electric and Heat procs are also scaled by their own element's mods, "but slash and gas do not". Per-second factors: Slash 0.35, Toxin/Electric/Heat/Gas 0.5. — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- His own statement of the calculator's limit: "this is usually the point someone stops when comparing weapons on a purely theoretical level, and it's a reasonable place to do so as long as everyone remembers the limits to the theory". He then lists projectile falloff, explosion falloff (for example Tenet Envoy loses 80% at the edge), melee follow-through and stance multipliers as real reductions the arsenal number hides. — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)

**Status-overload ("CO") mods: Galvanized Aptitude, Shot, Savvy** (video "When (not) to use the Galvanized mods", 2021-07-24, pre-U36)

- Galvanized multishot: "will you be getting kills with this gun? if the answer is yes you should use the galvanized mod... a single kill will increase your multishot above what it was with the original". Stacks decay one at a time, so "you only need one kill to get back to full power". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Galvanized Scope/Crosshairs: "absolutely better than their basic versions if and only if you are scoring headshot kills"; kills by status procs from those headshots do not count; the bonus requires aiming; all stacks expire together, so "you absolutely must not leave more than 12 seconds between headshot kills". "Weapons modded to kill with status such as using Hunter Munitions, or weapons which cannot reliably go for the headshot, should simply steer clear of these." (He says the all-at-once expiry "may be a bug"; status in 2026 is UNKNOWN.) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- With a separate primer: "if you can proc a minimum of two different status effects Galvanized Shot is better than Hornet Strike on pistols... with three different status procs all three status overload mods are the single best pure damage mod". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Self-priming, the "first shot effect": "before those status procs are applied your initial shot will be dealing less damage; the average dps up to any given point is lower than your current bonus". "if you are killing things in one or two shots already there's not enough time to land the status procs". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Status procs are "weighted by the damage distribution of your weapon"; with 60% Viral, 35% Impact, 5% Slash "over half of all status procs you deal will be viral and only 1 in 20 will be slash". "damage types under 10 [percent] don't proc status enough to matter". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- His rule of thumb, verbatim in substance: (1) need "three or more possible status types and at least three of those are each 10 [percent] or more of your total damage", counting forced procs; (2) estimate shots to kill; (3) procs per shot = maximum multishot x status chance, times shots to kill; (4) "eight or more procs per kill for primaries, six or more for pistols, and the status overload is a better choice" than Serration, Primed Point Blank or Hornet Strike. Secondaries can pass with two major types plus a minor one at about nine procs per kill. — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- On stacking pure-damage sources: "should you find yourself using a fully ranked up Steel Path arcane then it's a case of how reliably you think you'll have your arcane active; if you'll have it active almost constantly then you can safely drop the weaker of the two mods, either the pure damage mod like Serration or the status overload mod like Galvanized Aptitude... there's no point stacking three sources of pure damage when you can instead be modding for crits, fire rate, elemental damage". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- In 2021 he reported the CO bonus failing on projectile weapons as a bug. WIKI-CONFIRMED that this was patched: "Fixed Galvanized Mods offering increased damage from Status on target not reliably working on numerous weapons" (Hotfix 30.5.5), and that "This mod never worked on AoE". — [Galvanized Aptitude (wiki)](https://wiki.warframe.com/w/Galvanized_Aptitude)
- His 2024 restatement: CO bonuses add together, then "Projectiles usually use multiplicative CO... Hitscan usually use additive CO, additive specifically to pure damage modifiers like Serration... Radial usually doesn't use CO at all... All three of these I have to stress usually because variations exist". CREATOR-STATED (TheKengineer, 2024-05-01) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ). The wiki agrees in general terms: "The damage increase is usually additive with other damage mods like Serration, with exceptions where it is multiplicative." WIKI-CONFIRMED — [Galvanized Aptitude (wiki)](https://wiki.warframe.com/w/Galvanized_Aptitude)

**Forced Slash mods** (video "Are Internal Bleeding & Hemorrhage viable?", 2021-06-19, pre-U36; armor numbers in it are obsolete)

- "For secondaries and primaries alike, if the weapon doesn't have a forced impact proc on its main damage, the mods simply aren't worth it." Named beneficiaries: Epitaph (charged shot) and Catchmoon for Hemorrhage; Daikyu, Fulmin (semi-auto, 9 m), Kuva Chakkhurr, Nagantaka and Quellor (alt fire, 18 m) for Internal Bleeding. — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- "Hunter Munitions is far more reliable... Due to it scaling off crits instead of status, you do not need to spend time modding for impact status at all... The majority of builds currently using Hunter Munitions will not see any benefit from switching over." — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- "these are not suited to unarmored enemies like most Corpus and Infested, or status-resistant enemies like Sentients and Acolytes." — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Fire-rate trap: "any buff to your fire rate which brings you over the 2.5 threshold will halve your slash output per shot... watch out for buffs like Wisp's haste mote, lest it break your build." — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Current mod text: "Impact Status Effects have 35% chance to apply a Slash Status Effect (x2 when Fire Rate is below 2.5)"; the wiki now lists 14 forced-impact weapons including Acceltra, Daikyu, Fulmin, Kuva Chakkhurr, Nagantaka, Nataruk, Shedu and Stahlta. WIKI-CONFIRMED — [Internal Bleeding (wiki)](https://wiki.warframe.com/w/Internal_Bleeding)

**Rivens** (video "What makes a good riven?", 2022-02-02, pre-U36 and pre the September 2026 Riven expansion)

- A Riven does one of four jobs: replace a mod with a stronger version, stack beyond the normal cap for a stat, combine two mods into one slot (for example Cold + Toxin = Viral in one slot), or do something no mod does (for example negative Impact or Puncture to clean the status pool). — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Four weapon roles decide which stats matter: "direct damage, status damage, converted slash damage, and then weapon primers". — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- "If you're dealing damage, the core statistics you want to buff are critical stats, multishot, and fire rate. If you're attempting to land status procs, status chance matters, as does not having a negative status duration." — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- "I don't include pure damage as a core stat... All weapons now have access to incredible pure damage buffs through weapon arcanes and status overload mods, meaning the pure damage available on most Rivens can be underwhelming." — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- "Critical damage especially is a relatively hard stat to increase, with only one Warframe ability in the game giving any buff to it." (2022 statement; UNKNOWN whether still one ability in 2026.) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Faction stats on a Riven are "the far end of Riven optimization" and effectively lock the weapon to one faction; a negative versus Infested "is usually ignorable"; negatives versus Grineer or Corpus hurt, "especially if you're relying on either slash procs or other status effects". — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Utility stats (ammo, magazine, reload, recoil, projectile speed) are near-worthless as positives but dangerous as negatives: "Increased recoil can make some guns hard to control, while reduced magazine can see you reloading far too often." Exception named: reload speed on Tigris Prime. — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)

**Older general advice** (video "Top 10 tips for more damage", 2020-05-11; far pre-U36)

- "if you got a crit [chance] of 20 percent or above work with the crits"; for a high-status low-crit weapon "grab your 60/60 mods and take it from there"; aim for weak points ("you will basically double your damage output"; body 54 shots versus head 21 in his test). CREATOR-STATED (TheKengineer, 2020-05-11) — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)
- The same video's element advice (Corrosive + Heat versus Grineer and Infested, Radiation for the "hardiest" Grineer, "weaker infested are vulnerable to gas") is obsolete after U36; see sections 6 and 10. — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)

### Inferences
- The implementable core of his method: compute marginal gain per bucket, not mod face value, and treat arcanes, CO mods, Vex Armor-style abilities and Serration as one bucket.
- His rules are explicitly probabilistic and time-averaged (average damage up to the kill, expected number of distinct statuses). An advisor that reports only a steady-state "all stacks up" number contradicts his method.
- He always attaches "usually" to CO behaviour. A per-weapon flag for how CO applies (additive, multiplicative, absent) would be needed to match him; without it the advisor should state the assumption.

### Gaps
- I could not read his Archon Shard videos (Crimson 2022-10-29, Emerald 2024-01-26, Violet 2024-02-09, Topaz 2024-02-28), "Top Tips to Beat Steel Path!" (2024-09-23), "The AoE meta has gone too far" (2022-08-08), "Primary Crux", "Primary Bulwark", "Accuracy", "Armor removal" (2022, read but pre-U36 and not used for numbers) or "Utility Primaries to support your builds!" (2025-10-03). The last is his most recent weapon-methodology video and is likely the best source for primer and utility-weapon rules.
- No post-U36 update of the "8 procs / 6 procs" Galvanized thresholds was found. The thresholds were derived when the projectile bug existed and before Incarnon and newer arcanes.
- I found no written (non-video) methodology from him beyond the catalogue and a Riven infographic on Patreon that I did not open.

---

## 3. Tactical Potato: build approach

### Takeaway
I could not establish a methodology for Tactical Potato from primary sources. His channel is dominated by news, update coverage and single-item showcases, his videos have no public written companion, and YouTube blocked every transcript request for his videos. Treat his influence on the advisor as "showcases of what is strong right now", not as a rule set.

### Cited Findings
- The channel describes itself as "I do videos and stuff!" with about 1.7K videos. — [Tactical Potato channel](https://www.youtube.com/channel/UCHAenboNPQJmNQmvQDQibQA)
- Channel searches for "modding guide", "damage", "status elements" and "build mistakes" returned no general weapon-modding methodology video from the last several years. What they returned: beginner guides about ten years old ("Warframe Damage Types Explained and Guide (So I'm New What Next?) By Neso", "Warframe: I'm New Whats, Fusion, Mods, Polarities? (Beginners Guide) #2"), and recent single-item showcases and news. Recent weapon-relevant titles with dates: "Coda Motovore's INSANE 720% Buzzkill Slash Damage" (2025-03-14), "Warframe's Damage Attenuation is Ruining Your Fun - Here's Why" (2025-07-03), "DE Fixes Vadarya Prime's Biggest Issue!" (2025-08-28), "This MELTS Everything in Warframe!" (2025-09-19), "Warframe's New Arcane Combos Are Absolutely Unhinged (Old Peace)" (2025-12-15). Titles and dates only; content not read. — [Coda Motovore video](https://www.youtube.com/watch?v=uBcVN8oLz8s); [Damage Attenuation video](https://www.youtube.com/watch?v=fboypQL43z8); [Vadarya Prime video](https://www.youtube.com/watch?v=P7u6z2Qu57c); [This MELTS Everything](https://www.youtube.com/watch?v=N_QvoOaaivU); [New Arcane Combos](https://www.youtube.com/watch?v=XHO1k1KzqhY)
- A channel search for "overframe" returned no video about Overframe. — [Tactical Potato channel](https://www.youtube.com/channel/UCHAenboNPQJmNQmvQDQibQA)
- He took part in a developer chat with DE; a Reddit summary thread exists ("All the main points discussed during the devchat with Tactical Potato"). The only text I could see is a search excerpt: "What kind of weapon am I using? Rapid fire assault rifle? Is it crit or status? Electricity status damage? Okay I have to move my aim through ..." Speaker and context are UNKNOWN. — [Reddit devchat summary](https://www.reddit.com/r/Warframe/comments/1txsggf/all_the_main_points_discussed_during_the_devchat/)
- Community members group him with Brozime as a creator whose build explanations are worth watching: "look at the major Warframe creators, Brozime, Tactical Potato, etc. See what they explain about their builds." COMMUNITY-CONSENSUS (single Facebook group post, search excerpt) — [Facebook group post](https://www.facebook.com/groups/907832266226663/posts/2659319817744557/)

### Inferences
- From titles alone, his recurring themes are (a) a specific item or combination that is newly strong, (b) arcane combinations, and (c) damage attenuation as a reason raw damage does not translate into kill speed on bosses. None of this can be turned into rules without the video content.
- The task brief's description of him as a build methodologist may not match his output; the owner may value him for timeliness (what changed this patch) more than for theory. That suggests the advisor needs a "last verified against update X" stamp more than it needs a Tactical Potato rule set.

### Gaps
- All Tactical Potato video content. To close this gap someone needs to pull transcripts from a different network, or the owner can name the specific videos he relies on.
- Whether he has stated views on Overframe or on calculators: nothing found.

---

## 4. Other sources, with quality notes

### Takeaway
The official wiki is the right place to verify stacking rules and current mod text, and it confirmed every stacking claim I tested. Two secondary creators supplied useful material: Sabuuchi for concrete criticism of Overframe builds, and NoSympathyy for 2025 modding guides that I did not have time to read.

### Cited Findings
- Official wiki pages used for verification (all fetched 2026-10-05): Roar, Galvanized Aptitude, Primary Merciless, Primary Deadhead, Hunter Munitions, Internal Bleeding, Faction Damage, Xata's Whisper, Nourish, Archon Shard, Armor, Scaldra, Techrot. Quotes appear in the sections where they are used. — [wiki.warframe.com](https://wiki.warframe.com/w/Faction_Damage)
- Sabuuchi, "Warframe: Overframe Is AWFUL (How NOT To Build)", 2024-05-27 (three weeks pre-U36), a stream reading through Overframe's tier list and top builds. Used in section 9. — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- Brozime, "THIS CAN'T BE SERIOUS | Overframe Warframe Tierlist", 2024-01-29. Title and date only; transcript blocked. — [Brozime Overframe tier list video](https://www.youtube.com/watch?v=4DffEaNakSE)
- NoSympathyy, "HOW TO ACTUALLY MOD YOUR WEAPONS | Warframe Weapon Modding Guide 2026" (published 2025-05-10) and "HOW WARFRAME'S ELEMENTS ACTUALLY WORK | Status Modding Guide 2026" (2025-08-05). These are long post-U36 guides; I have the first transcript (about 114,000 characters) but did not read it, so nothing from it is cited. — [NoSympathyy modding guide](https://www.youtube.com/watch?v=BOIsBUH8HwQ); [NoSympathyy elements guide](https://www.youtube.com/watch?v=yFQ6SNryGgI)
- Older written community guides surfaced by search and not used as authority because of age: Reddit "An Intermediate Guide to Weapon Modding" (2018 by its thread ID; excerpt: "Damage mods are always used except for Mesa's Regulators. Multishot mods are always used except on ..."), and a Fandom user blog "Rob's guide to modding your weapons" (excerpt: "You get most out of your raw damage weaponisation if you balance your damage-amplifying mods out. Remember the idea of relative mod impact."). COMMUNITY-CONSENSUS, outdated — [Reddit intermediate guide](https://www.reddit.com/r/Warframe/comments/8yru5t/an_intermediate_guide_to_weapon_modding/); [Rob's guide](https://warframe.fandom.com/wiki/User_blog:Deadfalk/Rob%27s_guide_to_modding_your_weapons)

### Inferences
- "Relative mod impact" (the Fandom blog's phrase) and TheKengineer's bucket maths are the same idea, taught for at least eight years. It is the stable core of expert modding and safe to build on.

### Gaps
- The NoSympathyy transcript is sitting unread; it is the most likely place to find explicit 2025-era thresholds (crit chance cut-offs, status chance targets). A follow-up pass should read it.
- I did not check the wiki's own modding guide pages, if any exist, beyond the mechanic pages above.

---

## 5. The standard decision process, thresholds, damage buckets and diminishing returns

### Takeaway
Experts agree on the process (read base stats, classify, fill one slot per multiplier before doubling up) and disagree only slightly on thresholds. Stated crit thresholds are "5% is not a crit weapon" and "20 to 25% is"; nobody I could read states a numeric "status chance is enough" threshold, and TheKengineer replaces that question with "expected procs per kill".

### Cited Findings

**Process and classification**

- Brozime's summary: "the big important thing about weapon modding is you want to increase your damage in diverse ways... by doing either multi-shot, damage, elementals, and crits." And: "add your basic damage mod, add some elementals. Multi-shot, if you have it, is extremely good. And then beyond that, crits are going to be really powerful for you." CREATOR-STATED (Brozime, 2023-12-09, pre-U36, aimed at new players) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- Brozime's diminishing-returns statement: "if two things are multiplicative, you want about even amounts of them to go up at the same time. And if things are additive, you would rather diversify unless you're getting extremely large numbers." He demonstrates that two elemental mods totalling more than Serration's value give less damage than Serration when elementals are already present. — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- TheKengineer's four roles: direct damage, status damage, converted Slash (Hunter Munitions, Internal Bleeding, stances), and primer. — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Community phrasing of the same split: "if it has more status, pick the 60% elemental damage and 60% status mod. if it has a good amount of crit chance (20%, 30%) then focus on crit." COMMUNITY-CONSENSUS (official forums, search excerpt, undated) — [Forums: Advanced get gud guide](https://forums.warframe.com/topic/1024432-advanced-get-gud-guide/)

**Crit thresholds**

- "Weapons with like 5% crit, you're not going to add these cuz it's just too inconsistent... whenever you're looking at a weapon that has like 25% crit chance, usually very worth it to go in on that." CREATOR-STATED (Brozime, 2023-12-09) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- "if you got a crit [chance] of 20 percent or above work with the crits". CREATOR-STATED (TheKengineer, 2020-05-11) — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)
- Low base crit is not disqualifying if a flat source exists: "Even if you're using a weapon with low critical chance but then stacking things like Arcane Avenger for the flat critical chance buff, you're still using, effectively, a critical-based weapon - just with extra steps." CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- "Almost any weapon worth its salt in the damage dealing department will have a high critical chance, and that's because critical damage multipliers are just that good." CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Post-U36 flat crit sources that move the threshold: each Puncture proc on the target adds 5 percentage points of crit chance "calculated as a final value after all the bonuses" (up to 25 at five procs); Cold procs add flat crit damage (0.1x for the first, 0.05x each to 0.5x at nine, 1.0x at ten). "As the cold critical damage bonus is a fixed flat value it's comparatively less effective the more built for critical hits your weapon is." CREATOR-STATED (TheKengineer, 2024-06-26, post-U36) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

**When to run Hunter Munitions or Internal Bleeding**

- Hunter Munitions is "one of the best mods in the game because slash procs are one of the best procs in the game... they do a ton of damage... that ignores enemy armor"; "don't just write mods off if they don't just increase damage." CREATOR-STATED (Brozime, 2023-12-09, pre-U36) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- "30% chance to apply Slash on Critical"; "The 30% trigger chance is... not affected by the weapon's Status Chance, or damage type distribution, besides being indirectly affected by its Critical Chance"; "Slash proc damage scales with damage multipliers. As such, Headshots, orange and red Critical Hits will greatly increase the damage dealt"; "their damage only depends on the weapons modded base Damage and is therefore not affected by elemental and physical damage mods." WIKI-CONFIRMED — [Hunter Munitions (wiki)](https://wiki.warframe.com/w/Hunter_Munitions)
- With both mods on one shot "only one Slash proc applies, with combined probability reaching 54.5% (or 79% below 2.5 fire rate)". WIKI-CONFIRMED — [Internal Bleeding (wiki)](https://wiki.warframe.com/w/Internal_Bleeding)
- Internal Bleeding only for forced-Impact weapons: see section 2. — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Post-U36 counterweight: "builds relying on armor stripping or slash procs have become weaker while builds brute forcing through the armor have come out ahead"; and a Slash proc out-damages the direct hit only "if the target has any more than 65% damage resistance". CREATOR-STATED (TheKengineer, 2024-07-11 and 2024-06-26) — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

**Why Serration or Hornet Strike is dropped when an arcane is equipped**

- Primary Merciless at rank 5: "Damage per Stack: 30%", "Total at 12 stacks: 360%", and "The damage bonus stacks additively with other damage mods like Serration." Stacks decay one at a time: "After reaching the maximum 12 stacks, the buff will take 48 seconds to fully expire." WIKI-CONFIRMED — [Primary Merciless (wiki)](https://wiki.warframe.com/w/Primary_Merciless)
- Primary Deadhead at rank 5: 120% per stack, 360% at three stacks, 24 s duration, +30% headshot multiplier, -50% recoil; "The damage bonus stacks additively with other damage mods like Serration." The trigger was changed from headshot kills to "On Weakpoint" kills in Update 44.0. WIKI-CONFIRMED — [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
- TheKengineer's rule (quoted in section 2): with the arcane "active almost constantly... you can safely drop the weaker of the two mods". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)

**Why faction mods are valued**

- Faction damage is "calculated as a total damage multiplier against the faction in question", is "multiplicative with other types of bonus of damage", and "is applied a second time to Damage over Time (DoT) from status effects created by it, known as 'double dipping'." Regular Bane mods reach x1.30, Primed Bane x1.55; sources are "additive with other sources of Faction Damage". WIKI-CONFIRMED — [Faction Damage (wiki)](https://wiki.warframe.com/w/Faction_Damage)
- "Faction damage is notoriously powerful due to being applied twice multiplicatively when dealing status damage." CREATOR-STATED (TheKengineer, 2024-05-01) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
- Brozime published "We Use Bane Mods Now | Multiplicative & Additive Damage Explained" on 2021-07-27. Title and date only. — [Brozime bane mods video](https://www.youtube.com/watch?v=OmKPbcHluWw)
- Counterpoint on convenience: a faction stat "is effectively locking the weapon to that faction or otherwise forcing you to accept a dud buff everywhere else." CREATOR-STATED (TheKengineer, 2022-02-02, about Rivens) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)

**Why multishot is near-mandatory**

- Multishot is its own multiplied term in the equation, and "Generally, multi-shot is great for every gun". CREATOR-STATED (TheKengineer, 2021-08-01 and 2022-02-02) — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg); [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- It also multiplies status application: his procs-per-shot formula is multishot x status chance. — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- "Multi-shot, if you have it, is extremely good." CREATOR-STATED (Brozime, 2023-12-09) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)

**When a second elemental beats a crit mod**

- "Some weapons, of course, aren't going to have good stats for crits... in those cases, usually adding elementals is going to be just fine." CREATOR-STATED (Brozime, 2023-12-09) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- Elemental mods of a damaging element also scale that element's proc (Toxin, Heat, Electric), which crit mods do too via modded damage; Gas clouds are not scaled by Heat or Toxin mods ("the only Elemental mods to improve the gas cloud damage are gas mods which currently do not exist for any weapons"). CREATOR-STATED (TheKengineer, 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

### Inferences
- Worked arithmetic from the wiki values (my calculation): with Merciless at full stacks the pure-damage bucket is 1 + 3.6 = 4.6. Adding Serration (+1.65) makes it 6.25, a 36% gain. The same slot spent on a first 90% elemental mod is a 90% gain to direct damage, and on a Primed Bane it is 55% to direct damage and 140% to damage-over-time procs (1.55 squared = 2.40). That is the whole reason experts drop Serration under a damage arcane and reach for Bane mods.
- A defensible classifier from the stated thresholds: base crit chance at or below about 10% is "not crit" unless a flat crit source is present; 20% and up is "crit"; the band between is a judgement call that should be settled by computing both builds.
- "Status chance is enough" should be computed, not thresholded: procs per shot = multishot x status chance, weighted by damage share, compared with shots to kill.
- For Slash conversion, the test is whether the target's armor damage reduction exceeds about 65% after whatever strip the player has; with a full strip, forced Slash loses its reason to exist.

### Gaps
- No source I read gives a numeric status-chance threshold for "status weapon", a crit-multiplier threshold, or a rule for when the third 60/60 mod beats a crit mod.
- The claim that Galvanized multishot and Galvanized Scope/Crosshairs stack behaviour is unchanged since 2021 is unverified.
- Secondary and melee damage arcanes (Secondary Merciless/Deadhead, Melee Influence, and the newer "Old Peace" arcanes named in a Tactical Potato title) were not checked on the wiki.

---

## 6. Element choice by faction and content after Update 36

### Takeaway
After U36, experts choose elements mainly for their status effect, not for the +50% faction bonus. TheKengineer's one-line faction map is Corrosive for Grineer, Magnetic or Toxin for Corpus, Heat for Infested, Viral for Orokin, Cold for Sentients, Electric for Murmur, with the explicit rider that another element is fine if its proc helps more. Brozime's practical default for guns is Heat, with Magnetic as the safe second choice because of Eximus Overguard.

### Cited Findings

**What U36 changed**

- "all enemy Health, shield and armor types are now gone; instead each enemy faction or subfaction has their own weaknesses and occasionally resistance to a handful of damage types affecting their entire hit point pool". CREATOR-STATED (TheKengineer, 2024-06-26; the video's current title is "All damage types explained (2024-2026)") — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- "Vulnerabilities and resistances have also been decoupled from health types and are now solely based on the enemy Faction." The table has columns for Grineer, Kuva Grineer, Corpus, Corpus Amalgam, Infested, Infested Deimos, Orokin, Sentient, Narmer, The Murmur, Zariman, Scaldra, Techrot and Anarchs. WIKI-CONFIRMED — [Damage (wiki)](https://wiki.warframe.com/w/Damage)
- Enemy armor: "all enemies that spawn [with] armor have a minimum of 200 and a maximum of 2,700"; resistance is "armor x 3, square rooted, then divided by 100", so 2,700 armor is 90%. CREATOR-STATED (TheKengineer, 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8). The wiki confirms a 2,700 cap and 90% maximum; the formula as my tool rendered it lacked the square root, which I believe is a rendering loss. WIKI-CONFIRMED for cap and maximum; formula rendering UNKNOWN — [Armor (wiki)](https://wiki.warframe.com/w/Armor)
- "If you're on steel path almost every Grineer unit, and I must stress almost, will have over 2,000 armor." — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

**Per-faction weaknesses** (TheKengineer, 2024-06-26, unless marked)

- Grineer: vulnerable to Impact and Corrosive. Kuva Grineer take half damage from Heat. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Corpus: vulnerable to Puncture and Magnetic; Magnetic's bonus applies to health as well as shields. Jupiter Amalgams are vulnerable to Electric and Magnetic, not Puncture, and resist Blast. Toxin has no bonus but "has the unique trait of bypassing all normal Shields". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Infested: vulnerable to Slash and Heat. Deimos (Cambion Drift) Infested: vulnerable to Blast and Gas, resist Viral. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Orokin / Corrupted: vulnerable to Puncture and Viral, resist Radiation. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Sentient: vulnerable to Cold and Radiation, resist Corrosive. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Murmur: vulnerable to Electric and Radiation, resist Viral. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Narmer: vulnerable to Slash and Toxin, resist Magnetic. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Scaldra: "The Scaldra take increased damage from Impact and Corrosive Damage, but reduced damage from Gas." WIKI-CONFIRMED — [Scaldra (wiki)](https://wiki.warframe.com/w/Scaldra)
- Techrot: "The Techrot take increased damage from Gas and Magnetic damage, but resist Cold damage." WIKI-CONFIRMED — [Techrot (wiki)](https://wiki.warframe.com/w/Techrot)

**The expert summary and its caveat**

- "very broadly you want corrosive against the Grineer, magnetic or toxin against the Corpus, heat against the infested, viral against the Orokin, cold against sentients and electric against the Murmur; however using other damage types is plenty acceptable especially if the status effect is more beneficial to you". CREATOR-STATED (TheKengineer, 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- "some like Toxin and Radiation are more effective directly... others shine brightest [as] status effects without relying on damage, like cold and viral; yet others need a hybrid combo of damage and status chance to do their best work, like heat and blast". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- On physical types: "choosing it at the cost of an otherwise worse weapon for the job will make the net effect relatively low"; "puncture shouldn't be modded for, merely enjoyed when it exists". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Corpus need less tailoring: Elite Crewmen "have successfully become weaker than infested chargers... This weakness is also a big reason why faction specific builds aren't as important [against] enemies like the Corpus; your sheer damage values needed to beat other factions will also beat the Corpus". CREATOR-STATED (TheKengineer, 2024-07-11) — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)

**Status effects that drive the choice** (TheKengineer, 2024-06-26)

- Viral: first proc +100% damage to health, +25% per extra proc to +325% at ten. "so long as an enemy isn't immune to viral procs... it is always going to be a powerful addition to your setup"; the damage penalty versus Murmur and Deimos Infested "does not interfere with this bonus". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Heat: "temporarily removes half of an enemy's existing armor over the course of 2 seconds", refreshes all existing Heat procs on re-application, and deals 50% of modded damage per second scaled by Heat mods. Against Steel Path Grineer "heat will cause them to take at least twice as much damage from all sources; in the majority of cases... over three times". Downside: "you have to wait 2 seconds for the full bonus which in Warframe terms is a long time". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Corrosive: first proc removes 26% armor, each further proc 6%, capping at 80% with ten procs (bosses typically four procs, 44%); lasts 8 s. One proc on a max-armor enemy "will provide you with a 125% damage bonus". "corrosive is now half as effective against Grineer" as a damage type than before. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Magnetic: +100% damage to shields and Overguard on the first proc, +25% per proc to +325%; breaking shields or Overguard under Magnetic forces an Electric proc. He flags the on-break damage as bugged at the time. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Blast (reworked in U36): procs detonate for 300% of the accumulated triggering damage in 5 m if the target dies or reaches ten stacks, otherwise only 30%. "to get the most out of blast you need reliable status procs, rapid kills and clustered targets". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Electric: 50% of modded damage per second, scaled by Electric mods, to the target and enemies within 3 m, starting immediately; "in anything but extremely high enemy density... the AOE will see limited value". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Gas: cloud of 3 m growing to 6 m, lingers after the target dies; capped at ten procs with oldest replaced; "needs a controlled situation to really shine". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Cold: slow from 50% to 90%, flat crit damage, freeze at ten procs; "a valuable support type to go alongside others". Overguarded enemies cap at four Cold stacks. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Radiation: confusion for 12 s; "boss type enemies will not get confused". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

**Brozime's practical defaults**

- For a weapon's built-in bonus element his table is Heat-first, with "Magnetic is a safe choice for any gun as it will always help them deal with Eximus more effectively". CREATOR-STATED (Brozime, 2025 to 2026) — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
- For new players, pre-U36: "the really good combination that you can use on everything... is you include viral... and then if you have extra room for more elementals, adding heat is pretty much always a good idea. If you can only fit one elemental, either toxin or heat are excellent by themselves." Also: "before you get to actually much more difficult content in Warframe, what elementals you're actually using aren't going to matter too much." CREATOR-STATED (Brozime, 2023-12-09, pre-U36) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)

### Inferences
- A faction-to-element lookup for the advisor, from the sources above. Grineer and Scaldra: Corrosive (and Heat for the armor halving). Corpus: Magnetic, or Toxin to bypass shields. Infested: Heat. Corrupted: Viral. Murmur: Electric or Radiation, and do not rely on Viral damage (the proc still works where enemies are not immune). Techrot: Magnetic or Gas, avoid Cold as damage. Sentient: Cold or Radiation. Mixed content: Viral + Heat remains the generalist pair because both are valued for procs that work on every faction with health and armor; Brozime's pre-U36 advice and TheKengineer's post-U36 proc descriptions agree on that.
- Because Heat's armor halving and Corrosive's stacking are both now modest multipliers (roughly 3.6x and up to about 5x on a max-armor target, by my calculation from his formula) and useless on unarmored targets, an advisor should make element choice depend on (a) faction, (b) whether the squad or Warframe already strips armor, and (c) the weapon's ability to apply the proc at all.
- Brozime's Heat-first progenitor picks and TheKengineer's "Corrosive for Grineer" are not in conflict: one is about a fixed bonus element that should work everywhere, the other about per-faction optimisation.

### Gaps
- The full wiki weakness table could not be read; Kuva Grineer, Zariman and Anarch columns are unverified, and the Narmer and Amalgam rows above rest on the creator video alone.
- No 2025 or 2026 creator source was read that restates the faction map for Scaldra, Techrot or Anarchs, or for content such as Elite Deep Archimedea, Temporal Archimedea or Perita Rebellion.
- Which enemies are immune to Viral procs, and proc caps on bosses, were not enumerated.
- Whether the Magnetic on-break bug he flagged in 2024 was fixed is unknown.

---

## 7. Assumptions about conditional bonuses

### Takeaway
Experts assume a conditional bonus only when the weapon and playstyle will satisfy its trigger in normal play, and they separate "kill-triggered and forgiving" bonuses (assume up) from "headshot-triggered and fragile" bonuses (assume only for precise weapons). They also discount ramp-up time explicitly.

### Cited Findings
- Kill-triggered, decays one stack at a time: Galvanized multishot ("if you intend to kill with that weapon even just a few times a minute the galvanized multishot mod is better"). CREATOR-STATED (TheKengineer, 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Merciless decays slowly: "When the buff times out, one stack is lost and the buff duration resets. After reaching the maximum 12 stacks, the buff will take 48 seconds to fully expire." WIKI-CONFIRMED — [Primary Merciless (wiki)](https://wiki.warframe.com/w/Primary_Merciless)
- Headshot-triggered: Galvanized Scope/Crosshairs only "if and only if you are scoring headshot kills", only while aiming, with a 12 s window; suited to "weapons like the Rubico Prime where you can get pinpoint headshots with ease"; not for weapons that "kill with status" or "cannot reliably go for the headshot". CREATOR-STATED (TheKengineer, 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Deadhead needs weak-point kills (since Update 44.0), and "Kills from some status procs on the target's weak point do not count as a weak point kill", with Electricity and Gas procs noted as exceptions. WIKI-CONFIRMED — [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
- Status-count bonuses are not assumed at full value on a self-priming weapon: averaged damage over the kill is what counts, and a weapon that kills in one or two shots gets nothing. CREATOR-STATED (TheKengineer, 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Arcane uptime is a judgement the player makes: "it's a case of how reliably you think you'll have your arcane active". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Conditions that depend on other players are not assumed: two casts of the same buff do not stack ("If your ally has Eclipse, use Roar. If your ally is using Roar, bring Eclipse"), and Gas or Heat stacks can be overwritten or inherited from allies' weaker procs. CREATOR-STATED (TheKengineer, 2024-05-01 and 2024-06-26) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Range-gated conditions are called out per weapon (Fulmin's forced Impact only within 9 m, Quellor's within 18 m). CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Headshots as a baseline: weak-point hits "basically double your damage output". CREATOR-STATED (TheKengineer, 2020-05-11) — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)
- An Overframe build title that Sabuuchi reads out, "effective without conditionals and Theory crafting BS that fails in game", shows that some builders market the opposite assumption (nothing conditional) as a virtue. COMMUNITY-CONSENSUS (single example) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)

### Inferences
- Suggested default assumptions for the advisor, each shown to the user and switchable: kill-stack bonuses (Galvanized multishot, Merciless-type arcanes, CO kill stacks) on at full value for mission play, off for single-target boss scenarios; headshot or weak-point bonuses on only for weapons flagged as precise (single-target hitscan, snipers, bows) and off for AoE, beam-sweep and status-kill builds; status-count bonuses computed from expected distinct statuses over the kill, not set to maximum; squad buffs off unless the user says otherwise.
- Report two numbers: sustained (stacks up) and opening (no stacks). The gap between them is itself information experts use.

### Gaps
- No creator statement was found on Incarnon-form uptime assumptions (how often the Incarnon charge is available) or on aim-conditioned mods other than the Galvanized crit mods.
- Whether the Galvanized crit mods still lose all stacks at once in 2026 is unknown.

---

## 8. Outside sources of weapon damage and how they change the build

### Takeaway
The outside buffs fall into the same buckets as mods, so each one devalues the mods that share its bucket and raises the value of everything else. Roar sits in the faction bucket, Vex Armor-style buffs in the pure-damage bucket, Nourish in the elemental bucket, Xata's Whisper adds a separate hit that inherits most multipliers, and armor strip removes the reason for Corrosive, Heat-for-armor and Slash conversion.

### Cited Findings

**Roar**

- "The damage buff is considered Faction Damage Bonus, additive with other sources of Faction Damage, and multiplicative with other types of bonus of damage." "As faction bonus damage, the bonus is used twice in the calculation of status damage." Rhino's Roar is 50% at max rank; subsumed is 30%. Worked example on the page: 100 x (1 + 1.65) x (1 + 0.5 + 0.3) = 477. WIKI-CONFIRMED — [Roar (wiki)](https://wiki.warframe.com/w/Roar)
- "Roar should be your default option for damage increasing as a result of being both reliable and effective... You never need to question if your weapon is using additive CO or not." It also buffs abilities and allies. CREATOR-STATED (TheKengineer, 2024-05-01, pre-U36 by seven weeks; the ability mechanics described are confirmed by the current wiki) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
- "subsuming Rhino's Roar onto your Warframe or have an ally bring Roar will be an incredible boost to your overall output with these mods, just like with any other status damage build." CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)

**Eclipse**

- Eclipse's damage bonus is neither faction nor pure damage; it multiplies with pure damage mods, but on weapons with additive CO "that whole CO bonus also ignores Eclipse as if it were a pure damage bonus", so "Eclipse has anti-synergy with status priming". Subsumed Eclipse is "only a 30% base increase". CREATOR-STATED (TheKengineer, 2024-05-01) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
- Eclipse beats Roar only "if you do have non-additive CO and you're relying on direct damage, not status damage, and you already have a faction bonus applied from something else". "This rules out almost every melee weapon, any build relying on Hunter Munitions or other forced slash effects, any build relying on heat inherit or electric spreading, or any hit-scan gun where additive CO is desirable". — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
- Exceptions: keep Eclipse on Mirage; thrown melee (glaives, Exodia Contagion) "get the benefit of Eclipse twice multiplicatively". Eclipse costs 40% of Roar's energy per second. — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)

**Xata's Whisper**

- Adds a Void damage instance of 26% at max rank that "is based on a percentage of the total weapon damage", is "Affected by base, elemental, critical, and faction damage mods", and "double dips on faction damage, and body part weaknesses." It "can proc the Void Status Effect based on the weapon's total status chance." WIKI-CONFIRMED — [Xata's Whisper (wiki)](https://wiki.warframe.com/w/Xata%27s_Whisper)
- Void damage has "a 50% bonus against overguard"; the Xaku version is "discount" Void that cannot damage Eidolon shields or spectral Thrax. The Void proc pulls projectiles toward the target's head. CREATOR-STATED (TheKengineer, 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

**Nourish**

- Viral bonus of 75% on Grendel, 45% subsumed; it is "additive with existing elemental and IPS mods. Think of it like adding a +75% Viral mod to your weapons (which is buffed by Ability Strength)." WIKI-CONFIRMED — [Nourish (wiki)](https://wiki.warframe.com/w/Nourish)
- "You can either mod for viral in that stage or get your viral from abilities and companions, and just go full damage on the primary weapon." CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)

**Pure-damage ability buffs (Vex Armor and similar)**

- Vex Armor and Shooting Gallery are listed in the pure-damage bucket with Serration and the weapon arcanes, all added together. CREATOR-STATED (TheKengineer, 2021-08-01) — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)

**Armor strip**

- With armor removed, "Elite Lancers become comparable to Elite Crewmen while Heavy Gunners would fall below Corpus Tech"; 90% of a max-armor enemy's effective health is the armor. CREATOR-STATED (TheKengineer, 2024-07-11) — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)
- But post-U36 "the major factional strategies, that's armor stripping for the Grineer, shield stripping or bypassing on the Corpus, still work but are much weaker". A level 300 Steel Path Heavy Gunner has "about a quarter of the effective hit points they had before" with about 3.5x the base health. — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)
- Partial strip is now worth much more than it was, and the last 20% much less: at max armor an 80% strip leaves 40.2% damage reduction. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Unarmored heavy targets get no such shortcut: "The unarmored Anatomizer and Boiler however do not offer such solutions, remaining a sack of hit points". — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)

**Archon Shards** (values WIKI-CONFIRMED; Tauforged in brackets)

- Crimson: "+25% (+37.5%) Melee Critical Damage", "+25% (+37.5%) Primary Status Chance", "+25% (+37.5%) Secondary Critical Chance". — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)
- Violet: "+30% (+45%) Primary Electricity Damage. Gain an additional +10% (+15%) per Crimson, Azure, or Violet shard equipped"; "+25% (+37.5%) Melee Critical Damage. When max Energy is over 500, the damage boost doubles". — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)
- Emerald: "Toxin Status Effects deal +30% (+45%) more damage"; "Increase max stacks of Corrosion Status by +2 (+3)". — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)
- Topaz: "Increase Secondary Critical Chance by 1% (1.5%) every time you kill an enemy affected by Heat Status. Max 50% (75%)". — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)
- "All bonuses are additive with similar mods". — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)
- Emerald full-strip is "far less important" post-U36: removing the final 20% of armor at the cap is worth roughly a two-thirds damage increase where it used to "more than quadruple your damage". CREATOR-STATED (TheKengineer, 2024-06-26; the transcript garbles the fraction, and two-thirds is my calculation from his formula) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Sabuuchi mocks using two Emerald shards for armor strip when the Warframe already has a strip ability: "you can save your shards for other things". CREATOR-STATED (Sabuuchi, 2024-05-27, pre-U36) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)

**Companions and primers**

- A separate primer that applies three or more statuses makes the CO mods "the single best pure damage mod". CREATOR-STATED (TheKengineer, 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Tazicor as a "Primer for Manifold Bond"; Adarza Kavat for "Critical Buffs". CREATOR-STATED (Brozime, 2024-11-05) — [Best Companions](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Best+Companions)
- In 2020 TheKengineer showed Vigilante set mods on a sentinel weapon granting the set's crit-tier bonus to the player's primary. CREATOR-STATED (TheKengineer, 2020-05-11); current status UNKNOWN, do not implement without checking — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)

**Focus and operator**

- Zid-An Uskos operator arcane gives secondaries "a fairly large Heat damage bonus" after 100 operator kills per mission; Madurai's Thara grants up to 50% Strength for 30 s; Naramon Power Spike sustains melee combo. CREATOR-STATED (Brozime, 2026) — [Tauron Weapons & Focus](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Tauron+Weapons+%26+Focus); [Focus](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Focus)

**Squad buffs**

- Fire-rate buffs from allies can break a build: Wisp's haste mote can push a weapon over Internal Bleeding's 2.5 fire-rate threshold and "halve your slash output per shot". CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- The MR 30 relay blessing is faction damage, additive with Roar and Bane mods; the wiki lists "Damage Blessing: 25%". CREATOR-STATED (TheKengineer, 2024-05-01) and WIKI-CONFIRMED — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ); [Faction Damage (wiki)](https://wiki.warframe.com/w/Faction_Damage)

### Inferences
- How each buff should change the recommended mods (my derivation from the bucket rules above):
  - Roar present: Bane mods lose value (a Primed Bane goes from x1.55 to a relative x1.42 on direct damage with subsumed Roar, by 1.85 / 1.30); damage-over-time builds gain the most; no change to element choice.
  - Vex Armor or another large pure-damage buff: drop Serration or Hornet Strike and the CO mod first; elementals, crit, multishot and Bane all gain relative value.
  - Nourish present: the weapon does not need to mod for Viral; spend those slots on Heat, a Bane mod or crit. If the weapon already has Toxin or Cold, check how the added Viral combines (not verified).
  - Xata's Whisper present: everything that multiplies total damage (crit, faction, elemental, headshots) is amplified; it favours crit and Bane builds and high-status weapons.
  - Reliable full armor strip present (ability or squad): remove Corrosive and Slash-conversion mods (Hunter Munitions, Internal Bleeding), and stop valuing Heat for its armor halving; value Viral and raw multipliers instead. Partial strip present: Heat and Corrosive still stack with it since Heat halves "whatever is left".
  - Crimson primary status or secondary crit shards: treat as additive mod-equivalents; they can move a borderline weapon across the crit or status threshold.
  - Violet electricity shards: an extra Electric elemental mod for primaries; note it will combine with the weapon's elements by the usual ordering rules (ordering not verified for shard-sourced elements).
  - Emerald Toxin shards: raise the value of Toxin-proc builds; Emerald Corrosive stacks matter less than before U36.

### Gaps
- Not verified against the wiki in this pass: Toxic Lash, Smite Infusion, Vex Armor's current numbers, Eclipse's current numbers, Shock Trooper-style elemental buffs, Arcane Avenger's current value, and whether Nourish's Viral merges with weapon elements. The task named these; I have no sourced content for the first two at all.
- Topaz shards: only the Heat-kill secondary crit option was returned by the wiki fetch; the Blast option the brief mentions was not confirmed.
- TheKengineer's own shard videos were not readable, so his judgement on which shard colours are worth it for weapon builds is missing.
- Specific armor-strip abilities and their percentages (and the Focus Unairu strip) were not enumerated.

---

## 9. Criticisms of Overframe and of calculator DPS numbers

### Takeaway
The community's complaint about Overframe is about its *curation*, not its simulator: builds are ranked by popularity, many top builds are years old or unexplained, and the tier list is a vote. TheKengineer explicitly recommends Overframe's build simulator while declining to vouch for its builds. The complaint about DPS numbers generally is that they are steady-state, single-target, all-conditions-met figures that hide ramp-up, falloff, proc weighting, attack-type quirks and overkill.

### Cited Findings

**Overframe's builds and tier list**

- "the issue is a majority of the community doesn't know what [...] they're talking about". CREATOR-STATED (Sabuuchi, 2024-05-27) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- The tier list is a rolling popularity vote: "overframe votes do reset... every day you can come here and you can vote for the frame that you want". — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- Concrete weapon-tier complaints (pre-U36, May 2024): Ignis in S tier ("low-level trash mob clearing for base star chart and early steel path... maybe just because the majority of the player base doesn't even make it to steel path"); Torid in A tier ("criminal... probably like top five Primary Weapons at the moment") alongside Tenet Glaxion and Ogris; Kuva Sobek rated high although it is "good with like three asterisks next to it... if you use it on a specific frame with this damage buffer with this element multiplier with this shard setup... the only reason that it's up this high I guarantee you is entirely because of Saryn". — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- Concrete build complaints: "we got galvanized aptitude with serration"; "what's this frostbite doing here, it's not triggering cold" (a Primary Frostbite arcane on a build with no Cold source); "not only are you using aptitude with heavy caliber... heavy caliber... gives you a ton of spread, why do you have stabilizer then"; using Firestorm on Ignis when "the damage tapers off at the tip"; a build headlined as "future meta" that is a long-established setup. — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- Staleness and duplication: "the top build is from update 27 and is only one Forma; the second best build... still an old build; all of the builds are old"; "either the builds are done by one or two people... the builds are terrible and are laughable, or the builds are literally the same copy pasted config that's on every other weapon". — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- He also finds builds he likes and bookmarks two to try, so the verdict is "unreliable", not "always wrong". — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- TheKengineer: "Check out the website overframe.gg for a powerful modding simulator. I can't vouch for builds there. They're user submitted and user rated, so expect a lot of subpar builds to get pushed upwards. Instead, the real power of that website is in being able to swap in mods yourself, including a customized riven mod". CREATOR-STATED (TheKengineer, 2022-02-02) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Brozime made a reaction video titled "THIS CAN'T BE SERIOUS | Overframe Warframe Tierlist" (2024-01-29). Title only. — [Brozime Overframe tier list video](https://www.youtube.com/watch?v=4DffEaNakSE)
- Reddit, search excerpts only (dates approximate from thread IDs; not read in full). COMMUNITY-CONSENSUS:
  - "The tier list for warframes on overframe is very bad. It represent the popularity of weapons/warframes more than their strength." — [Is over frame good?](https://www.reddit.com/r/Warframe/comments/10m8cvd/is_over_frame_good/)
  - "Overframe is driven by popularity not performance. a lot of builds are either straight up bad, situationnal, require specific preparation..." — [Is Overframe a reliable source for builds?](https://www.reddit.com/r/Warframe/comments/14wycyu/is_overframe_a_reliable_source_for_builds/)
  - "Largely due to the top builds for a lot of frames and weapons being pretty bad. Also the tier list is wildly inaccurate because it's based ..." — [Why does Overframe get so much hate?](https://www.reddit.com/r/Warframe/comments/1htu9ak/curious_but_why_does_over_frame_get_so_much_hate/)
  - "It's a bad resource for beginners because many builds are outdated, or have specific use cases that aren't explained." — [I've heard Overframe is crap](https://www.reddit.com/r/Warframe/comments/1hv15l0/ive_heard_overframe_is_crapwhere_is_a_good_place/)
- Dissent, also search excerpts. DISPUTED:
  - "Overframe is good as a basic guideline, provided the build is from a recent update, especially now with the status rework. But understanding ..." — [Don't use overframe builds](https://www.reddit.com/r/Warframe/comments/1dzrzr3/dont_use_overframe_builds/)
  - "I'd say that overframe is decent for weapon builds if there is a good description about the build, but for warframe builds it's pretty bad." — [How to tell good from bad overframe builds?](https://www.reddit.com/r/Warframe/comments/xnphcm/how_to_tell_good_from_bad_overframe_builds/)
  - Thread title: "Tried overframe, it's not as bad as everyone says." — [Tried overframe](https://www.reddit.com/r/Warframe/comments/1hnj4xz/tried_overframe_its_not_as_bad_as_everyone_says/)
- "Learn HOW to mod, not WHAT to mod." COMMUNITY-CONSENSUS (Reddit, search excerpt) — [Warframe youtube recommendations?](https://www.reddit.com/r/Warframe/comments/1ahtyd0/warframe_youtube_recommendations/)

**What calculator DPS numbers get wrong** (each item is a specific expert-stated mechanism)

- Ramp-up: the "first shot effect" means average damage to the kill is below the displayed maximum; in his toy example a CO mod shows 340% but averages 220% over two shots, losing to Primed Point Blank's flat 265%. — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Proc weighting: status chance does not say which statuses land; with the Tenet Diplos example "even after 12 different status procs are applied there's a less than one in four chance of all five status types being represented". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Attack type: the same mod is additive on hitscan, multiplicative on projectiles and absent on radial damage, "usually", and a mod "offering you extra damage" may give none. — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ); [Galvanized Aptitude (wiki)](https://wiki.warframe.com/w/Galvanized_Aptitude)
- Range and falloff: projectile falloff, explosion falloff and melee follow-through are outside the arsenal number; minimum-damage values are "only known experimentally". — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- Conditions: headshot-kill and aim requirements, 12 s windows, weak-point-only arcanes. — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA); [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
- Multi-target value: Blast's 300% area detonation, Electric and Gas area damage, and punch-through are worth nothing in a single-target figure and a great deal in a crowd, and the reverse for sparse enemies. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Time-to-effect: Heat's armor halving takes 2 s, "a long time to kill most enemies". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Squad interference: Heat inherit (the first Heat proc's owner and modifiers govern the stack, "even another player") and Gas's ten-proc cap with oldest-replaced. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Enemy-side rules: armor cap, faction multipliers, proc caps on bosses, and damage attenuation ("more damage in leads to more damage resisted... in strong cases you functionally are fighting an invisible timer"). — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)
- Overkill: typical Steel Path heavy units have "single digit millions of effective hit points", so beyond that extra damage buys nothing; "faction specific builds aren't as important" against weak factions. — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)
- Weak points: headshots roughly double damage and are player-dependent. — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)
- External buffs that break mods: a fire-rate buff halving Internal Bleeding's output. — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)

### Inferences
- The owner's distrust is well founded for Overframe's *rankings*, and the fair summary is "popular, not vetted, often stale". The simulator underneath is treated as sound by at least one of the owner's trusted creators, so the advisor does not need to distance itself from calculation, only from uncurated crowd ranking and from single-number output.
- The specific Overframe failure modes map to checks the advisor can run on its own output: redundant pure-damage stacking (Serration + CO mod + arcane), an arcane whose trigger the build cannot meet (Frostbite without Cold), self-contradicting mod pairs (Heavy Caliber with Stabilizer), a range mod on a weapon with falloff, a weapon's rating depending on an unstated Warframe, and a build not re-validated since a named update.

### Gaps
- No full Reddit thread was read; vote counts, dates and the strongest counter-arguments are missing. The official forums were not searched for Overframe sentiment.
- I found no expert statement that Overframe's *displayed numbers* are computed incorrectly; the criticism found is about builds, tiers and what the number leaves out. If the owner believes the arithmetic itself is wrong, that needs a separate check.
- Sabuuchi's examples are from May 2024 (pre-U36); the specific builds have likely changed.
- Brozime's and Tactical Potato's own words on Overframe were not obtained.

---

## 10. Myths and outdated advice still repeated

### Takeaway
Most stale advice is pre-U36 element lore (health-type matching, Corrosive as a requirement, Radiation for alloy armor) or pre-arcane stacking habits (always Serration, the percentage on the mod is the gain). The corrections below each have a dated source.

### Cited Findings
- **"Match the element to the enemy's health or armor type" (ferrite, alloy, flesh, proto shield).** Replaced: health types were removed; weaknesses are per faction. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8); [Damage (wiki)](https://wiki.warframe.com/w/Damage)
- **"Radiation for the toughest Grineer / alloy armor."** TheKengineer taught this in 2020 ("if you're going against the hardiest of Grineer units you can switch onto radiation"). His 2024 correction: "radiation no longer has an up to seven times damage bonus against alloy armored units, making it much worse at taking down enemies like Elite Lancers and Bombards". — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Corrosive is mandatory against Grineer and full strip is the goal."** Corrected: Corrosive damage is "half as effective against Grineer" as before, a single proc is now worth far more than it was, and the last 20% of strip is worth far less. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Enemy armor scales forever, so Slash or strip is the only way."** Corrected: armor caps at 2,700 (90%); "builds relying on armor stripping or slash procs have become weaker while builds brute forcing through the armor have come out ahead". — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ); [Armor (wiki)](https://wiki.warframe.com/w/Armor)
- **"Slash procs need a Slash weapon."** "a slash proc from a non-slash weapon still works just fine", because the proc uses overall modded damage. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Slash mods make Slash procs hit harder."** "applying slash mods to your weapon will increase slash damage and the chance [the] status proc you land is a slash proc but it does nothing to increase the damage of the slash status effect itself". — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Slash is the strongest damage-over-time."** "slash is actually the weakest for raw damage out of all status effects. What makes it desirable at all is that it skips armor entirely". CREATOR-STATED (TheKengineer, 2021-06-19; proc factors unchanged in his 2024 video) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- **"Internal Bleeding / Hemorrhage are a Hunter Munitions for any weapon."** Only for weapons with forced Impact on their main damage. — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- **"+165% damage means +165%."** Only for the first bonus in a bucket. — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
- **"Always slot Serration / Hornet Strike."** No longer true with a damage arcane or CO mod: "there's no point stacking three sources of pure damage". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- **"Bane mods are a waste."** Brozime's 2021 title "We Use Bane Mods Now" marks the turn; the wiki confirms the multiplicative and double-dip behaviour. — [Brozime bane mods video](https://www.youtube.com/watch?v=OmKPbcHluWw); [Faction Damage (wiki)](https://wiki.warframe.com/w/Faction_Damage)
- **"Blast is useless" and "Gas is useless".** Blast was fully reworked in U36 into an on-kill area detonation; Gas "has been triple buffed" in its damage modifiers. Both are conditional on grouped enemies. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Viral is strong because of its damage bonus."** Viral damage lost its Grineer and Corpus bonuses and is halved against Murmur and Deimos Infested; its value is the proc. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Impact is the anti-shield type; Puncture is the anti-armor type."** Post-U36 Impact is +50% versus Grineer and Puncture +50% versus Corpus and Orokin, with no armor-ignoring component. — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Galvanized status mods don't work on projectile weapons."** True as a bug in July 2021; fixed in Hotfix 30.5.5. They still never apply to AoE. — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA); [Galvanized Aptitude (wiki)](https://wiki.warframe.com/w/Galvanized_Aptitude)
- **"Heat inherit is a bug that will be fixed."** He called it a bug in 2021 ("I'm absolutely certain this is a bug"); in 2024 he describes it as "a mechanic known as heat inherit" and builds advice around it. — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **"Eclipse is a final multiplier, so it beats Roar."** "Unfortunately that's not quite true"; additive CO ignores it. — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
- **"Deadhead needs headshot kills."** Changed to weak-point kills in Update 44.0. — [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
- **"Primary Merciless doubles your ammo."** The "+100% Ammo Maximum bonus" was "Removed" in Update 32.0 (2022-09-07). — [Primary Merciless (wiki)](https://wiki.warframe.com/w/Primary_Merciless)

### Inferences
- A cheap, high-value safeguard: tag every rule in the advisor with the update it was last checked against, and refuse to apply element rules whose source predates U36.
- Even the owner's trusted creators have been wrong or overtaken (TheKengineer on Heat inherit and on Radiation; Brozime's "Viral on everything" for new players). The advisor should prefer the newest dated statement and say so.

### Gaps
- I did not find a source that lists "myths still repeated in 2026" as such; the list above is assembled from old-versus-new statements by the same creators and the wiki.
- TheKengineer's three Mythbusting videos (topics listed in his catalogue, including "Beam weapons use multishot wrong" and "Blast damage is useless") were not read.

---

## 11. Quality-of-life factors weighed against raw damage

### Takeaway
Experts treat handling as a set of veto conditions, not as a score: a build that reloads constantly, cannot hit heads, runs dry, or only works inside 9 m is downgraded regardless of its number. They name the specific downside each time.

### Cited Findings
- Negative utility stats can ruin a weapon: "Increased recoil can make some guns hard to control, while reduced magazine can see you reloading far too often." Positive utility is rarely worth a slot, with named exceptions such as reload speed on Tigris Prime. CREATOR-STATED (TheKengineer, 2022-02-02) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Range is a threshold, not a maximisation target: "range is simultaneously crucial and forgettable, as it's mostly a case of having enough range to be effective". For shotguns, Galvanized Acceleration nearly doubling range is "a pretty big deal", but if capacity is short "try it out both ways and see which feels best for your playstyle, as there's no strict right answer". CREATOR-STATED (TheKengineer, 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
- Range-gated mechanics are stated per weapon (Fulmin 9 m, Quellor 18 m, Catchmoon 9 m). — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Accuracy trade-offs are a real cost: he declines Heavy Caliber on a bow because "I want to keep the accuracy". CREATOR-STATED (TheKengineer, 2020-05-11) — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)
- Sabuuchi on the same trade: Heavy Caliber "gives you a ton of spread, why do you have stabilizer then"; and on Ignis range mods, "the damage tapers off at the tip, you actually want to shotgun things with the flamethrower". CREATOR-STATED (Sabuuchi, 2024-05-27) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- Ammo economy interacts with fire-rate buffs: "This is especially important for the less ammo efficient weaponry." CREATOR-STATED (TheKengineer, 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
- Fire rate is not always good: "weapons with high damage attacks using a few shots may find attack speed just less valuable, especially if you're one-shotting enemies." CREATOR-STATED (TheKengineer, 2022-02-02) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Arcanes carry handling stats that matter to the choice: Merciless +30% reload speed; Deadhead -50% recoil and +30% headshot multiplier. WIKI-CONFIRMED — [Primary Merciless (wiki)](https://wiki.warframe.com/w/Primary_Merciless); [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
- Crowd control from procs is counted as value: Cold slowing "making it much easier to aim at the enemy especially at weak points"; Impact stagger; Heat panic; Electric stun; Radiation "is mostly about getting them to not be shooting at you". CREATOR-STATED (TheKengineer, 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Fun is treated as legitimate: choosing a damage type "at the cost of an otherwise worse weapon for the job... whether that's a weapon that's less powerful or a weapon that's less fun". CREATOR-STATED (TheKengineer, 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- Capacity and investment are part of the recommendation: Galvanized mods cost more endo and capacity ("going from four with a forma on Fatal Acceleration to six"); Brozime shows a no-Forma, no-Catalyst Diriga build and lists cheaper sentinel-weapon options beside the expensive ones. — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA); [Best Companions](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Best+Companions)
- Brozime's grade B is defined by handling or niche: "Powerful weapons that are held back by a downside or niche". — [Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)
- Tactical Potato's title "DE Fixes Vadarya Prime's Biggest Issue!" (2025-08-28) indicates a weapon judged on a handling problem; content not read. — [Vadarya Prime video](https://www.youtube.com/watch?v=P7u6z2Qu57c)

### Inferences
- How a recommendation should surface these: beside the damage figure, show plain flags computed from the build, for example "reloads every N seconds", "ammo lasts about N seconds of fire", "recoil or spread increased by X", "effective range N m (falloff from N m)", "needs weak-point kills", "only works under 2.5 fire rate", "no punch-through", "AoE: status-count mods do nothing". Offer the highest-damage build and a "comfortable" alternative when the top build trips a flag.
- Treat capacity, Forma count and endo cost as constraints up front, since the app is inventory-aware.

### Gaps
- No creator content was read on self-stagger or punch-through specifically; both were named in the brief. TheKengineer's "Accuracy" and "Utility Primaries" videos likely cover handling and were not accessible.
- No source gives numeric comfort thresholds (acceptable reload time, minimum ammo efficiency).

---

## 12. What these experts would want from an inventory-aware advisor, and what would make them distrust one

### Takeaway
No creator has, in anything I could read, described an ideal advisor; this section is inference from how they teach and what they criticise. The consistent signals are: explain the reason for each slot, state the assumptions and the content the build is for, show what the number leaves out, date everything, and let the user swap mods and see the effect.

### Cited Findings
- TheKengineer's actual use of a tool: he values a simulator for "being able to swap in mods yourself... to allow you to see if the riven you've rolled is better or worse than what you had before in your personal setup", and distrusts builds that are "user submitted and user rated". CREATOR-STATED (TheKengineer, 2022-02-02) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- He has a video about AlecaFrame (an inventory-reading companion app) and one about WFInfo in his catalogue, so inventory-aware tools are within what he covers. Content not read. — [TheKengineer catalogue](https://www.thekengineer.com/catalogue)
- "the perfect Riven relies on you understanding what you're using the weapon for"; "context is important". CREATOR-STATED (TheKengineer, 2022-02-02) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- Brozime builds around what the player owns at each stage: his modding video uses "mods you're going to have very early on", gives substitutions ("if you don't have your cold mods yet, adding electricity... to your toxin mods is also good"), and says "it's better to just ask somebody what element you should be using". CREATOR-STATED (Brozime, 2023-12-09) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- Brozime refuses to reduce modding to text because it is "too confusing without the visual aid of seeing how it actually is in-game". — [Basic Modding Overview](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Modding/Basic+Modding+Overview)
- Things critics punish: unexplained use cases, stale builds, popularity as a proxy for quality, copy-pasted configurations, hidden dependence on a specific Warframe, and mods that do nothing in the build. — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4); [I've heard Overframe is crap](https://www.reddit.com/r/Warframe/comments/1hv15l0/ive_heard_overframe_is_crapwhere_is_a_good_place/)
- "Learn HOW to mod, not WHAT to mod." COMMUNITY-CONSENSUS (Reddit, search excerpt) — [Warframe youtube recommendations?](https://www.reddit.com/r/Warframe/comments/1ahtyd0/warframe_youtube_recommendations/)

### Inferences
- **Would earn trust:** a one-line reason per slot in bucket terms ("second multiplier in an empty bucket", "third pure-damage source, +9%"); the marginal gain of each mod and of the best mod the player does not own; the target stated (faction, level band, mission or boss, solo or squad); assumptions listed and switchable; two or three numbers (opening, sustained, and damage-over-time share) not one; handling flags; the update each rule was verified against; substitutions when the ideal mod is missing; and honest "these two builds are within 5%, pick by feel" output.
- **Would cause distrust:** a single sorted DPS number; recommending Serration plus a CO mod plus a damage arcane; recommending a conditional mod the weapon cannot trigger; ignoring attack type (CO on AoE); element advice based on removed health types; treating a weapon's rating as independent of the Warframe; silently assuming full stacks and headshots; and any build shown without a date.
- Because Brozime thinks modding is hard to convey in text, short worked comparisons ("with X instead of Y: +N%") are likely to land better than prose rules.

### Gaps
- Direct statements from Brozime, TheKengineer or Tactical Potato about build advisors or calculators (beyond the one Overframe remark) were not found. This whole section should be presented as inference.
- TheKengineer's AlecaFrame video may contain exactly this kind of opinion and was not read.

---

## 13. Synthesis: decision rules, disagreements and open questions

### Takeaway
The rules below are the implementable residue of the sections above. Each cites its origin; rules I derived are marked "derived". Element rules are post-U36; stacking rules are confirmed against the current wiki where marked.

### Cited Findings

#### Decision rules an advisor could implement

Classification

1. IF base crit chance is about 5% and the player has no flat crit source, THEN do not slot crit chance or crit damage mods; fill with elementals. (Brozime 2023-12-09) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
2. IF base crit chance is 20% or more (TheKengineer 2020) or about 25% (Brozime 2023), THEN treat as a crit weapon and slot crit chance and crit damage. — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk); [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
3. IF base crit is low but a flat crit source is active (Arcane Avenger-type, Puncture procs at 5 points each), THEN treat as a crit weapon. (TheKengineer 2021-06-19, 2024-06-26) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
4. Assign one of four roles before choosing mods: direct damage, status damage, converted Slash, primer. (TheKengineer 2022-02-02) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)

Buckets and slot value

5. Score every candidate mod by marginal gain to its own bucket (pure damage, elemental, crit, faction, multishot), never by face value. (TheKengineer 2021-08-01; Brozime 2023-12-09) — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg)
6. Put Serration, Heavy Caliber, CO-type mods on hitscan, damage arcanes (Merciless, Deadhead) and pure-damage ability buffs (Vex Armor) in the same additive bucket. (TheKengineer 2021-08-01; wiki) — [Primary Merciless (wiki)](https://wiki.warframe.com/w/Primary_Merciless)
7. IF a damage arcane will be active almost constantly, THEN drop the weaker of the base damage mod and the CO mod; never recommend three pure-damage sources. (TheKengineer 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
8. IF the weapon is a gun, THEN include multishot; IF the weapon will get kills, THEN prefer the Galvanized multishot mod over the basic one. (TheKengineer 2021-07-24, 2022-02-02) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
9. Treat faction damage as a full multiplier applied once to direct hits and twice to damage-over-time procs; sum Bane (x1.30, Primed x1.55), Roar (50% Rhino, 30% subsumed) and the 25% blessing additively. (wiki) — [Faction Damage (wiki)](https://wiki.warframe.com/w/Faction_Damage); [Roar (wiki)](https://wiki.warframe.com/w/Roar)
10. Do not recommend IPS mods unless the weapon is almost entirely that one type and the build is direct damage; never recommend modding for Puncture. (TheKengineer 2021, 2022, 2024) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

Status-count mods (Galvanized Aptitude, Shot, Savvy)

11. IF the damage instance is radial/AoE, THEN the CO bonus is zero. (wiki) — [Galvanized Aptitude (wiki)](https://wiki.warframe.com/w/Galvanized_Aptitude)
12. IF a separate primer applies 3 or more status types, THEN the CO mod is the best pure-damage mod (2 or more for pistols versus Hornet Strike). (TheKengineer 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
13. IF self-priming: require 3 or more status types each at 10% or more of damage (count forced procs); compute procs per kill = max multishot x status chance x shots to kill; recommend the CO mod over the base damage mod only IF procs per kill is 8 or more (primary) or 6 or more (secondary). (TheKengineer 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
14. IF the weapon kills in one or two shots, THEN do not use a CO mod for self-priming. (TheKengineer 2021-07-24) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
15. Model CO as additive to pure damage on hitscan and multiplicative on projectiles, flagged "usually", with per-weapon overrides. (TheKengineer 2024-05-01; wiki) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)

Slash conversion

16. IF crit weapon AND target has armor that is not being stripped, THEN consider Hunter Munitions (30% Slash on crit, independent of status chance). (wiki; Brozime 2023; TheKengineer 2021) — [Hunter Munitions (wiki)](https://wiki.warframe.com/w/Hunter_Munitions)
17. IF the weapon has a forced Impact proc on its main damage, THEN consider Internal Bleeding or Hemorrhage; otherwise never. (TheKengineer 2021-06-19; wiki weapon list) — [Internal Bleeding (wiki)](https://wiki.warframe.com/w/Internal_Bleeding)
18. IF Internal Bleeding is used and base fire rate is under 2.5, THEN warn that fire-rate mods or ally buffs crossing 2.5 halve the Slash chance. (TheKengineer 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)
19. IF target is unarmored, fully stripped, or status-resistant, THEN do not recommend Slash-conversion mods. (TheKengineer 2021-06-19) — [Internal Bleeding & Hemorrhage video](https://www.youtube.com/watch?v=yy_vzLI1h9Y)

Conditional crit mods and arcanes

20. IF the build kills by status procs or the weapon cannot reliably land weak-point kills, THEN use the normal crit chance mod, not Galvanized Scope/Crosshairs, and not Deadhead. (TheKengineer 2021-07-24; wiki) — [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
21. IF an arcane's trigger cannot be met by the build (for example a Cold-triggered arcane with no Cold), THEN reject it. (Sabuuchi 2024-05-27) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)

Elements (post-U36)

22. Default generalist pair: Viral plus Heat; one-element fallback: Toxin or Heat. (Brozime 2023-12-09, pre-U36, consistent with TheKengineer's post-U36 proc descriptions) — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
23. Faction map: Grineer Corrosive; Corpus Magnetic or Toxin; Infested Heat; Orokin Viral; Sentient Cold; Murmur Electric. (TheKengineer 2024-06-26). Scaldra Corrosive or Impact, avoid Gas; Techrot Gas or Magnetic, avoid Cold. (wiki) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8); [Scaldra (wiki)](https://wiki.warframe.com/w/Scaldra); [Techrot (wiki)](https://wiki.warframe.com/w/Techrot)
24. IF the element's status effect helps more than the +50% bonus, THEN prefer it over the faction-matched element. (TheKengineer 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
25. IF target faction is Murmur or Deimos Infested, THEN do not count on Viral as a damage type (halved); still value the Viral proc if the enemy is not immune. (TheKengineer 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
26. IF enemies are armored and die slower than about 2 s, THEN Heat's armor halving applies in full; IF they die faster, discount it. (derived from TheKengineer 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
27. Recommend Blast, Gas or Electric for their area effects only IF the build has reliable status, fast kills and grouped enemies (a grouping ability or dense mode). (TheKengineer 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
28. For a Kuva, Tenet or Coda weapon's bonus element, use Brozime's table; default Heat, Magnetic as the safe alternative for Eximus. (Brozime 2025 to 2026) — [Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
29. Do not count Heat or Toxin mods as scaling Gas clouds. (TheKengineer 2024-06-26) — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

Outside buffs

30. IF Roar is available, THEN reduce Bane's marginal value (same bucket) and raise the value of damage-over-time builds. (wiki; derived) — [Roar (wiki)](https://wiki.warframe.com/w/Roar)
31. IF choosing between subsumed Roar and Eclipse, THEN Roar, unless the frame is Mirage, an ally already has Roar, or the weapon is a thrown melee. (TheKengineer 2024-05-01) — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
32. IF Nourish (or another external Viral source) is active, THEN do not spend weapon slots on Viral. (wiki; TheKengineer 2021-06-19) — [Nourish (wiki)](https://wiki.warframe.com/w/Nourish)
33. IF Xata's Whisper is active, THEN add a 26% Void hit that inherits base, elemental, crit and faction modifiers and double dips on faction and weak points. (wiki) — [Xata's Whisper (wiki)](https://wiki.warframe.com/w/Xata%27s_Whisper)
34. IF a reliable full armor strip is present, THEN drop Corrosive and Slash conversion and stop crediting Heat for armor removal. (derived from TheKengineer 2024-07-11) — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)
35. Add shard bonuses as additive mod-equivalents: Crimson +25% primary status chance or secondary crit chance; Violet +30% primary Electric (+10% per Crimson, Azure or Violet shard); Emerald +30% Toxin proc damage, +2 Corrosive stacks; Tauforged x1.5. (wiki) — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)

Rivens

36. Rank Riven stats for damage roles: crit chance, crit damage, multishot, fire rate first; base damage is not a core stat; negative Impact, Puncture or zoom is a free win; faction stats lock the weapon to a faction. (TheKengineer 2022-02-02; re-check after the September 2026 Riven expansion) — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)

Output and honesty

37. Report opening damage (no stacks, no procs) and sustained damage separately. (derived from TheKengineer's first-shot argument) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
38. Flag contradictory or wasted mods: accuracy penalty plus recoil mod, range mod on a falloff weapon, CO on AoE, redundant pure damage. (Sabuuchi 2024-05-27; wiki) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
39. State the Warframe, faction and content each recommendation assumes, and the update it was checked against. (derived from Overframe criticism) — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
40. Cap the usefulness of extra damage at the target's effective health; for bosses with damage attenuation, do not rank by burst. (derived from TheKengineer 2024-07-11) — [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)

#### Where experts disagree

- **Crit threshold.** TheKengineer said 20% (2020); Brozime says about 25% is clearly worth it and 5% is not (2023). Neither addresses 10 to 20%. — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk); [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE)
- **Default element.** Brozime: Viral plus Heat on everything for general play, and Heat or Magnetic as a weapon's fixed element. TheKengineer: a per-faction map (Corrosive for Grineer, Magnetic or Toxin for Corpus, and so on) with status effect as the tie-breaker. These are different levels of optimisation more than a contradiction. — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
- **Value of Slash.** Brozime (2023, pre-U36): Slash procs are "one of the best procs in the game", Hunter Munitions "one of the best mods". TheKengineer (2024, post-U36): Slash-reliant builds "have become weaker", Slash is the weakest damage-over-time by raw damage. Likely a before-and-after-U36 difference, but Brozime's current view was not obtained. DISPUTED — [Basic Modding YOU SHOULD KNOW](https://www.youtube.com/watch?v=FiSbyWvaHbE); [Enemy level scaling explained 2024](https://www.youtube.com/watch?v=CgYBFOiSRPQ)
- **Faction mods.** Valued very highly for damage (wiki mechanics; Brozime's 2021 title), but TheKengineer treats faction-locked stats as a late, loadout-specific optimisation because they are dead weight elsewhere. — [Faction Damage (wiki)](https://wiki.warframe.com/w/Faction_Damage); [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)
- **Overframe.** Sabuuchi: "don't go [on] overframe". TheKengineer: use its simulator, ignore its rankings. Reddit excerpts split between "popularity not performance" and "decent for weapon builds if there is a good description". DISPUTED — [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4); [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8); [How to tell good from bad overframe builds?](https://www.reddit.com/r/Warframe/comments/xnphcm/how_to_tell_good_from_bad_overframe_builds/)
- **Conditionals.** TheKengineer models conditions and uptime in detail; at least one popular Overframe builder advertises builds "without conditionals and theory crafting BS that fails in game". — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA); [Sabuuchi video](https://www.youtube.com/watch?v=vFvNLNxZ0_4)
- **Text versus video.** Brozime will not write modding rules down; TheKengineer reduces them to formulas and rules of thumb. — [Basic Modding Overview](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Modding/Basic+Modding+Overview)
- **A creator disagreeing with his earlier self.** TheKengineer on Heat inherit (bug in 2021, mechanic in 2024) and on Radiation and Corrosive (2020 advice reversed in 2024). — [Damage calculation guide](https://www.youtube.com/watch?v=N3n89cZpVTg); [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)

#### Open questions to verify in game (or against current patch notes)

1. Do Galvanized Scope and Galvanized Crosshairs still lose all stacks at once, and do they still require aiming? (2021 claim) — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
2. For each weapon the app supports, is the CO bonus additive, multiplicative or absent? TheKengineer says "usually" by attack type with exceptions. — [Is Roar always better than Eclipse?](https://www.youtube.com/watch?v=WUMPxnpmtKQ)
3. Are the "8 procs per kill (primary) / 6 (secondary)" thresholds still right with current mod values and the projectile fix? — [Galvanized mods video](https://www.youtube.com/watch?v=imrbjrIwjxA)
4. Is the enemy armor formula 0.9 x sqrt(armor / 2700) (TheKengineer) or linear in armor as my wiki fetch rendered it? Test damage against a known-armor enemy in the Simulacrum. — [Armor (wiki)](https://wiki.warframe.com/w/Armor)
5. Was the Magnetic shield/Overguard-break damage bug from June 2024 fixed, and what is the real damage? — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
6. Does Heat inherit still work as described (first proc's owner and Heat/faction modifiers govern the stack)? — [All damage types explained (2024-2026)](https://www.youtube.com/watch?v=QpqEZfk5su8)
7. Does the Vigilante set bonus still transfer from a sentinel weapon to the player's primary? (2020 claim) — [Top 10 tips for more damage](https://www.youtube.com/watch?v=n8ACICukYEk)
8. How does Nourish's Viral combine with a weapon that already has Toxin, Cold or Viral, and with element ordering? — [Nourish (wiki)](https://wiki.warframe.com/w/Nourish)
9. How do Violet-shard Electric and progenitor elements order against modded elements? — [Archon Shard (wiki)](https://wiki.warframe.com/w/Archon_Shard)
10. Which Deadhead-relevant kills count as weak-point kills for AoE and beam weapons since Update 44.0? — [Primary Deadhead (wiki)](https://wiki.warframe.com/w/Primary_Deadhead)
11. What did the September 2026 "Riven System Expansion" change, and does it invalidate the Riven stat ranking? — [Devstream 197](https://publish.obsidian.md/brozime/Public/Devstreams+%26+Data/Devstreams/Devstream+197)
12. The full faction weakness table, including Kuva Grineer, Zariman and Anarchs, and which enemies are immune to Viral procs or cap status stacks. — [Damage (wiki)](https://wiki.warframe.com/w/Damage)
13. Toxic Lash, Smite Infusion, Vex Armor and Eclipse current values and which bucket each sits in. Not sourced in these notes.
14. Is "only one Warframe ability buffs crit damage" (2022) still true? — [What makes a good riven?](https://www.youtube.com/watch?v=Z3_6q6KZeS8)

### Inferences
- The rule set is strongest on stacking logic (wiki-confirmed) and weakest on anything Tactical Potato or 2025 to 2026 Brozime weapon videos would supply. The advisor can be built on rules 5 to 21 and 30 to 35 with reasonable confidence today; rules 22 to 29 need the faction table verified; rules 13 and 15 need per-weapon data.

### Gaps
- Overall coverage gap: about 20 relevant videos could not be read because of the transcript block (all Tactical Potato; Brozime's lich, Coda, Incarnon, Scaldra-weapon, Galvanized, Bane and Overframe videos; TheKengineer's shard, Steel Path, AoE and Utility Primaries videos; one NoSympathyy guide is downloaded but unread). A follow-up pass from another network would materially improve sections 3, 5, 6 and 8.
- Reddit and forum sentiment rests on search excerpts, not on read threads.
