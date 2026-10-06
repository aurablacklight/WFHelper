import { assertMainRendererSender, handleAuthorized } from "./ipcSecurity";
import ctx from "./context";
import * as gunBuildAdvisor from "../services/buildAdvisor/gunBuildAdvisor";
import type { GunBuildReview } from "../config/shared/buildAdvisorTypes";
import { toNonEmptyString } from "../config/shared/stringValidation";
import { BUILD_ADVISOR_GUNS, BUILD_ADVISOR_REVIEW } from "../config/shared/ipcChannels";

const NOT_OWNED: GunBuildReview = {
  advice: { ok: false, reason: "weapon-not-owned" },
  configs: [],
};

function register(): void {
  handleAuthorized(BUILD_ADVISOR_GUNS, assertMainRendererSender, () =>
    ctx.currentInventoryData ? gunBuildAdvisor.listOwnedGuns(ctx.currentInventoryData) : [],
  );

  handleAuthorized(
    BUILD_ADVISOR_REVIEW,
    assertMainRendererSender,
    (_event, weaponType: unknown, assumeConditionals: unknown) => {
      const type = toNonEmptyString(weaponType, 512);
      if (!type || !ctx.currentInventoryData) return NOT_OWNED;
      // Stacks up unless the renderer asks for arsenal numbers.
      return gunBuildAdvisor.reviewGun(ctx.currentInventoryData, type, undefined, {
        assumeConditionals: assumeConditionals !== false,
      });
    },
  );
}

export { register };
