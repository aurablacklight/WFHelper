# Friends beta (Windows x64)

## Test updates without publishing

```powershell
pnpm run dist:beta 0.1.0-beta.1 --local
pnpm run dist:beta 0.1.0-beta.2 --local
node scripts/hidden-desktop.mjs node scripts/test-beta-update.mjs
```

Local builds are named **WFHelper Beta Local**, use their own installation ID
and cache, and write to `release/beta-local/<version>`. Never share these with
friends: their update feed is `http://127.0.0.1:18765/`.

The integration test binds that port on loopback only, installs beta.1 under
`.tmp/beta-update-test/installed`, clicks Check updates, downloads beta.2, and
clicks Restart & install. It uses `%APPDATA%/WFHelper Beta Local` so Windows'
automatic relaunch uses the same profile. It verifies the installed version, automatic restart,
and saved profile markers. The restarted test process is stopped and reopened
under Playwright to inspect the final UI. Screenshots and feed requests remain
in `.tmp/beta-update-test`. The test stops its server and app when finished but
leaves the local test installation and profile available for inspection.

To keep Check updates available while manually testing the installed local beta,
run `node scripts/serve-beta-feed.mjs` in a terminal. Stop it with Ctrl+C when done.
It serves beta.2 by default; pass another build output directory to change that.

## Build for friends

Build a numbered installer without changing the repository's development version:

```powershell
pnpm run dist:beta 0.1.0-beta.1
pnpm run test:packaged "release/beta/0.1.0-beta.1/win-unpacked/WFHelper Beta.exe"
```

The packager uploads nothing. Output lives under `release/beta/<version>`.
The displayed version and installed package version are built together.
Beta installs use a separate application ID, shortcut, and `%APPDATA%/WFHelper Beta`
profile. Users import their own inventory and configure their own accounts.
Do not include developer profiles, credentials, or inventories in downloads.

## Distribution and updates

The public release `friends-beta` in `aurablacklight/WFHelper` hosts the installer,
its `.blockmap`, and `beta.yml`. Share its release link with friends. This is public
hosting, not access-controlled or unlisted hosting.

The installed updater reads only this generic feed:
`https://github.com/aurablacklight/WFHelper/releases/download/friends-beta/`.
It requests `beta.yml`, accepts prereleases in marked beta packages, and never
uses the upstream release feed. Check updates, Download, and Restart to update
use the existing application flow. Development launches still disable updates.

For each subsequent beta, increment the version (for example `0.1.0-beta.2`),
build, and run the packaged smoke check. Upload the newly versioned `.exe` and
`.exe.blockmap` first. Replace `beta.yml` last so it never advertises a missing
installer. Keep previous installers available while users may be downloading
them. Never replace an installer under an existing versioned filename.

Create the `friends-beta` release as a prerelease, not the latest stable release.
The release tag remains fixed; the version in `beta.yml` selects the update.
Do not use the production publishing scripts, which target the upstream project.
No GitHub token is embedded in the application.

The existing Windows code-signing credentials can be supplied to the packager
through its normal environment. Without them, the installer is unsigned and
Windows may display an unknown-publisher/SmartScreen prompt.

Before expanding the beta, test a real install followed by an update to a newer
beta and verify that settings survive. A packaged runtime smoke alone does not
verify the NSIS install/update cycle.

## Local update rehearsal

Build two versions with `--local`, which gives them a separate
`WFHelper Beta Local` application identity and a loopback-only update feed:

```powershell
pnpm run dist:beta 0.1.0-beta.2 --local
pnpm run dist:beta 0.1.0-beta.3 --local
node scripts/test-beta-update.mjs 0.1.0-beta.2 0.1.0-beta.3 --check-fork-sidebar
```

Close the local beta and stop any `serve-beta-feed.mjs` process first. The test
serves the newer build, installs the older build in `.tmp/beta-update-test/installed`,
and exercises Check updates, Download, and Restart & install. It checks the new
version, retained settings and inventory, and the final Up To Date response.
Use `--installed` to start from an existing installation of the older version.
The optional `--check-fork-sidebar` flag also verifies the fork Feedback link and
absence of sidebar community buttons. Screenshots and feed requests are saved
under `.tmp/beta-update-test`.

To keep the local feed available after the test:

```powershell
node scripts/serve-beta-feed.mjs release/beta-local/0.1.0-beta.3
```

Local builds are for this rehearsal only; friends need the non-local build.
