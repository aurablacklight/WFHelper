import { readable, type Readable } from "svelte/store";
import { en, type MessageKey } from "../i18n/en.js";

type MessageParamValue = string | number;
type MessageParams = Record<string, MessageParamValue>;
// The fork ships English only. The type stays so number and date formatting
// call sites name the locale they format for.
export type LocaleCode = "en";
export type Translator = (key: MessageKey, params?: MessageParams) => string;

// A stale "app-language" of de or zh from an older build is never read, so it
// simply renders English.
export const locale: Readable<LocaleCode> = readable("en");

function interpolate(template: string, params: MessageParams): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key];
    return value == null ? `{${key}}` : String(value);
  });
}

const translate: Translator = (key, params = {}) => interpolate(en[key] ?? key, params);

// A store so components keep reading $tr. Svelte only tracks $tr where it is
// textual: a helper that reads it is untracked at the call site. Return a
// MessageKey, or take the translator as a parameter.
export const tr: Readable<Translator> = readable(translate);

export type { MessageKey };
