#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { relative } from "node:path";

import {
  BRIGHT_BACKGROUNDS,
  DEVICE_COLORS,
  EXPORT_DEVICES,
  FONT_GROUPS,
  LOCALES,
  PHONE_FRAMES,
  localeName,
} from "../src/lib/editor-data";
import type { Align, LocalizedText, Screen } from "../src/lib/editor-types";
import {
  exportLocales,
  hasTranslation,
  resolveText,
  textPatch,
} from "../src/lib/localize";
import { TEMPLATES } from "../src/lib/templates";

import {
  assertKnownFlags,
  bool,
  list,
  num,
  parse,
  str,
  type Flags,
} from "./args";
import { HELP } from "./help";
import { install, status, uninstall } from "./install";
import { emit, info, rows } from "./output";
import { exportProject, installedBrowsers } from "./render";
import {
  CliError,
  create,
  findProject,
  load,
  newProjectPath,
  renumber,
  save,
  selectScreens,
} from "./store";

const APP_KINDS = [
  "today", "plan", "streak", "insights", "focus", "upgrade",
  "finance-home", "finance-detail", "tasks-home", "tasks-detail",
  "social-home", "social-detail", "photo-home", "photo-detail",
  "shop-home", "shop-detail",
];

/** `\n` in a shell argument should become a real line break. */
function unescape(value: string): string {
  return value.replace(/\\n/g, "\n");
}

function oneOf(name: string, value: string, allowed: string[]): string {
  if (!allowed.includes(value)) {
    throw new CliError(`Invalid --${name} "${value}". Options: ${allowed.join(", ")}`);
  }
  return value;
}

/* ------------------------------------------------------------ reference -- */

function reference(command: string, json: boolean): boolean {
  switch (command) {
    case "install": {
      const result = install();
      emit(json, result, () => {
        info(`\n  ✅ framecraft is ready\n     ${result.bin}\n`);
        if (result.copied) info(`  Installed to ${result.root}`);
        else info(`  Linked from ${result.root}`);
        if (!result.onPath) {
          info(`\n  ⚠️  ${result.bin.replace(/\/framecraft$/, "")} is not on your PATH.`);
          info("     Add it to your shell profile to use the command.");
        }
        info("  Remove it with `framecraft uninstall`.\n");
      });
      return true;
    }

    case "uninstall": {
      const result = uninstall();
      emit(json, result, () => {
        if (!result.unlinked && !result.removed) info("framecraft was not installed.");
        else info(`Removed framecraft${result.removed ? ` and ${result.removed}` : ""}.`);
      });
      return true;
    }

    case "status": {
      const result = status();
      emit(json, result, () =>
        info(result.installed
          ? `framecraft ${result.bin}\n  app:  ${result.root}\n  node: ${result.node}`
          : `Running from ${result.root}, but not installed.\n` +
            "  Run `framecraft install`."));
      return true;
    }

    case "templates":
      emit(json, TEMPLATES.map((t) => ({ id: t.id, name: t.name, category: t.category, tagline: t.tagline })), () =>
        rows(["ID", "NAME", "CATEGORY", "DESCRIPTION"],
          TEMPLATES.map((t) => [t.id, t.name, t.category, t.tagline])));
      return true;

    case "locales":
      emit(json, LOCALES, () =>
        rows(["ID", "NAME"], LOCALES.map((l) => [l.id, l.name])));
      return true;

    case "devices":
      emit(json, EXPORT_DEVICES, () =>
        rows(["ID", "NAME", "SIZE"],
          EXPORT_DEVICES.map((d) => [d.id, d.name, `${d.width} x ${d.height}`])));
      return true;

    case "frames":
      emit(json, { frames: PHONE_FRAMES, colors: DEVICE_COLORS }, () => {
        rows(["FRAME", "KIND", "DISPLAY"],
          PHONE_FRAMES.map((f) => [f.name, f.kind, `${f.ptW} x ${f.ptH} pt`]));
        info("");
        rows(["FINISH"], DEVICE_COLORS.map((c) => [c]));
      });
      return true;

    case "fonts":
      emit(json, FONT_GROUPS, () =>
        rows(["GROUP", "FONT"],
          FONT_GROUPS.flatMap((g) => g.fonts.map((f) => [g.label, f.name]))));
      return true;

    case "backgrounds":
      emit(json, BRIGHT_BACKGROUNDS, () =>
        rows(["NAME", "HEX"], BRIGHT_BACKGROUNDS.map((b) => [b.name, b.hex])));
      return true;

    case "browsers": {
      const found = installedBrowsers();
      emit(json, found, () =>
        found.length
          ? rows(["BROWSER", "PATH"], found.map((b) => [b.name, b.path]))
          : info("No Chromium-family browser found. Pass --browser <path>."));
      return true;
    }

    case "apps":
      emit(json, APP_KINDS, () => rows(["APP SCREEN"], APP_KINDS.map((k) => [k])));
      return true;

    default:
      return false;
  }
}

