# Framecraft CLI

Generate App Store screenshots from the terminal. Every feature of the web
editor is exposed as a command, so an agent can create a project, write copy,
translate it, and export production-ready PNGs without touching the UI.

```bash
npx github:AustineA/framecraft install   # or `npm run install-cli` in a clone
```

`framecraft status` shows where it installed to, `framecraft uninstall`
removes it. Installing writes a small launcher into `~/.local/bin` that pins
the Node it was installed with, so the command survives switching Node
versions and keeps working even when the active one is broken. The first export builds the app it renders into, which takes a
moment; every export after that reuses the build.

---

## The project file

Commands act on `framecraft.json` in the working directory, or the nearest
parent that has one — the way `package.json` is found. `init` creates it
where you are:

```bash
mkdir my-app && cd my-app
framecraft init --template finance --name Ledger
framecraft set --screen 1 --headline "Every account, one clear view."
```

Pass a path as the first argument to target a different file
(`framecraft show other.json`), which is how you drive several projects from
one directory.

---

## Flags are strict

Every command rejects flags it does not define, and suggests the nearest
match:

```bash
$ framecraft export --out ./out --screens 1
framecraft: Unknown flag: --screens (did you mean --screen?)
```

An ignored flag would report success while doing something else, which is
the failure an unattended run is least able to notice.

---

## Concepts

**Project file.** A single JSON file holding the whole set — screens, copy,
translations, devices, uploaded media. It is byte-compatible with what the web
editor saves, so the same file opens in either.

**Screen.** One App Store slide: a headline, a subhead, a brand chip, a
background, and a device frame wrapping a mock app screen.

**Screen selector.** Anywhere a command takes `--screen`, you may pass a
1-based index (`3`), a screen id (`ledger-3`), or `all`.

**Locale.** Slide copy only — the headline, subhead and brand chip. The mock
app UI inside the device is never translated. `en-US` is the source of truth;
any other locale stores overrides, and a field left blank falls back to en-US.
That is per field, so a screen with a translated headline and no subhead shows
the translated headline beside the English subhead.

**Exit codes.** `0` on success, `1` on any error, with the reason on stderr.

**`--json`.** Every read command accepts it and prints structured output
instead of a table. Use it when parsing.

---

## Reference commands

These need no project file.

| Command | Lists |
| --- | --- |
| `framecraft templates` | Starter sets, one per App Store category |
| `framecraft locales` | Locale ids and names |
| `framecraft devices` | Export sizes with exact pixel dimensions |
| `framecraft frames` | Device frames and titanium finishes |
| `framecraft fonts` | Bundled and system font stacks |
| `framecraft backgrounds` | Bright background presets |
| `framecraft apps` | App-screen kinds that render inside the device |
| `framecraft browsers` | Chromium-family browsers found on this machine |

```bash
framecraft templates
framecraft devices --json
```

---

## Projects

### `init`

```bash
framecraft init --template finance --name Ledger
```

| Flag | Meaning |
| --- | --- |
| `--template <id>` | Start from a template (`framecraft templates`). Omit for the default set. |
| `--name <name>` | Project name. Defaults to the template's name. |
| `--force` | Replace an existing `framecraft.json`. |

Writes `framecraft.json` in the current directory, and refuses to overwrite
one that already exists.

### `rename --name <name>`

Renames the project itself. The name is what the desktop app shows in its
project list, and what `export` uses when naming a run.

```bash
framecraft rename --name "Aperture Pro"
```

To rename a *screen* instead, use `set --screen <n> --screen-name <name>`.

### `show`

Summary plus a table of screens.

```bash
framecraft show --locale fr-FR
```

`--locale` renders the copy as that locale would resolve it, fallbacks
included. Defaults to the project's own locale.

### `screens`

Every screen with its resolved headline and subhead. Accepts `--locale`.

### `add`

```bash
framecraft add --name "Security" --after 2
```

Here `--name` is the new screen's name. The project name is set by
`init --name` and changed by `rename`.

`--after <n>` inserts after that position; omit to append. Screens renumber
automatically.

### `remove --screen <n|id>`

Removes a screen and renumbers. A project must keep at least one.

---

## Editing

### `set`

Applies to `--screen <n|id|all>` (defaults to `all`).

```bash
framecraft set --screen 1 --headline 'Money, finally\nmakes sense.'
framecraft set --screen all --bg "#C8F2DF" --font "System Rounded"
```

| Group | Flags |
| --- | --- |
| Text | `--headline` `--subhead` `--brand-chip` |
| Visibility | `--show-headline` `--hide-headline` `--show-chip` `--hide-chip` `--show-device` `--hide-device` |
| Type | `--font <name>` `--font-size <8-160>` `--align left\|center\|right` |
| Canvas | `--bg <#hex>` `--app <kind>` `--screen-name <name>` |
| Device | `--frame <name>` `--device-color <name>` `--device-scale <40-120>` `--device-x <px>` `--device-y <px>` |
| Text block | `--text-x <px>` `--text-y <px>` |
| Locale | `--locale <id>` routes the text flags into that locale |

`\n` in a text flag becomes a line break. Quote the value so the shell keeps
the backslash literal.

Positions are offsets in artboard pixels from where the element normally sits;
`--device-scale 84` is the authored size.

---

## Translation

### `translate --locale <id>`

