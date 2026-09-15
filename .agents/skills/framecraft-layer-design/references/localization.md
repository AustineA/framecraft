# Layer localization

Read this only when the screenshot set needs more than the base `en-US` copy.

Framecraft text layers support locale overrides directly:

```json
{
  "kind": "text",
  "text": "Water on time",
  "translations": {
    "fr-FR": "Arrosez à temps",
    "de-DE": "Pünktlich gießen"
  }
}
```

The base `text` is the en-US value and the fallback for missing or blank overrides. A locale used only by a text layer is still discovered automatically during export. `clear-translations` removes both built-in screen copy and layer overrides for the selected locale.

Keep translations in the same generated project when possible. The CLI exports en-US plus every locale found in screen or layer translations:

```sh
framecraft export framecraft.json --out export --simple-names
```

For headline translations, preserve the semantic promise and intended line count. Measure each locale independently and shrink within a reasonable range. Reword a translation when fitting it would make the typography materially weaker.

Use installed script-appropriate fonts for Arabic, Devanagari, CJK, and other scripts not covered by Inter. Set letter spacing to zero for scripts where tracking harms shaping. Give Arabic and Devanagari extra vertical room so marks and ascenders are not clipped. Review at least one RTL export and every non-Latin script family at full size.
