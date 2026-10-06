#!/usr/bin/env node
// Prints the build advisor's output for one owned gun, to compare with the
// in-game arsenal. Run `pnpm run build:main` first.
//
//   node scripts/dev/advise-gun-build.cjs <inventory.json> <weapon name or /Lotus/ type>

const fs = require("node:fs");
const path = require("node:path");

const BUILD = path.resolve(__dirname, "..", "..", ".electron-build", "services");
const { adviseGunBuild, evaluateGunConfig } = require(
  path.join(BUILD, "buildAdvisor", "gunBuildAdvisor.js"),
);
const { readPepDict, readPepExport } = require(path.join(BUILD, "bundledGameData.js"));

const [inventoryPath, wanted] = process.argv.slice(2);
if (!inventoryPath || !wanted) {
  console.error("usage: advise-gun-build.cjs <inventory.json> <weapon name or /Lotus/ type>");
  process.exit(2);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const weapons = readPepExport("ExportWeapons") ?? {};
const names = readPepDict("en") ?? {};
const owned = ["LongGuns", "Pistols"].flatMap((category) => inventory[category] ?? []);
const match = owned.find(
  (gun) =>
    gun.ItemType === wanted ||
    (names[weapons[gun.ItemType]?.name] ?? "").toLowerCase() === wanted.toLowerCase(),
);
if (!match) {
  console.error(`No owned primary or secondary matches "${wanted}".`);
  process.exit(1);
}

const percent = (value) => `${(value * 100).toFixed(1)}%`;
const fixed = (value, digits = 2) => value.toFixed(digits);

function printStats(stats) {
  for (const [type, amount] of Object.entries(stats.damage)) {
    console.log(`    ${type.padEnd(12)} ${fixed(amount, 1)}`);
  }
  console.log(`    total        ${fixed(stats.totalDamage, 1)}`);
  console.log(`    multishot    ${fixed(stats.multishot)}`);
  console.log(`    crit chance  ${percent(stats.criticalChance)}`);
  console.log(`    crit multi   ${fixed(stats.criticalMultiplier)}x`);
  console.log(`    status       ${percent(stats.statusChance)}`);
  console.log(`    fire rate    ${fixed(stats.fireRate)}`);
  console.log(`    magazine     ${stats.magazineSize}`);
  console.log(`    reload       ${fixed(stats.reloadTime)}s`);
  console.log(`    burst dps    ${fixed(stats.burstDps, 0)}`);
  console.log(`    sustained    ${fixed(stats.sustainedDps, 0)}`);
}

function printMod(mod, extra = "") {
  console.log(`    ${mod.name} (rank ${mod.rank}/${mod.maxRank})${extra}`);
  for (const line of mod.assumed ?? [])
    console.log(`      assumed up: ${line.replace(/\\n|\n/g, " ")}`);
  for (const line of mod.ignored)
    console.log(`      not modelled: ${line.replace(/\\n|\n/g, " ")}`);
}

console.log(`${names[weapons[match.ItemType]?.name] ?? match.ItemType}\n`);

(match.Configs ?? []).forEach((config, index) => {
  if (!(config.Upgrades ?? []).some(Boolean)) return;
  const result = evaluateGunConfig(inventory, match.ItemType, index);
  if (!result.ok) {
    console.log(`Config ${index}: ${result.reason}`);
    return;
  }
  console.log(
    `  Saved config ${String.fromCharCode(65 + index)}${config.Name ? ` "${config.Name}"` : ""}`,
  );
  for (const mod of result.mods) printMod(mod);
  for (const type of result.unrecognised) console.log(`    not modelled: ${type}`);
  printStats(result.stats);
  console.log("");
});
const advice = adviseGunBuild(inventory, match.ItemType);
if (!advice.ok) {
  console.log(`Advisor: ${advice.reason}`);
  process.exit(1);
}
console.log("  Recommended from owned mods");
for (const mod of advice.mods) printMod(mod, `  ${percent(mod.burstDpsShare)} of burst dps`);
printStats(advice.stats);
