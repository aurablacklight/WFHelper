import { expect, test } from "@playwright/test";
import {
  closeElectronTestHarness,
  evaluateInMain,
  launchElectronTestHarness,
} from "./electronTestHarness";

test("sidebar feedback opens the fork and has no community buttons", async () => {
  const harness = await launchElectronTestHarness("fork-feedback-");
  try {
    const { app, page } = harness;
    await evaluateInMain(app, ({ shell }) => {
      const state = globalThis as unknown as { feedbackUrls: string[] };
      state.feedbackUrls = [];
      shell.openExternal = async (url) => {
        state.feedbackUrls.push(url);
      };
    });
    for (const collapsed of [false, true]) {
      if (collapsed) await page.locator("[data-sidebar-collapse]").click();
      await expect(page.locator("#sidebar [data-community-link]")).toHaveCount(0);
      const feedback = page.locator("#sidebar [data-feedback-open]");
      await expect(feedback).toHaveAccessibleName("Feedback");
      await feedback.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("[data-feedback-modal]")).toHaveCount(0);
    }
    await expect
      .poll(() =>
        evaluateInMain(
          app,
          () => (globalThis as unknown as { feedbackUrls: string[] }).feedbackUrls,
        ),
      )
      .toEqual(Array(2).fill("https://github.com/aurablacklight/WFHelper/issues/new/choose"));
  } finally {
    await closeElectronTestHarness(harness);
  }
});
