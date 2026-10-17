import { test, expect } from "@playwright/test";

import {
  closeElectronTestHarness,
  launchElectronTestHarness,
  overlayWindow,
  type ElectronTestHarness,
} from "./electronTestHarness";

test("the reward overlay shows the English text main sends it", async () => {
  test.setTimeout(180_000);
  let harness: ElectronTestHarness | undefined;
  try {
    // A stale German choice from an older build must not leak into the overlay.
    harness = await launchElectronTestHarness("wfh-overlay-text-e2e-", {
      storage: { "app-language": "de" },
    });
    const { page } = harness;

    await page.evaluate(() => window.api.simulateRelicTrigger());
    // The planner window is warmed on boot from the same file, so the reward
    // window is the one without a mode parameter.
    const overlay = await overlayWindow(harness, "renderer/overlay.html", "planner");

    await expect(overlay.locator("#scanning-text")).toHaveText("Reading reward screen...", {
      timeout: 30_000,
    });
    await expect(overlay.locator("#best-label")).toHaveText("Best:");
    await expect(overlay.locator('.reward-slot[data-slot="0"] .slot-player')).toHaveText("Slot 1");
    expect(await overlay.title()).toBe("Relic Overlay");
  } finally {
    await closeElectronTestHarness(harness);
  }
});
