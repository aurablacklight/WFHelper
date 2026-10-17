import en from "../src/i18n/en.json";

type MessageKey = keyof typeof en;

// The overlays are plain HTML windows with no access to the renderer's i18n
// store, so main resolves their text and hands the finished strings over IPC.
// The fork ships English only, so en.json is the single source.
const OVERLAY_MESSAGE_KEYS = [
  "relics.quality.intact",
  "relics.quality.exceptional",
  "relics.quality.flawless",
  "relics.quality.radiant",
  "arbi.vitus.actual",
  "arbi.metric.expectedVitusPerMin",
  "arbi.metric.enemiesPerMin",
  "arbi.kpi.killsPerDrone",
  "arbi.kpi.avgInterval",
  "relics.squadLabel",
  "common.unknown",
  "arbi.end.aborted",
  "arbi.end.mission-end",

  "market.ownedCount",
  "arbi.type.defense",
  "arbi.type.interception",
  "common.arbitrationSummary",
  "common.close",
  "common.dismiss",
  "common.ducats",
  "common.mastered",
  "common.notMastered",
  "common.platinum",
  "common.unvaulted",
  "common.vaulted",
  "overlay.arbi.complete",
  "overlay.arbi.details",
  "overlay.arbi.droneKills",
  "overlay.arbi.expectedVitus",
  "overlay.arbi.missionFallback",
  "overlay.arbi.rotations",
  "overlay.arbi.saturation",
  "overlay.arbi.totalKills",
  "overlay.arbi.unknownNode",
  "overlay.hint.dragToMove",
  "overlay.hint.editReward",
  "overlay.hint.interact",
  "overlay.hint.interactPanel",
  "overlay.hint.interactViaSettings",
  "overlay.hint.rightClickDrag",
  "overlay.hint.settingsThenDrag",
  "overlay.hint.unlockThenDrag",
  "overlay.planner.eraUnknown",
  "overlay.planner.expectedDucats",
  "overlay.planner.expectedPlatinum",
  "overlay.planner.expectedProfits",
  "overlay.planner.noRecommendations",
  "overlay.planner.scanning",
  "overlay.reward.bestLabel",
  "overlay.reward.captureUnavailable",
  "overlay.reward.detecting",
  "overlay.reward.inFoundry",
  "overlay.reward.noPricedRewards",
  "overlay.reward.ocrFailed",
  "overlay.reward.ocrFailedShort",
  "overlay.reward.ocrUnavailable",
  "overlay.reward.ownedParts",
  "overlay.reward.partFallback",
  "overlay.reward.partInFoundry",
  "overlay.reward.partIsReward",
  "overlay.reward.rarity.common",
  "overlay.reward.rarity.rare",
  "overlay.reward.rarity.uncommon",
  "overlay.reward.scanning",
  "overlay.reward.setParts",
  "overlay.reward.setPrice",
  "overlay.reward.slot",
  "overlay.riven.bestNegatives",
  "overlay.riven.bestPositives",
  "overlay.riven.current",
  "overlay.riven.matchPercent",
  "overlay.riven.newRoll",
  "overlay.riven.readFailed",
  "overlay.riven.rescan",
  "overlay.riven.rescanning",
  "overlay.riven.roll",
  "overlay.riven.rollReadFailed",
  "overlay.riven.rolls",
  "overlay.riven.scanning",
  "overlay.riven.scanningCurrent",
  "overlay.riven.scanningRoll",
  "overlay.riven.textTooSmall",
  "overlay.riven.waitingForRoll",
  "overlay.riven.waitingForScan",
  "overlay.riven.weaponMissing",
  "overlay.trade.closingFailed",
  "overlay.trade.listingClosed",
  "overlay.trade.noListingMatched",
  "overlay.trade.repAlready",
  "overlay.trade.repFailed",
  "overlay.trade.repNotFound",
  "overlay.trade.repOffer",
  "overlay.trade.repSent",
  "overlay.trade.repUnconfirmed",
  "overlay.trade.tradeFinished",
  "overlay.trade.unknownItem",
  "overlay.window.trade",
  "rivens.detail.similarOnWfm",
  "rivens.detail.auctionsChip",
  "rivens.detail.auctionsChipTitle",
  "rivens.detail.noSimilarFound",
  "settings.overlayTitle",
  "settings.rivenOverlay",
  "stats.filterPurchase",
  "stats.filterSale",
  "stats.filterTrade",
] as const satisfies readonly MessageKey[];

/** A string main renders itself (the tray menu), not an overlay key. These are
 *  outside OVERLAY_MESSAGE_KEYS because no overlay window asks for them, and the
 *  fallback keeps the menu readable if the catalogue ever loses the key. */
export function mainMessage(key: MessageKey, fallback: string): string {
  return en[key] ?? fallback;
}

interface OverlayMessageBundle {
  locale: string;
  messages: Record<string, string>;
}

export function overlayMessages(): OverlayMessageBundle {
  const messages: Record<string, string> = {};
  for (const key of OVERLAY_MESSAGE_KEYS) messages[key] = en[key];
  return { locale: "en", messages };
}
