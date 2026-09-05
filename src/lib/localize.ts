import { BASE_LOCALE } from "./editor-data";
import type { LocalizedText, Screen } from "./editor-types";

export type TextField = keyof LocalizedText;

/**
 * Slide copy for a locale.
 *
 * Only the three slide fields are localised — the mock app UI inside the
 * device is never translated. A locale with no entry, or an entry left blank,
 * falls back to the en-US source so a partly translated set still renders.
 */
export function resolveText(screen: Screen, locale: string): Required<LocalizedText> {
  const base = {
    headline: screen.headline,
    subhead: screen.subhead,
    brandChip: screen.brandChip,
  };
  if (locale === BASE_LOCALE) return base;

  const override = screen.translations[locale] ?? {};
  return {
    headline: override.headline?.trim() ? override.headline : base.headline,
    subhead: override.subhead?.trim() ? override.subhead : base.subhead,
    brandChip: override.brandChip?.trim() ? override.brandChip : base.brandChip,
  };
}

/** True when this locale carries its own copy for the field. */
export function hasTranslation(
  screen: Screen,
  locale: string,
  field: TextField,
): boolean {
  if (locale === BASE_LOCALE) return true;
  return Boolean(screen.translations[locale]?.[field]?.trim());
}

/** Screens with at least one translated field in this locale. */
export function translatedCount(screens: Screen[], locale: string): number {
  if (locale === BASE_LOCALE) return screens.length;
  return screens.filter((screen) => {
    const entry = screen.translations[locale];
    return Boolean(
      entry &&
        (entry.headline?.trim() ||
          entry.subhead?.trim() ||
          entry.brandChip?.trim()),
    );
  }).length;
}

/**
 * Locales an export should produce: the base, plus every locale any screen
 * carries copy for. Untranslated screens still render, falling back to base.
 */
export function exportLocales(screens: Screen[]): string[] {
  const found = new Set<string>();
  for (const screen of screens) {
    for (const [locale, entry] of Object.entries(screen.translations)) {
      if (
        entry.headline?.trim() ||
        entry.subhead?.trim() ||
        entry.brandChip?.trim()
      ) {
        found.add(locale);
      }
    }
  }
  return [BASE_LOCALE, ...[...found].filter((id) => id !== BASE_LOCALE).sort()];
}

/**
 * Builds the screen patch for an edit, routing it to the base fields in en-US
 * and to the locale's override otherwise.
 */
export function textPatch(
  screen: Screen,
  locale: string,
  field: TextField,
  value: string,
): Partial<Screen> {
  if (locale === BASE_LOCALE) return { [field]: value };
  return {
    translations: {
      ...screen.translations,
      [locale]: { ...screen.translations[locale], [field]: value },
    },
  };
}
