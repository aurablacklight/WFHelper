import ctx from "./context";
import * as gunBuildAdvisor from "../services/buildAdvisor/gunBuildAdvisor";
import {
  ADVISOR_FACTIONS,
  type AdvisorFaction,
  type GunBuildReview,
} from "../config/shared/buildAdvisorTypes";
import { toNonEmptyString } from "../config/shared/stringValidation";

import { handle } from "./routeHandlers";
import { mainWindowRoutes } from "../config/shared/ipcRoutes";

const { api } = mainWindowRoutes;

const NOT_OWNED: GunBuildReview = {
  advice: { ok: false, reason: "weapon-not-owned" },
  configs: [],
};

function knownFaction(value: unknown): AdvisorFaction | null {
  return ADVISOR_FACTIONS.find((faction) => faction === value) ?? null;
}

function register(): void {
  handle(api.getBuildAdvisorGuns, () =>
    ctx.currentInventoryData ? gunBuildAdvisor.listOwnedGuns(ctx.currentInventoryData) : [],
  );

  handle(
    api.reviewGunBuild,
    (
      _event,
      weaponType: unknown,
      assumeConditionals: unknown,
      faction: unknown,
      respectCapacity: unknown,
    ) => {
      const type = toNonEmptyString(weaponType, 512);
      if (!type || !ctx.currentInventoryData) return NOT_OWNED;
      return gunBuildAdvisor.reviewGun(ctx.currentInventoryData, type, undefined, {
        // Stacks up unless the renderer asks for arsenal numbers.
        assumeConditionals: assumeConditionals !== false,
        faction: knownFaction(faction),
        respectCapacity: respectCapacity !== false,
      });
    },
  );
}

export { register };
