import { app } from "electron";

import { overlayPreviewUrl } from "../../services/overlayPreview";
import ctx from "../context";

import { overlayMessages } from "../overlayI18n";
import { createOverlayEditor } from "./rewardEditor";
import { overlayKindOf, overlayPlacementRect, overlayWindow, repositionOverlay } from "./registry";
import {
  DEFAULT_OVERLAY_FIELD_STYLE,
  OVERLAY_LAYOUT_KINDS,
  getOverlayDescriptor,
  isOverlayLayoutKind,
  type OverlayLayoutKind,
  type OverlayEditState,
} from "../../config/shared/overlayLayout";
import { OVERLAY_EDIT_STATE } from "../../config/shared/ipcChannels";
import {
  normalizeRewardPresentation,
  type RewardPresentation,
} from "../../config/shared/rewardPresentation";
import { handle, listen } from "../routeHandlers";
import { mainWindowRoutes } from "../../config/shared/ipcRoutes";
import { overlayRoutes } from "../../config/shared/overlayIpcRoutes";

const { api } = mainWindowRoutes;
const { overlay, overlayLayoutApi } = overlayRoutes;

export function registerOverlayEditor(
  persist: Parameters<typeof createOverlayEditor>[0]["persist"],
) {
  let lastReward: RewardPresentation | null = null;
  listen(overlay.reportPresentation, (event, raw: unknown) => {
    if (overlayKindOf(event.sender.id) !== "reward") return;
    const presentation = normalizeRewardPresentation(raw);
    if (presentation) lastReward = presentation;
  });
  function applySaved(state: OverlayEditState): void {
    overlayWindow(state.kind)?.webContents.send(OVERLAY_EDIT_STATE, state);
    repositionOverlay(state.kind);
  }
  const editor = createOverlayEditor({
    ctx,
    persist,
    applySaved,
    getLastReward: () => lastReward,
  });
  const kindFrom = (raw: unknown): OverlayLayoutKind => {
    if (!isOverlayLayoutKind(raw)) throw new Error("Invalid overlay kind");
    return raw;
  };
  handle(api.beginOverlayEdit, (event, raw: unknown) => editor.begin(event.sender, kindFrom(raw)));
  handle(api.getOverlayPreview, (_event, raw: unknown) => {
    const kind = kindFrom(raw);
    const descriptor = getOverlayDescriptor(kind);
    const reward = kind === "reward" ? editor.previewReward() : null;
    // The toast has a fixed CSS zoom that its editor deliberately removes.
    const fixedZoom = kind === "tradeNotification";
    const native = fixedZoom ? null : overlayWindow(kind);
    const resolved = fixedZoom ? null : overlayPlacementRect(kind);
    const size = native?.getSize();
    const zoomFactor = native?.webContents.getZoomFactor() ?? resolved?.zoomFactor ?? 1;
    const canvas = {
      width: size
        ? size[0] / zoomFactor
        : resolved
          ? resolved.width / zoomFactor
          : descriptor.canvas.width,
      height: size
        ? size[1] / zoomFactor
        : resolved
          ? resolved.height / zoomFactor
          : descriptor.canvas.height,
    };
    return {
      url: overlayPreviewUrl(app.getAppPath(), kind),
      descriptor: reward
        ? {
            ...descriptor,
            variants: [
              ...descriptor.variants,
              { value: "last", key: "rewardEditor.previewLast" as const },
            ],
          }
        : descriptor,
      canvas,
      lastReward: reward,
      theme: { ...ctx.overlayThemeVars },
      messages: overlayMessages(),
      defaultFieldStyle: DEFAULT_OVERLAY_FIELD_STYLE,
    };
  });
  handle(api.updateOverlayEdit, (event, token: unknown, command: unknown) =>
    editor.update(token, command, event.sender),
  );
  handle(api.endOverlayEdit, (event, token: unknown, save: unknown) =>
    editor.end(token, save, event.sender),
  );
  handle(overlayLayoutApi.getLayout, (event) => {
    const kind = overlayKindOf(event.sender.id);
    if (!kind) throw new Error("Unknown overlay sender");
    return editor.savedState(kind);
  });
  return {
    assertIdle() {
      if (editor.state().sessionId)
        throw new Error("Close the overlay editor before importing layouts");
    },
    refresh() {
      for (const kind of OVERLAY_LAYOUT_KINDS) applySaved(editor.savedState(kind));
    },
  };
}
