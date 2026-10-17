import { beforeEach, describe, expect, it, vi } from "vitest";

const read = vi.hoisted(() => vi.fn());
vi.mock("node:fs", () => ({ default: { readFileSync: read } }));
vi.mock("electron", () => ({ app: { getAppPath: () => "/packaged/app" } }));

describe("installed distribution identity", () => {
  beforeEach(() => {
    vi.resetModules();
    read.mockReset();
  });

  it("isolates the friends beta from the stable application", async () => {
    read.mockReturnValue(JSON.stringify({ wfhelperDistribution: "friends-beta" }));
    const distribution = await import("../../config/runtime/distribution");
    expect(distribution.FRIENDS_BETA).toBe(true);
    expect(distribution.DISTRIBUTION_NAME).toBe("WFHelper Beta");
    expect(distribution.DISTRIBUTION_APP_ID).toBe("com.aurablacklight.wfhelper.beta");
  });

  it("keeps localhost updater tests separate from friends beta installs", async () => {
    read.mockReturnValue(
      JSON.stringify({ wfhelperDistribution: "friends-beta", wfhelperLocalUpdateTest: true }),
    );
    const distribution = await import("../../config/runtime/distribution");
    expect(distribution.FRIENDS_BETA).toBe(true);
    expect(distribution.DISTRIBUTION_NAME).toBe("WFHelper Beta Local");
    expect(distribution.DISTRIBUTION_APP_ID).toBe("com.aurablacklight.wfhelper.beta.local");
  });

  it.each(["{}", '{"version":"1.0.0-beta.1"}', '{"wfhelperDistribution":"other"}'])(
    "keeps unmarked packages on stable identity: %s",
    async (metadata) => {
      read.mockReturnValue(metadata);
      const distribution = await import("../../config/runtime/distribution");
      expect(distribution.FRIENDS_BETA).toBe(false);
      expect(distribution.DISTRIBUTION_NAME).toBe("WFHelper");
      expect(distribution.DISTRIBUTION_APP_ID).toBe("com.wfhelper.app");
    },
  );
});