/* -------------------------------------------------------------- editing -- */

function applySet(screen: Screen, flags: Flags, locale: string): Screen {
  let next: Screen = { ...screen };

  const text: [keyof LocalizedText, string | undefined][] = [
    ["headline", str(flags, "headline")],
    ["subhead", str(flags, "subhead")],
    ["brandChip", str(flags, "brand-chip")],
  ];
  for (const [field, value] of text) {
    if (value !== undefined) {
      next = { ...next, ...textPatch(next, locale, field, unescape(value)) };
    }
  }

  // `--name` on `set` used to mean the screen; that clashed with the project
  // name, so the screen flag is explicit and the old spelling still works.
  const screenName = str(flags, "screen-name") ?? str(flags, "name");
  if (screenName !== undefined) next.name = screenName;

  const bg = str(flags, "bg");
  if (bg !== undefined) {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(bg)) {
      throw new CliError(`--bg must be a hex colour, got "${bg}"`);
    }
    next.bg = bg;
  }

  const app = str(flags, "app");
  if (app !== undefined) next.app = oneOf("app", app, APP_KINDS) as Screen["app"];

  const font = str(flags, "font");
  if (font !== undefined) next.fontFamily = font;

  const fontSize = num(flags, "font-size");
  if (fontSize !== undefined) next.fontSize = Math.min(160, Math.max(8, fontSize));

  const subheadSize = num(flags, "subhead-size");
  if (subheadSize !== undefined) next.subheadSize = Math.min(120, Math.max(8, subheadSize));

  const align = str(flags, "align");
  if (align !== undefined) {
    next.align = oneOf("align", align, ["left", "center", "right"]) as Align;
  }

  const frame = str(flags, "frame");
  if (frame !== undefined) {
    next.deviceFrame = oneOf("frame", frame, PHONE_FRAMES.map((f) => f.name));
  }

  const deviceColor = str(flags, "device-color");
  if (deviceColor !== undefined) {
    next.deviceColor = oneOf("device-color", deviceColor, DEVICE_COLORS);
  }

  const scale = num(flags, "device-scale");
  if (scale !== undefined) next.deviceScale = Math.min(120, Math.max(40, scale));

  const deviceX = num(flags, "device-x");
  if (deviceX !== undefined) next.deviceX = deviceX;
  const deviceY = num(flags, "device-y");
  if (deviceY !== undefined) next.deviceY = deviceY;
  const textX = num(flags, "text-x");
  if (textX !== undefined) next.textX = textX;
  const textY = num(flags, "text-y");
  if (textY !== undefined) next.textY = textY;

  if (bool(flags, "hide-headline")) next.headlineVisible = false;
  if (bool(flags, "show-headline")) next.headlineVisible = true;
  if (bool(flags, "hide-chip")) next.brandChipVisible = false;
  if (bool(flags, "show-chip")) next.brandChipVisible = true;
  if (bool(flags, "hide-device")) next.deviceVisible = false;
  if (bool(flags, "show-device")) next.deviceVisible = true;
  if (bool(flags, "hide-status")) next.deviceChrome = false;
  if (bool(flags, "show-status")) next.deviceChrome = true;

  return next;
}

