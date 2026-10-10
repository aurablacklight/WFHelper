#!/usr/bin/env node
// Prints the build advisor's output for one owned gun, to compare with the
// in-game arsenal. Run `pnpm run build:main` first.
//
//   node scripts/dev/advise-gun-build.cjs <inventory.json> <weapon name or /Lotus/ type>

const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");

const BUILD = path.resolve(__dirname, "..", "..", ".electron-build", "services");
const { listOwnedGuns, reviewGun } = require(
  path.join(BUILD, "buildAdvisor", "gunBuildAdvisor.js"),
);
const { ADVISOR_FACTIONS } = require(
  path.join(BUILD, "..", "config", "shared", "buildAdvisorTypes.js"),
);

const usage =
  "usage: advise-gun-build.cjs <inventory.json> <weapon name or /Lotus/ type> [--target faction] [--stacks] [--no-capacity] [--json]";
let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: {
      target: { type: "string" },
      stacks: { type: "boolean", default: false },
      "no-capacity": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
  });
} catch (error) {
  console.error(error.message);
  console.error(usage);
  process.exit(2);
}
const [inventoryPath, wanted] = args.positionals;
const faction = args.values.target ?? null;
if (args.positionals.length !== 2 || (faction && !ADVISOR_FACTIONS.includes(faction))) {
  console.error(usage);
  console.error(`targets: ${ADVISOR_FACTIONS.join(", ")}`);
  process.exit(2);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
// Keep loader info messages out of stdout so --json is machine-readable.
if (args.values.json) require("electron-log/main").transports.console.level = "warn";
const owned = listOwnedGuns(inventory);
const match = owned.find(
  (gun) => gun.type === wanted || gun.name.toLowerCase() === wanted.toLowerCase(),
);
if (!match) {
  console.error(`No owned primary or secondary matches "${wanted}".`);
  process.exit(1);
}

const percent = (value) => `${(value * 100).toFixed(1)}%`;
const fixed = (value, digits = 2) => value.toFixed(digits);

function printStats(stats, versus) {
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
  if (versus) {
    console.log(
      `    vs ${versus.faction}: estimated burst ${fixed(versus.burstDps, 0)}, sustained ${fixed(versus.sustainedDps, 0)}`,
    );
    console.log(
      `      direct ${fixed(versus.directDps, 0)}, status ${fixed(versus.statusDps, 0)}, viral ${fixed(versus.viralMultiplier)}x, armour pass-through ${percent(versus.armourMultiplier)}`,
    );
  }
}

function printMod(mod, extra = "") {
  console.log(`    ${mod.name} (rank ${mod.rank}/${mod.maxRank})${extra}`);
  for (const line of mod.assumed ?? [])
    console.log(`      assumed up: ${line.replace(/\\n|\n/g, " ")}`);
  for (const line of mod.ignored)
    console.log(`      not modelled: ${line.replace(/\\n|\n/g, " ")}`);
}

const options = {
  assumeConditionals: args.values.stacks,
  respectCapacity: !args.values["no-capacity"],
  faction,
};
const review = reviewGun(inventory, match.type, undefined, options);
if (args.values.json) {
  console.log(JSON.stringify({ options, ...review }, null, 2));
  process.exit(review.advice.ok ? 0 : 1);
}
console.log(`${match.name}\n`);
console.log(
  `  Stacks ${options.assumeConditionals ? "up" : "off"}; target ${faction ?? "none"}; capacity ${options.respectCapacity ? "checked when known" : "ignored"}\n`,
);

review.configs.forEach((config) => {
  console.log(
    `  Saved config ${String.fromCharCode(65 + config.index)}${config.name ? ` "${config.name}"` : ""}`,
  );
  if (config.arcane) printMod(config.arcane, "  [arcane]");
  for (const mod of config.mods) printMod(mod);
  for (const type of config.unrecognised) console.log(`    not modelled: ${type}`);
  printStats(config.stats, config.versus);
  console.log("");
});
const advice = review.advice;
if (!advice.ok) {
  console.log(`Advisor: ${advice.reason}`);
  process.exit(1);
}
console.log("  Recommended from owned mods");
if (advice.capacity) {
  console.log(
    `    capacity ${advice.capacity.conservative ? "at most " : ""}${advice.capacity.used}/${advice.capacity.total}`,
  );
} else if (options.respectCapacity) console.log("    capacity unknown: weapon XP unavailable");
if (advice.weapon.bonus)
  console.log(`    bonus ${percent(advice.weapon.bonus.value)} ${advice.weapon.bonus.damageType}`);
if (advice.weapon.radialBase)
  console.log(`    includes ${fixed(advice.weapon.radialBase, 1)} base radial damage`);
if (advice.approximate)
  console.log("    approximate firing cycle: DPS and mod ranking need an in-game check");
if (advice.arcane)
  printMod(advice.arcane, `  [arcane] ${percent(advice.arcane.burstDpsShare)} of burst dps`);
for (const mod of advice.mods) printMod(mod, `  ${percent(mod.burstDpsShare)} of burst dps`);
printStats(advice.stats, advice.versus);
