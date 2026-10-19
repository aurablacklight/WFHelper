# Where `assets.wfhelper.com` comes from, and how to reproduce it

Research for #24, part of the backend-cutover map #21. Checked 2026-10-18.

## Short answer

`assets.wfhelper.com` is a static Cloudflare Pages project (`wfhelper-icons`)
built by scripts that already live in this repo under `scripts/icon-mirror/`
(`pnpm run icons:download`, then `icons:deploy`). Nothing on it is hand-made:
every file is a copy of something DE, the Warframe wiki, WFCD, warframe.market
or arbi.guide publishes. The only parts we cannot rebuild from the repo are the
**mod/arcane card art** scripts, which upstream deliberately keeps out of git.

Roughly 18,900 files, about 1.8 GB, almost all of it DE textures from
`browse.wf`.

Sources:

- `scripts/icon-mirror/README.md`
- `package.json` (`icons:*` scripts)
- the live `https://assets.wfhelper.com/manifest.json` (generated
  2026-08-23, 16,303 entries)
- `HEAD` requests against a few sample files

## How the app addresses it

The base URL is set in several places, and only some of them read
`WFHELPER_ICON_MIRROR_URL`:

| Where                                        | Path on the mirror                                             | Env override?                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `services/itemDatabase.ts` `toIconMirrorUrl` | `/icons/<sha256(sourceUrl)[0:24]>.<ext>`                       | yes                                                                                                 |
| `services/itemDatabase.ts` `wikiCardArtUrl`  | `/mod-art/<stem>.webp`, `/item-art/<stem>.webp`                | yes                                                                                                 |
| `config/shared/wfm.ts` `formatWfmAssetUrl`   | `/wfm/<path with hash stripped>`                               | yes                                                                                                 |
| `src/lib/arbi/arbiMinimap.ts`                | `/arbi-minimaps/<file>.webp`                                   | **no, hard-coded**                                                                                  |
| `src/lib/codexScans.ts` `ENEMY_IMAGE_BASE`   | `/enemies/<WikiFile>.png`                                      | **no, hard-coded**                                                                                  |
| `src/data/codexScanRequirements.json`        | 497 full `https://assets.wfhelper.com/icons/...` URLs baked in | **no, baked into data** (written by `scripts/codex-scans/build-codex-scan-data.mjs`, `MIRROR_BASE`) |
| `config/runtime/security.ts`                 | CSP `img-src` allowlist                                        | n/a                                                                                                 |

The `/icons/` key is a hash of the **original source URL**. So any rebuild
that starts from the same source URLs produces the same paths, and the baked
URLs in `codexScanRequirements.json` stay valid on any host. Only the hostname
needs rewriting.

## Asset families

### 1. Item and relic icons: `/icons/` (16,303 manifest entries, 12,498 under `/icons/`)

- **Origin.** `build-icon-manifest.mjs` compiles the main process and walks
  the item database, the relic database and `codex-icon-urls.json` (written by
  the codex build) to collect each item's original image URL. The URLs come
  from these hosts:

  | Host                  | Entries | What it is                                                                                                                                                                                                                                            |
  | --------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `browse.wf`           | 12,086  | Community mirror of DE's PublicExport textures. 10,403 entries also have a `fallbackUrl` on DE's own CDN, `content.warframe.com/PublicExport/...!<contentHash>`, built from `warframe-public-export-plus` `ExportImages.json` plus DE's live overlay. |
  | `cdn.warframestat.us` | 360     | WFCD `warframe-items` images                                                                                                                                                                                                                          |
  | `wiki.warframe.com`   | 52      | Wiki uploads                                                                                                                                                                                                                                          |

- **Script.** `download-icon-mirror.mjs` is plain Node with a host allowlist,
  6 concurrent requests and content sniffing. The fork has it.
- **Size.** Sampled `browse.wf` files run from 30 to 350 KB, about 140 KB on
  average. These are full-resolution DE textures, not thumbnails, so this
  family is about 1.7 GB. The WFCD files are 2 to 10 KB and the wiki ones
  about 180 KB.
