import { test, expect } from "@playwright/test";

import {
  closeElectronTestHarness,
  launchElectronTestHarness,
  type ElectronTestHarness,
} from "./electronTestHarness";

// The fork ships English only. Older builds stored a German or Chinese
// display language, and the OS may be set to either; both must render English.
for (const stored of ["de", "zh"]) {
  test(`a stored "${stored}" display language on a German OS still renders English`, async () => {
    // Same budget as the overlay specs: harness boot alone may take two 90s
    // waits under pre-push worker contention.
    test.setTimeout(180_000);
    const errors: string[] = [];
    let harness: ElectronTestHarness | undefined;
    try {
      harness = await launchElectronTestHarness(`wfh-lang-${stored}-e2e-`, {
        lang: "de-DE",
        storage: { "app-language": stored },
        onPage: (page) => {
          page.on("pageerror", (error) => errors.push(error.message));
        },
      });
      const { page } = harness;

      expect(await page.evaluate(() => localStorage.getItem("app-language"))).toBe(stored);
      await expect(page.locator("#sidebar").getByText("Settings", { exact: true })).toBeVisible({
        timeout: 30_000,
      });
      expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");

      await page.locator('#sidebar [data-view="settings"]').click();
      await expect(page.locator('[data-setting="game-language"]')).toBeVisible();
      await expect(page.locator('[data-setting="language"]')).toHaveCount(0);
      expect(errors).toEqual([]);
    } finally {
      await closeElectronTestHarness(harness);
    }
  });
}
