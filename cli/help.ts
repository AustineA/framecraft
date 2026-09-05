export const HELP = `framecraft — App Store screenshot generation for humans and agents

USAGE
  framecraft <command> [options]

  Commands act on the framecraft.json in this directory, or the nearest
  parent that has one — so no path is needed. Pass one to target another
  file. Projects are the same JSON the web editor saves.

  Every read command accepts --json for machine-readable output.

SETUP
  install                      Put framecraft on your PATH
  uninstall                    Remove it
  status                       Where it is installed from

REFERENCE (no project needed)
  templates                    Starter sets, one per App Store category
  locales                      Locales available for slide copy
  devices                      Export sizes (App Store Connect dimensions)
  frames                       Device frames drawn around the app screen
  fonts                        Bundled and system font stacks
  backgrounds                  Bright background presets
  apps                         App-screen kinds that render inside the device
  browsers                     Chromium-family browsers found on this machine

PROJECTS
  init [--template <id>] [--name <name>] [--force]
      Create framecraft.json here. Without --template you get the default
      set; --force replaces an existing project.

  rename --name <name>         Rename the project
  show [--locale <id>]         Summarise the project and its screens
  screens [--locale <id>]      List screens with their resolved copy
  add [--name <name>] [--after <n>]
  remove --screen <n|id>

EDITING
  set --screen <n|id|all> [options]
      Text        --headline --subhead --brand-chip
      Visibility  --show-headline --hide-headline --show-chip --hide-chip
                  --show-device --hide-device --show-status --hide-status
      Type        --font <name> --font-size <px> --subhead-size <px> --align left|center|right
      Canvas      --bg <#hex> --app <kind> --screen-name <name>
      Device      --frame <name> --device-color <name> --device-scale <40-120>
                  --device-x <px> --device-y <px>
      Text block  --text-x <px> --text-y <px>
      Locale      --locale <id>   Route text edits into that locale

  Text flags accept \\n for a line break.

TRANSLATION
  translate --locale <id> --screen <n|id> [--headline …] [--subhead …] [--brand-chip …]
  translate --locale <id> --from <json>
      Bulk import. JSON is either an array in screen order, or an object
      keyed by screen id or 1-based number:
        { "1": { "headline": "…" }, "streaks": { "subhead": "…" } }

  translations [--locale <id>]
      Coverage per screen. Missing fields fall back to en-US.

  clear-translations --locale <id> [--screen <n|id|all>]

EXPORT
  export --out <dir> [options]
      --screen <n|id>    Export one screen. Default: all
      --devices <ids>    Comma separated. Default: the project's selection
      --locales <ids>    Default: en-US plus every translated locale
      --format png|jpeg  Default png
      --flat             One folder instead of per-locale folders
      --simple-names     Drop screen name and device from filenames
      --url <url>        Use a running server instead of starting one
      --browser <path>   Browser to render with (or set BROWSER_PATH)
                         Auto-detects Chrome, Chromium, Brave, Edge, Vivaldi

  Output is <out>/<locale>/<nn>-<screen>-<device>.png at exact App Store sizes.

  Unknown flags are rejected rather than ignored, so a typo fails loudly
  instead of quietly producing the wrong output.

EXAMPLES
  framecraft init --template finance --name Ledger
  framecraft set --screen 1 --headline "Every account,\\none clear view."
  framecraft set --screen all --bg "#CDE7FF" --font "System"
  framecraft translate --locale fr-FR --from fr.json
  framecraft export --out ./screenshots --devices iphone-69,ipad-13
`;
