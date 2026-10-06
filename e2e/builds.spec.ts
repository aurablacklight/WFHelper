import { test, expect, type Page } from "@playwright/test";

import {
  closeElectronTestHarness,
  launchElectronTestHarness,
  openView,
  writeHarnessInventory,
  type ElectronTestHarness,
} from "./electronTestHarness";

const LEX_PRIME = "/Lotus/Weapons/Tenno/Pistols/PrimeLex/PrimeLex";
const TRUMNA_PRIME = "/Lotus/Weapons/Tenno/LongGuns/PrimeTrumna/PrimeTrumnaWeapon";
// Not in the bundled weapon table, so the advisor has to refuse it.
const UNKNOWN_BOW = "/Lotus/Weapons/Tenno/Bows/FixtureBow/FixtureBow";
const HORNET_STRIKE = "/Lotus/Upgrades/Mods/Pistol/WeaponDamageAmountMod";
const BARREL_DIFFUSION = "/Lotus/Upgrades/Mods/Pistol/WeaponFireIterationsMod";
// +110% multishot, plus 4 x +30% on kill.
const GALVANIZED_DIFFUSION = "/Lotus/Upgrades/Mods/Pistol/WeaponFireIterationsSPMod";

// 12 x +30% damage on kill at rank 5, plus +30% reload speed.
const SECONDARY_MERCILESS = "/Lotus/Upgrades/CosmeticEnhancers/Offensive/SecondaryDamageOnKill";

const id = (n: number) => ({ $oid: n.toString(16).padStart(24, "0") });

test.describe("Build advisor", () => {
  test.setTimeout(180_000);

  let harness: ElectronTestHarness;
  let page: Page;

  test.beforeAll(async () => {
    harness = await launchElectronTestHarness("wfh-builds-e2e-");
    page = harness.page;
    writeHarnessInventory(harness, {
      PlayerLevel: 20,
      Suits: [],
      LongGuns: [
        { ItemId: id(100), ItemType: TRUMNA_PRIME },
        { ItemId: id(101), ItemType: UNKNOWN_BOW },
      ],
      // Config A holds the rank 10 Hornet Strike alone.
      Pistols: [
        { ItemId: id(102), ItemType: LEX_PRIME, Configs: [{ Upgrades: [id(1).$oid] }, {}, {}] },
      ],
      Upgrades: [
        { ItemId: id(1), ItemType: HORNET_STRIKE, UpgradeFingerprint: '{"lvl":10}' },
        { ItemId: id(2), ItemType: BARREL_DIFFUSION, UpgradeFingerprint: '{"lvl":5}' },
        { ItemId: id(3), ItemType: GALVANIZED_DIFFUSION, UpgradeFingerprint: '{"lvl":10}' },
        { ItemId: id(4), ItemType: SECONDARY_MERCILESS, UpgradeFingerprint: '{"lvl":5}' },
      ],
      RawUpgrades: [],
    });
  });

  test.afterAll(async () => {
    await closeElectronTestHarness(harness);
  });

  const stat = (key: string) => page.locator(`[data-builds-stat="${key}"] td`);

  test.beforeEach(async () => {
    await openView(page, "builds");
    await expect(page.locator("[data-builds-view]")).toBeVisible({ timeout: 30_000 });
  });

  test("the sidebar opens the tab and lists every owned gun", async () => {
    await expect(page.locator("[data-builds-gun]")).toHaveCount(3);
    await expect(page.locator(`[data-builds-gun="${LEX_PRIME}"]`)).toContainText("Lex Prime");
  });

  test("picking a gun shows the recommended mods beside the saved config", async () => {
    await page.locator(`[data-builds-gun="${LEX_PRIME}"]`).click();

    // Stacks are assumed up, so the galvanized multishot mod wins its family.
    await expect(page.locator("[data-builds-mod]")).toHaveCount(3);
    await expect(page.locator(`[data-builds-mod="${HORNET_STRIKE}"]`)).toBeVisible();
    await expect(page.locator(`[data-builds-mod="${GALVANIZED_DIFFUSION}"]`)).toBeVisible();
    // The owned arcane leads the list, with its stacks assumed too.
    await expect(page.locator("[data-builds-arcane]")).toHaveCount(1);
    await expect(page.locator(`[data-builds-mod="${SECONDARY_MERCILESS}"]`)).toBeVisible();
    await expect(page.locator("[data-builds-assumed]")).toHaveCount(2);

    // Puncture 144 with +220% and the arcane's +360% (6.8x); config A has +220% only.
    await expect(stat("puncture")).toHaveText(["Puncture", "979.2", "460.8"]);
    // +110% and 4 x +30% in the recommendation; config A has no multishot mod.
    await expect(stat("multishot")).toHaveText(["Multishot", "3.3", "1.0"]);
    // 180 * 6.8 a projectile times 3.3, against 576 times 1.
    await expect(stat("total")).toHaveText(["Total", "4,039.2", "576.0"]);

    await page.screenshot({ path: test.info().outputPath("builds-lex-prime.png") });
  });

  test("turning stacks off ranks on arsenal numbers", async () => {
    await page.locator(`[data-builds-gun="${LEX_PRIME}"]`).click();
    await expect(page.locator(`[data-builds-mod="${GALVANIZED_DIFFUSION}"]`)).toBeVisible();

    await page.locator("[data-builds-stacks]").click();

    // Without its stacks the galvanized mod is +110%, so the plain +120% wins.
    await expect(page.locator(`[data-builds-mod="${BARREL_DIFFUSION}"]`)).toBeVisible();
    await expect(page.locator("[data-builds-assumed]")).toHaveCount(0);
    // The arcane's damage needs stacks, so it drops out as well.
    await expect(page.locator("[data-builds-arcane]")).toHaveCount(0);
    await expect(stat("multishot")).toHaveText(["Multishot", "2.2", "1.0"]);
    await expect(stat("total")).toHaveText(["Total", "1,267.2", "576.0"]);

    await page.locator("[data-builds-stacks]").click();
    await expect(page.locator(`[data-builds-mod="${GALVANIZED_DIFFUSION}"]`)).toBeVisible();
  });

  test("choosing a target adds damage figures against that faction", async () => {
    await page.locator(`[data-builds-gun="${LEX_PRIME}"]`).click();
    await expect(stat("burstDps")).toHaveCount(3);
    await expect(stat("burstVs")).toHaveCount(0);

    const target = page.locator("[data-builds-view] select");
    await target.selectOption("corpus");

    // One label and one figure per column, for the recommendation and config A.
    await expect(stat("burstVs")).toHaveCount(3);
    await expect(stat("sustainedVs")).toHaveCount(3);

    await target.selectOption("");
    await expect(stat("burstVs")).toHaveCount(0);
  });

  test("a weapon the advisor cannot build for says why", async () => {
    await page.locator(`[data-builds-gun="${UNKNOWN_BOW}"]`).click();
    await expect(page.locator("[data-builds-unsupported]")).toBeVisible();
    await expect(page.locator("[data-builds-mod]")).toHaveCount(0);
  });

  test("search narrows the gun list", async () => {
    await page.locator("[data-builds-view] [data-search-focus]").fill("trumna");
    await expect(page.locator("[data-builds-gun]")).toHaveCount(1);
    await page.locator("[data-builds-view] [data-search-focus]").fill("");
    await expect(page.locator("[data-builds-gun]")).toHaveCount(3);
  });
});
