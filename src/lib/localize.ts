import { BASE_LOCALE } from "./editor-data";
import type { Layer, LocalizedText, Screen } from "./editor-types";

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

/** Text shown by a freeform text layer in a locale. */
export function resolveLayerText(layer: Layer, locale: string): string {
  if (locale === BASE_LOCALE) return layer.text;
  const override = layer.translations?.[locale];
  return override?.trim() ? override : layer.text;
}

/** True when a text layer carries its own copy for the active locale. */
export function hasLayerTextTranslation(layer: Layer, locale: string): boolean {
  return locale === BASE_LOCALE || Boolean(layer.translations?.[locale]?.trim());
}

/** Routes a layer text edit to base copy or the current locale's override. */
export function layerTextPatch(
  layer: Layer,
  locale: string,
  value: string,
): Partial<Layer> {
  if (locale === BASE_LOCALE) return { text: value };
  return {
    translations: {
      ...layer.translations,
      [locale]: value,
    },
  };
}

function screenHasLayerTranslation(screen: Screen, locale: string): boolean {
  return Boolean(
    screen.layers?.some((layer) =>
      layer.kind === "text" && hasLayerTextTranslation(layer, locale),
    ),
  );
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
    ) || screenHasLayerTranslation(screen, locale);
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
    for (const layer of screen.layers ?? []) {
      if (layer.kind !== "text") continue;
      for (const [locale, value] of Object.entries(layer.translations ?? {})) {
        if (value.trim()) found.add(locale);
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