/* ------------------------------------------------------------ validation -- */

/** Flags every command accepts, so a typo fails loudly instead of silently. */
const SET_FLAGS = [
  "screen", "locale", "headline", "subhead", "brand-chip", "screen-name",
  "name", "bg", "app", "font", "font-size", "subhead-size", "align", "frame",
  "device-color", "device-scale", "device-x", "device-y", "text-x", "text-y",
  "hide-headline", "show-headline", "hide-chip", "show-chip",
  "hide-device", "show-device", "hide-status", "show-status",
] as const;

const COMMAND_FLAGS: Record<string, readonly string[]> = {
  init: ["name", "template", "force"],
  rename: ["name"],
  show: ["locale"],
  screens: ["locale"],
  add: ["name", "after"],
  remove: ["screen"],
  set: SET_FLAGS,
  translate: ["locale", "screen", "from", "headline", "subhead", "brand-chip"],
  translations: ["locale"],
  "clear-translations": ["locale", "screen"],
  export: [
    "out", "screen", "devices", "locales", "format", "simple-names", "flat",
    "url", "browser", "chrome",
  ],
};

/* ------------------------------------------------------------- commands -- */

async function run(argv: string[]): Promise<void> {
  const { positional, flags } = parse(argv);
  const command = positional[0];
  const json = bool(flags, "json");

  if (!command || bool(flags, "help") || command === "help") {
    process.stdout.write(HELP);
    return;
  }
  if (reference(command, json)) return;

  const known = COMMAND_FLAGS[command];
  if (known) assertKnownFlags(flags, [...known, "json", "help"]);

  // A path is optional: without one, commands act on the framecraft.json in
  // this directory or a parent, and `init` creates one here.
  const explicit = positional[1];
  const path =
    command === "init"
      ? newProjectPath(explicit, bool(flags, "force"))
      : findProject(explicit);

  switch (command) {
    case "init": {
      const file = create(str(flags, "name") ?? "", str(flags, "template"));
      save(path, file);
      const shown = relative(process.cwd(), path) || path;
      emit(json, { file: path, name: file.name, screens: file.project.screens.length }, () =>
        info(`Created ${shown} — ${file.name}, ${file.project.screens.length} screens`));
      return;
    }

    case "rename": {
      const file = load(path);
      const name = str(flags, "name");
      if (!name?.trim()) throw new CliError("rename needs --name <name>");
      const previous = file.name;
      file.name = name.trim();
      save(path, file);
      emit(json, { from: previous, to: file.name }, () =>
        info(`Renamed "${previous}" to "${file.name}"`));
      return;
    }

    case "show": {
      const file = load(path);
      const locale = str(flags, "locale") ?? file.project.locale;
      const { screens } = file.project;
      const payload = {
        name: file.name,
        updatedAt: file.updatedAt,
        locale,
        canvasDevice: file.project.canvasDeviceId,
        exportDevices: file.project.exportDeviceIds,
        translatedLocales: exportLocales(screens).filter((l) => l !== "en-US"),
        screens: screens.map((screen, index) => ({
          index: index + 1,
          id: screen.id,
          name: screen.name,
          ...resolveText(screen, locale),
          bg: screen.bg,
          app: screen.app,
          frame: screen.deviceFrame,
        })),
      };
      emit(json, payload, () => {
        info(`${file.name}  ·  ${screens.length} screens  ·  ${localeName(locale)}`);
        info(`export devices: ${file.project.exportDeviceIds.join(", ")}`);
        const others = payload.translatedLocales;
        info(`translations: ${others.length ? others.join(", ") : "none"}`);
        info("");
        rows(["#", "NAME", "HEADLINE", "BG", "APP"],
          payload.screens.map((s) => [
            String(s.index), s.name, s.headline.replace(/\n/g, " / "), s.bg, s.app,
          ]));
      });
      return;
    }

    case "screens": {
      const file = load(path);
      const locale = str(flags, "locale") ?? file.project.locale;
      const data = file.project.screens.map((screen, index) => ({
        index: index + 1,
        id: screen.id,
        name: screen.name,
        ...resolveText(screen, locale),
      }));
      emit(json, data, () =>
        rows(["#", "ID", "NAME", "HEADLINE", "SUBHEAD"],
          data.map((s) => [
            String(s.index), s.id, s.name,
            s.headline.replace(/\n/g, " / "), s.subhead,
          ])));
      return;
    }

    case "add": {
      const file = load(path);
      const screens = [...file.project.screens];
      const source = screens[screens.length - 1];
      const created: Screen = {
        ...source,
        id: `screen-${Date.now().toString(36)}`,
        name: str(flags, "name") ?? `Screen ${screens.length + 1}`,
        headline: "New headline.",
        translations: {},
      };
      const after = num(flags, "after");
      const at = after === undefined ? screens.length : Math.min(after, screens.length);
      screens.splice(at, 0, created);
      file.project.screens = renumber(screens);
      save(path, file);
      emit(json, { added: created.id, screens: screens.length }, () =>
        info(`Added "${created.name}" — ${screens.length} screens`));
      return;
    }

    case "remove": {
      const file = load(path);
      const selector = str(flags, "screen");
      if (!selector) throw new CliError("remove needs --screen <n|id>");
      if (file.project.screens.length <= 1) {
        throw new CliError("A project needs at least one screen");
      }
      const [index] = selectScreens(file.project.screens, selector);
      const [removed] = file.project.screens.splice(index, 1);
      file.project.screens = renumber(file.project.screens);
      save(path, file);
      emit(json, { removed: removed.id, screens: file.project.screens.length }, () =>
        info(`Removed "${removed.name}" — ${file.project.screens.length} screens`));
      return;
    }

    case "set": {
      const file = load(path);
      const selector = str(flags, "screen") ?? "all";
      const locale = str(flags, "locale") ?? "en-US";
      const targets = selectScreens(file.project.screens, selector);
      for (const index of targets) {
        file.project.screens[index] = applySet(
          file.project.screens[index], flags, locale,
        );
      }
      save(path, file);
      emit(json, { updated: targets.length, locale }, () =>
        info(`Updated ${targets.length} screen(s) in ${localeName(locale)}`));
      return;
    }

    case "translate": {
      const file = load(path);
      const locale = str(flags, "locale");
      if (!locale) throw new CliError("translate needs --locale <id>");
      if (!LOCALES.some((l) => l.id === locale)) {
        throw new CliError(`Unknown locale "${locale}". Run \`framecraft locales\`.`);
      }

      const from = str(flags, "from");
      let updated = 0;

      if (from) {
        const parsed = JSON.parse(readFileSync(from, "utf8")) as
          | LocalizedText[]
          | Record<string, LocalizedText>;
        const entries: [string, LocalizedText][] = Array.isArray(parsed)
          ? parsed.map((entry, index) => [String(index + 1), entry])
          : Object.entries(parsed);

        for (const [key, entry] of entries) {
          const [index] = selectScreens(file.project.screens, key);
          let screen = file.project.screens[index];
          for (const field of ["headline", "subhead", "brandChip"] as const) {
            const value = entry[field];
            if (value !== undefined) {
              screen = { ...screen, ...textPatch(screen, locale, field, unescape(value)) };
            }
          }
          file.project.screens[index] = screen;
          updated += 1;
        }
      } else {
        const selector = str(flags, "screen");
        if (!selector) throw new CliError("translate needs --screen or --from");
        for (const index of selectScreens(file.project.screens, selector)) {
          file.project.screens[index] = applySet(
            file.project.screens[index], flags, locale,
          );
          updated += 1;
        }
      }

      save(path, file);
      emit(json, { locale, updated }, () =>
        info(`Translated ${updated} screen(s) into ${localeName(locale)}`));
      return;
    }

    case "translations": {
      const file = load(path);
      const only = str(flags, "locale");
      const locales = only ? [only] : exportLocales(file.project.screens);
      const data = locales.map((locale) => ({
        locale,
        name: localeName(locale),
        screens: file.project.screens.map((screen, index) => ({
          index: index + 1,
          name: screen.name,
          headline: hasTranslation(screen, locale, "headline"),
          subhead: hasTranslation(screen, locale, "subhead"),
          brandChip: hasTranslation(screen, locale, "brandChip"),
        })),
      }));
      emit(json, data, () => {
        for (const entry of data) {
          info(`${entry.name} (${entry.locale})`);
          rows(["#", "SCREEN", "HEADLINE", "SUBHEAD", "CHIP"],
            entry.screens.map((s) => [
              String(s.index), s.name,
              s.headline ? "yes" : "fallback",
              s.subhead ? "yes" : "fallback",
              s.brandChip ? "yes" : "fallback",
            ]));
          info("");
        }
      });
      return;
    }

    case "clear-translations": {
      const file = load(path);
      const locale = str(flags, "locale");
      if (!locale) throw new CliError("clear-translations needs --locale <id>");
      const targets = selectScreens(file.project.screens, str(flags, "screen") ?? "all");
      for (const index of targets) {
        const screen = file.project.screens[index];
        const translations = { ...screen.translations };
        delete translations[locale];
        file.project.screens[index] = {
          ...screen,
          translations,
          layers: screen.layers?.map((layer) => {
            if (!(locale in (layer.translations ?? {}))) return layer;
            const layerTranslations = { ...layer.translations };
            delete layerTranslations[locale];
            return { ...layer, translations: layerTranslations };
          }),
        };
      }
      save(path, file);
      emit(json, { locale, cleared: targets.length }, () =>
        info(`Cleared ${localeName(locale)} on ${targets.length} screen(s)`));
      return;
    }

    case "export": {
      const file = load(path);
      const outDir = str(flags, "out");
      if (!outDir) throw new CliError("export needs --out <dir>");

      const deviceIds = list(flags, "devices") ?? file.project.exportDeviceIds;
      for (const id of deviceIds) {
        if (!EXPORT_DEVICES.some((d) => d.id === id)) {
          throw new CliError(`Unknown device "${id}". Run \`framecraft devices\`.`);
        }
      }
      // Keeps each screen's own number, so a filtered export still names
      // files after their position in the full project.
      const picked = selectScreens(
        file.project.screens,
        str(flags, "screen") ?? "all",
      );
      const screens = picked.map((index) => file.project.screens[index]);
      const locales = list(flags, "locales") ?? exportLocales(file.project.screens);
      const format = oneOf("format", str(flags, "format") ?? "png", ["png", "jpeg"]) as
        | "png"
        | "jpeg";

      const written = await exportProject({
        project: { ...file.project, screens },
        outDir,
        deviceIds,
        locales,
        format,
        detailedNames: !bool(flags, "simple-names"),
        flat: bool(flags, "flat"),
        url: str(flags, "url"),
        browser: str(flags, "browser") ?? str(flags, "chrome"),
        onBrowser: json
          ? undefined
          : (chosen) => info(`Rendering with ${chosen.name}`),
        onBuild: json
          ? undefined
          : () => info("Building the app once (first export only)…"),
        onProgress: json
          ? undefined
          : (done, total, name) =>
              process.stdout.write(`\r  ${done}/${total}  ${name.padEnd(56)}`),
      });

      if (!json) process.stdout.write("\r".padEnd(80) + "\r");
      emit(json, { out: outDir, files: written }, () =>
        info(`Exported ${written.length} screenshots to ${outDir}`));
      return;
    }

    default:
      throw new CliError(`Unknown command "${command}". See \`framecraft --help\`.`);
  }
}

// `framecraft screens | head` closes the pipe early; that is the reader's
// choice, not an error worth a stack trace.
process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

run(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`framecraft: ${message}\n`);
  process.exit(1);
});