- **Terms.** The art is DE's IP. DE's content policy
  (https://www.warframe.com/en/contentpolicy) says "Use of Warframe assets
  must be non-commercial. You cannot profit from the direct sale of
  Warframe's IP." A free fan tool fits that. `browse.wf` is a third-party
  mirror with no stated terms; DE's CDN is DE's own published export.
- **Direct-link option.** Possible. `browse.wf` serves `image/png` with
  `Access-Control-Allow-Origin: *`, and the bytes match the mirror exactly
  (71,374 B for the sample). That leans on a volunteer host's bandwidth,
  though. DE's CDN needs the content hash and sends no `content-type`.

### 2. warframe.market thumbnails: `/wfm/` (3,805 files)

- **Origin.** The `api.warframe.market/v2/items` catalog gives the `thumb`
  paths. Files are stored under keys with the hash removed, so they stay
  stable when WFM re-exports. They are served with `max-age=86400`, not
  immutable.
- **Script.** `download-wfm-thumbs.cjs` is an **Electron** script
  (`icons:download:wfm`). WFM puts a Cloudflare managed challenge in front of
  `/static/assets` (even `robots.txt` returns a "Just a moment..." page), so
  the script opens a hidden `BrowserWindow`, clears the challenge, and shows
  the window if a human has to solve it. **This is a GUI launch and can make
  the PC ding**, so it falls under the no-sound rule and must be asked about
  first.
- **Size.** About 20 to 25 KB each, roughly 80 MB in total.
- **Terms.** WFM's own hosting. The challenge makes it clear that WFM does
  not want these files hotlinked or scraped.
- **Direct-link option: not possible.** The challenge blocks renderer `<img>`
  loads, which is why the mirror exists for this family (commit `b88dd912`).
  The fork has to host copies.

### 3. Mod and arcane card art: `/mod-art/` (about 1,700 files) and item-art overrides: `/item-art/` (6 files)

- **Origin.** Framed card images from wiki.warframe.com. The map from
  uniqueName to wiki file stem is `config/shared/wikiModArt.ts`, generated
  from `Module:Mods/data` and `Module:Arcane/data`: 3,385 keys, 1,701
  distinct stems. `config/shared/wikiItemArt.ts` plus `wiki-item-art.json`
  hold the six tauforged archon shard overrides. Files are served as
  `.webp`, about 18 to 26 KB each, so the source PNGs get converted.
- **Script.** `icons:mod-art`, `icons:download:mod-art` and
  `icons:download:item-art` call `build-wiki-mod-art.mjs` and
  `download-wiki-mod-art.mjs`. **Both are in `.gitignore`.** They are missing
  from this repo, from upstream's public tree, and from all git history. The
  item-art command reuses the same missing downloader, so neither family can
  be rebuilt today. Rewriting them is small: fetch `Special:FilePath/<stem>.png`
  slowly, as `download-enemy-images.mjs` does, then convert to webp.
- **Size.** About 35 MB.
- **Terms.** Wiki text is CC BY-SA. The images are DE assets that the wiki
  uses "with permission" or "under fair use for informative purposes"
  (https://wiki.warframe.com/w/WARFRAME_Wiki:Licensing), so CC BY-SA does
  not cover them. DE's content policy is the one that applies.
- **Direct-link option.** Weak. The wiki rate-limits `Special:FilePath`
  hard, and the app expects webp paths.

### 4. Codex enemy portraits and fragment art: `/enemies/` (about 870 files)

- **Origin.** Wiki image filenames from `Module:Enemies/data/<faction>` and
  the `Fragments/*` pages. `scripts/codex-scans/build-codex-scan-data.mjs`
  writes them into `src/data/codexScanRequirements.json` and a gitignored
  sidecar, `scripts/icon-mirror/enemy-images.json`.
- **Script.** `download-enemy-images.mjs` downloads
  `wiki.warframe.com/w/Special:FilePath/<name>` with concurrency 2, a 250 ms
  delay and 429 backoff. The fork has it. It needs the codex build to run
  first to recreate the sidecar.
- **Size.** Sample: 15 KB. Probably tens of MB in total.
- **Terms.** Same as family 3: DE art, used on the wiki under permission or
  fair use.

### 5. Arbitration minimaps: `/arbi-minimaps/` (24 files)

- **Origin.** arbi.guide's analyzer, made by remesis. The images and their
  calibration matrices are arbi.guide's own work, and the app credits it
  (`arbi.spawnMap.credit`).
- **Script.** `download-arbi-minimaps.mjs` is plain Node. It reads
  `arbi.guide/analyzer/`, finds `minimaps/catalog-<ver>.js`, downloads the
  webps and rewrites `src/data/arbiMinimaps.json`. The committed JSON is
  `version: 2`, fetched 2026-09-04; arbi.guide now serves
  `catalog-20260908-8.js`, so the catalog has moved on since.
- **Size.** About 160 KB each, roughly 4 MB in total.
- **Terms.** No licence stated. This is a third party's own work (not DE
  art), mirrored with credit. Whether permission was asked is unknown.
- **Direct-link option.** Technically possible: webp,
  `Access-Control-Allow-Origin: *`, no challenge. But hotlinking a
  volunteer's site without asking is the same courtesy problem the map is
  trying to remove.

### Also on the site

`manifest.json` (5.4 MB), `index.html` and `_headers`, all generated by
`build-icon-manifest.mjs`. The `_headers` file sets CORS `*`, a strict CSP,
and `immutable` caching on `/icons/*`.

## Hosting notes

- About 18,900 files in total, close to the Cloudflare Pages limit of 20,000
  files per site on the Free plan. Cloudflare's docs say "paid plans" allow
  100,000 (https://developers.cloudflare.com/pages/platform/limits/, raised
  2026-01-23), but a community thread reports that Workers Paid alone did not
  lift the 20k cap. The 25 MiB per-file limit is not a concern.
- R2 has no file-count limit. About 2 GB fits inside R2's free 10 GB of
  storage, and egress is free. It needs either a public bucket on a custom
  domain, or a Worker in front, to set the `_headers` equivalents (CORS,
  cache).
- `icons:deploy` is hard-wired to project `wfhelper-icons`, branch
  `pre-production`, and does not commit. The fork would set its own project or
  bucket name in config.

## Options for the later ticket

1. **Host a full copy on the owner's domain (Pages or R2).** Rerun the
   existing scripts, rewrite the four hard-coded or baked base URLs, and
   update the CSP. Needs: the mod-art scripts rewritten, and one supervised
   Electron run for WFM thumbs, asked about first because of the sound risk.
   Gives the most resilience and matches the cutover's goals.
2. **Hybrid.** Host only what cannot be hotlinked: WFM thumbs, mod and item
   art (webp-converted), enemies, and possibly the arbi minimaps. Point
   `/icons/` traffic straight at `browse.wf`. This saves about 1.7 GB, but
   the item icons then depend on a volunteer mirror, and the hash-keyed
   `/icons/` URLs baked into codex data would need regenerating as source
   URLs.
3. **Point everything at the originals.** Not viable. WFM thumbs are
   challenge-gated, and the wiki rate-limits.
