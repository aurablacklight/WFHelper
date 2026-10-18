import { overlaySettingsChanged, type OverlaySettingsListener } from "./overlay/settings";
import { createTray, destroyTray } from "./trayIpc";
import { applyMainWindowZoom } from "./mainWindowZoom";
import * as arbiRunTracker from "../services/arbiRunTracker";
import * as ptRunTracker from "../services/profitTakerTracker";
import * as missionRewards from "../services/missionRewards";
import * as wfmPresence from "../services/wfmPresence";
import * as inventorySync from "../services/inventorySync";
import { setOcrDebugDumpsEnabled } from "../services/rewardScanDebug";

type Subscribe = (listener: OverlaySettingsListener, options?: { atStartup?: boolean }) => unknown;

/** The settings each subsystem outside the overlays follows, applied once per change. */
export function registerSettingsEffects(subscribe: Subscribe): void {
  subscribe(
    (change) => {
      if (!overlaySettingsChanged(change, ["arbiTrackingEnabled"])) return;
      // One user-facing toggle covers both EE.log run trackers.
      const enabled = change.next.arbiTrackingEnabled !== false;
      arbiRunTracker.setArbiTrackingEnabled(enabled);
      ptRunTracker.setPtTrackingEnabled(enabled);
    },
    { atStartup: true },
  );
  subscribe(
    (change) => {
      if (!overlaySettingsChanged(change, ["missionTrackingEnabled"])) return;
      missionRewards.setTrackingEnabled(change.next.missionTrackingEnabled === true);
    },
    { atStartup: true },
  );
  subscribe(
    (change) => {
      if (!overlaySettingsChanged(change, ["keepRunningOnClose"])) return;
      if (change.next.keepRunningOnClose === true) createTray();
      else destroyTray();
    },
    { atStartup: true },
  );
  subscribe(
    (change) => {
      if (!overlaySettingsChanged(change, ["ocrDebugImagesEnabled"])) return;
      setOcrDebugDumpsEnabled(change.next.ocrDebugImagesEnabled !== false);
    },
    { atStartup: true },
  );
  subscribe(
    (change) => {
      if (
        !overlaySettingsChanged(change, [
          "wfmAutoIngameEnabled",
          "wfmStatusHoldMinutes",
          "wfmAwayIdleEnabled",
          "wfmAwayIdleMinutes",
          "wfmAwayWhenClosedEnabled",
        ])
      )
        return;
      const settings = change.next;
      wfmPresence.setOptions({
        autoIngameEnabled: settings.wfmAutoIngameEnabled === true,
        holdMinutes: settings.wfmStatusHoldMinutes,
        awayIdleEnabled: settings.wfmAwayIdleEnabled === true,
        awayIdleMinutes: settings.wfmAwayIdleMinutes,
        awayWhenClosedEnabled: settings.wfmAwayWhenClosedEnabled === true,
      });
    },
    { atStartup: true },
  );
  // Startup has its own pass once the data sources exist, and the window zooms on load.
  subscribe((change) => {
    if (overlaySettingsChanged(change, ["autoInventorySyncEnabled"]))
      inventorySync.apply("settings");
  });
  subscribe((change) => {
    if (overlaySettingsChanged(change, ["uiScale"])) applyMainWindowZoom();
  });
}
