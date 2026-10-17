import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { APP_PRODUCT_NAME, WIN_APP_USER_MODEL_ID } from "../shared/appMeta";

// Only the dedicated beta packager writes this marker into the installed package.
function readDistribution(): { beta: boolean; local: boolean } {
  try {
    const metadata = JSON.parse(
      fs.readFileSync(path.join(app.getAppPath(), "package.json"), "utf8"),
    );
    const beta = metadata.wfhelperDistribution === "friends-beta";
    return { beta, local: beta && metadata.wfhelperLocalUpdateTest === true };
  } catch {
    return { beta: false, local: false };
  }
}

const distribution = readDistribution();
export const FRIENDS_BETA = distribution.beta;
export const DISTRIBUTION_NAME = distribution.local
  ? "WFHelper Beta Local"
  : FRIENDS_BETA
    ? "WFHelper Beta"
    : APP_PRODUCT_NAME;
export const DISTRIBUTION_APP_ID = distribution.local
  ? "com.aurablacklight.wfhelper.beta.local"
  : FRIENDS_BETA
    ? "com.aurablacklight.wfhelper.beta"
    : WIN_APP_USER_MODEL_ID;