One screen at a time:

```bash
framecraft translate --locale fr-FR --screen 1 \
  --headline "L'argent,\nenfin limpide."
```

Or in bulk from a JSON file:

```bash
framecraft translate --locale fr-FR --from fr.json
```

`fr.json` may be an object keyed by screen number or id:

```json
{
  "1": { "headline": "L'argent,\nenfin limpide.", "subhead": "Des soldes en direct." },
  "ledger-3": { "headline": "Où va vraiment\nvotre argent." }
}
```

…or an array in screen order:

```json
[{ "headline": "…" }, { "headline": "…" }]
```

Only the fields you supply are written; the rest keep falling back to en-US.

### `translations`

Coverage per screen and field.

```bash
framecraft translations 
framecraft translations --locale fr-FR --json
```

### `clear-translations --locale <id>`

Drops a locale's overrides, optionally for one `--screen`.

---

## Export

```bash
framecraft export --out ./screenshots
```

Renders every screen × device × locale to disk at exact App Store Connect
dimensions.

| Flag | Default | Meaning |
| --- | --- | --- |
| `--out <dir>` | required | Output directory |
| `--screen <n\|id>` | Export a single screen. Defaults to all. |
| `--devices <ids>` | project's selection | Comma separated, from `framecraft devices` |
| `--locales <ids>` | en-US + every translated locale | Comma separated |
| `--format png\|jpeg` | `png` | JPEG is written at quality 92 |
| `--flat` | off | One folder instead of per-locale folders |
| `--simple-names` | off | Drop screen name and device from filenames |
| `--url <url>` | — | Render against a server you already run |
| `--browser <path>` | auto-detected | Browser binary, or set `BROWSER_PATH` |

Layout:

```
screenshots/
├── en-US/01-opening-hook-iphone-6-9-inch.png   1320 × 2868
├── fr-FR/01-opening-hook-iphone-6-9-inch.png
└── de-DE/01-opening-hook-iphone-6-9-inch.png
```

Every folder is a complete, uploadable set: untranslated screens still render,
falling back to English.

### How rendering works

Export drives a headless browser against the app's `/render` route, so output
matches the editor exactly — same components, fonts, gradients and device
frames. The artboard is authored at 392 px and scaled into a box of the
device's exact pixel size, then captured at a device scale factor of 1. Text
stays vector-sharp and dimensions are exact rather than rounded.

### Browsers

Any Chromium-family browser works, since they all speak the same DevTools
protocol. The CLI searches for these, in order, on macOS, Linux and Windows:

**Google Chrome · Chromium · Brave · Microsoft Edge · Vivaldi**

```bash
framecraft browsers          # what is installed here
```

```
BROWSER        PATH
─────────────  ────────────────────────────────────────────────────────────
Google Chrome  /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
Brave          /Applications/Brave Browser.app/Contents/MacOS/Brave Browser
```

Override the choice with a flag or the environment:

```bash
framecraft export --out ./out \
  --browser "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"

BROWSER_PATH="/usr/bin/brave-browser" framecraft export --out ./out
```

`--chrome` and `CHROME_PATH` remain accepted as aliases. Export prints which
browser it picked, so the choice is never a mystery.

**Other requirements.** Without `--url` the CLI starts the app itself, which
needs `npm run build` first. Pointing at a running dev server with
`--url http://localhost:3000` skips that.

---

## Opening CLI work in the app

A project file is the same format in both directions, so work moves either
way without a conversion step.

| Direction | How |
| --- | --- |
| CLI → app | Start screen → **Open file** → pick the `.json` |
| App → CLI | Project menu (the name in the header) → **Download file** |

A file opened in the app becomes a normal saved project, so it keeps
autosaving from then on; the file on disk is a snapshot and does not update
behind you. Download again to hand the latest state back to the CLI.

Everything survives the trip — screens, translations, fonts, device frames,
positions, uploaded media and export settings — because both sides read and
write the same `ProjectFile` shape:

```json
{ "framecraft": 1, "name": "Aperture Pro", "updatedAt": "…", "project": { … } }
```

---

## Agent recipe

A complete localised set from nothing:

```bash
framecraft init --template shopping --name Marketplace --json

framecraft set --screen 1 \
  --headline 'Things worth\nkeeping.' \
  --subhead 'Considered goods from makers you trust.' \
  --bg '#FFDCC7' --json

framecraft translate --locale de-DE --from de.json --json
framecraft translate --locale ja-JP --from ja.json --json

framecraft translations --json      # confirm coverage
framecraft export --out ./out \
  --devices iphone-69,iphone-65,ipad-13 --json
```

The final command prints every written path:

```json
{
  "out": "./out",
  "files": ["en-US/01-opening-hook-iphone-6-9-inch.png", "…"]
}
```

### Notes for agents

- Read state with `show --json` or `screens --json` before editing; both
  return screen ids you can pass back to `--screen`.
- `translations --json` tells you exactly which fields are still falling back,
  so you can translate only what is missing.
- Every command writes the file in place. There is no separate save step.
- Work in the project's own directory and omit the path. To drive several
  projects from one place, pass each path as the first argument instead
  (`framecraft set other.json --screen 1 …`).
- Export time scales with screens × devices × locales. Six screens across
  three devices and three locales is 54 renders — pass narrower `--devices`
  and `--locales` when iterating.
