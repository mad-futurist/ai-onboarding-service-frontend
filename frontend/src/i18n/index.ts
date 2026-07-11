import en from "./en";
import uk from "./uk";

export { LOCALES } from "./locales";
export type { Locale } from "./locales";
export { formatMessage } from "./formatMessage";

import type { Locale } from "./locales";

export const MESSAGES: Record<Locale, Record<string, string>> = {
  en,
  uk,
};

export { default as uiTranslationsUk } from "./legacy/uiTranslationsUk";
