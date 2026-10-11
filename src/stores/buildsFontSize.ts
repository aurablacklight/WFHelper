import { persistedPresetNumber } from "../lib/persistence.js";

export const BUILDS_FONT_SIZES = [14, 16, 18, 20] as const;
export const buildsFontSize = persistedPresetNumber("wf_builds_font_size", BUILDS_FONT_SIZES, 16);
