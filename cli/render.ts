import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";

import type { Browser, PuppeteerNode } from "puppeteer-core";

import { exportDevice } from "../src/lib/editor-data";
import type { EditorState, Screen } from "../src/lib/editor-types";

import { CliError } from "./store";

/**
 * Loads puppeteer only when a render actually happens.
 *
 * puppeteer-core is ESM-only, and `require()` of it fails on Node below
 * 22.12 — so a static import would crash every command, including ones that
 * never render. The indirection keeps TypeScript from downlevelling this to
 * a `require` in the CommonJS build.
 */
const importModule = new Function(
  "specifier",
  "return import(specifier)",
) as (specifier: string) => Promise<unknown>;

async function loadPuppeteer(): Promise<PuppeteerNode> {
  const mod = (await importModule("puppeteer-core")) as
    | { default: PuppeteerNode }
    | PuppeteerNode;
  return "default" in mod ? mod.default : mod;
}

/** Bridge exposed by the /render page; declared here for the Node build. */
declare global {
  interface Window {
    __framecraftReady?: boolean;
    __framecraftRender?: (request: {
      screen: Screen;
      media: EditorState["media"];
      locale: string;
      deviceId: string;
    }) => Promise<boolean>;
  }
}

/**
 * Chromium-family browsers we can drive, in preference order.
 *
 * Anything Chromium-based works — Brave, Edge and Vivaldi included — because
 * the renderer speaks the same DevTools protocol.
 */
type Candidate = { name: string; path: string };

function candidates(): Candidate[] {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  const programFiles = process.env.PROGRAMFILES ?? "C:\\Program Files";
  const programFilesX86 =
    process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)";

  return [
    // macOS
    { name: "Google Chrome", path: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
    { name: "Chromium", path: "/Applications/Chromium.app/Contents/MacOS/Chromium" },
    { name: "Brave", path: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" },
    { name: "Brave Beta", path: "/Applications/Brave Browser Beta.app/Contents/MacOS/Brave Browser Beta" },
    { name: "Microsoft Edge", path: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" },
    { name: "Vivaldi", path: "/Applications/Vivaldi.app/Contents/MacOS/Vivaldi" },

    // Linux
    { name: "Google Chrome", path: "/usr/bin/google-chrome" },
    { name: "Google Chrome", path: "/usr/bin/google-chrome-stable" },
    { name: "Chromium", path: "/usr/bin/chromium" },
    { name: "Chromium", path: "/usr/bin/chromium-browser" },
    { name: "Brave", path: "/usr/bin/brave-browser" },
    { name: "Brave", path: "/usr/bin/brave-browser-stable" },
    { name: "Brave", path: "/usr/bin/brave" },
    { name: "Microsoft Edge", path: "/usr/bin/microsoft-edge" },
    { name: "Vivaldi", path: "/usr/bin/vivaldi" },

    // Windows
    { name: "Google Chrome", path: `${programFiles}\\Google\\Chrome\\Application\\chrome.exe` },
    { name: "Google Chrome", path: `${programFilesX86}\\Google\\Chrome\\Application\\chrome.exe` },
    { name: "Google Chrome", path: `${localAppData}\\Google\\Chrome\\Application\\chrome.exe` },
    { name: "Brave", path: `${programFiles}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe` },
    { name: "Brave", path: `${programFilesX86}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe` },
    { name: "Brave", path: `${localAppData}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe` },
    { name: "Microsoft Edge", path: `${programFilesX86}\\Microsoft\\Edge\\Application\\msedge.exe` },
  ].filter((entry) => !entry.path.includes("undefined"));
}

export type ResolvedBrowser = { name: string; path: string };

/** Lists the Chromium-family browsers present on this machine. */
export function installedBrowsers(): ResolvedBrowser[] {
  const seen = new Set<string>();
  return candidates().filter((entry) => {
    if (seen.has(entry.path) || !existsSync(entry.path)) return false;
    seen.add(entry.path);
    return true;
  });
}

export function findBrowser(explicit?: string): ResolvedBrowser {
  const chosen = explicit ?? process.env.BROWSER_PATH ?? process.env.CHROME_PATH;
  if (chosen) {
    if (!existsSync(chosen)) {
      throw new CliError(`No browser at ${chosen}`);
    }
    const known = candidates().find((entry) => entry.path === chosen);
    return { name: known?.name ?? "Custom browser", path: chosen };
  }

  const [found] = installedBrowsers();
  if (!found) {
    throw new CliError(
      "No Chromium-family browser found (Chrome, Chromium, Brave, Edge, Vivaldi).\n" +
        "Pass --browser <path> or set BROWSER_PATH.",
    );
  }
  return found;
}

function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const server = createServer();
    server.on("error", fail);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => done(port));
    });
  });
}

async function waitForServer(url: string, timeoutMs = 45_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new CliError(`Render server did not start at ${url}`);
}

type Server = { url: string; stop: () => void };

/**
 * Walks up from the compiled CLI to the app that owns it, rather than
 * assuming a fixed depth under dist/.
 */
function findAppRoot(): string {
  let current = __dirname;
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(join(current, "package.json")) && existsSync(join(current, "next.config.ts"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new CliError("Could not locate the Framecraft app directory");
}

/**
 * Uses an already-running app when `--url` is given, otherwise starts one.
 * A production build is required for the spawned case.
 */
/** Runs a command to completion, failing loudly with its own output. */
/**
 * Build directory for CLI renders.
 *
 * Kept separate from `.next` so an export cannot clobber the cache of a
 * `next dev` the user has running.
 */
const CLI_DIST_DIR = ".next-framecraft";
const renderEnv = { ...process.env, FRAMECRAFT_DIST_DIR: CLI_DIST_DIR };

function runToCompletion(
  command: string,
  args: string[],
  cwd: string,
  label: string,
): Promise<void> {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd, stdio: "ignore", env: renderEnv });
    child.on("error", (error) =>
      rejectRun(new CliError(`${label} could not start: ${error.message}`)));
    child.on("close", (code) =>
      code === 0
        ? resolveRun()
        : rejectRun(new CliError(`${label} failed (exit ${code}).`)));
  });
}

async function startServer(
  explicitUrl?: string,
  onBuild?: () => void,
): Promise<Server> {
  if (explicitUrl) {
    await waitForServer(`${explicitUrl}/render`);
    return { url: explicitUrl, stop: () => {} };
  }

  const root = findAppRoot();
  // Rendering needs a production build. Making one on demand means a fresh
  // clone can export immediately, with no separate build step to remember.
  if (!existsSync(join(root, CLI_DIST_DIR))) {
    onBuild?.();
    await runToCompletion("npx", ["next", "build"], root, "next build");
  }

  const port = await freePort();
  const child: ChildProcess = spawn(
    "npx",
    ["next", "start", "-p", String(port)],
    { cwd: root, stdio: "ignore", detached: false, env: renderEnv },
  );

  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(`${url}/render`);
  } catch (error) {
    child.kill();
    throw error;
  }
  return { url, stop: () => child.kill() };
}

export type ExportOptions = {
  project: EditorState;
  outDir: string;
  deviceIds: string[];
  locales: string[];
  format: "png" | "jpeg";
  detailedNames: boolean;
  flat: boolean;
  url?: string;
  browser?: string;
  onBrowser?: (browser: ResolvedBrowser) => void;
  onBuild?: () => void;
  onProgress?: (done: number, total: number, path: string) => void;
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fileName(
  screen: Screen,
  deviceName: string,
  format: string,
  detailed: boolean,
): string {
  const ext = format === "png" ? "png" : "jpg";
  return detailed
    ? `${screen.number}-${slug(screen.name)}-${slug(deviceName)}.${ext}`
    : `${screen.number}-${slug(deviceName)}.${ext}`;
}

/** Renders every screen x device x locale to disk. */
export async function exportProject(options: ExportOptions): Promise<string[]> {
  const browserChoice = findBrowser(options.browser);
  options.onBrowser?.(browserChoice);
  const server = await startServer(options.url, options.onBuild);
  const puppeteer = await loadPuppeteer();
  let browser: Browser | undefined;
  const written: string[] = [];

  try {
    browser = await puppeteer.launch({
      executablePath: browserChoice.path,
      headless: true,
      args: ["--no-sandbox", "--force-device-scale-factor=1", "--hide-scrollbars"],
    });
    const page = await browser.newPage();
    await page.goto(`${server.url}/render`, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => window.__framecraftReady === true);
    await page.evaluateHandle("document.fonts.ready");

    const { screens, media } = options.project;
    const total = screens.length * options.deviceIds.length * options.locales.length;

    for (const locale of options.locales) {
      for (const deviceId of options.deviceIds) {
        const device = exportDevice(deviceId);
        // The viewport must hold the artboard for the element screenshot.
        await page.setViewport({
          width: device.width,
          height: device.height,
          deviceScaleFactor: 1,
        });

        for (const screen of screens) {
          await page.evaluate(
            (request) => window.__framecraftRender!(request),
            { screen, media, locale, deviceId } as never,
          );

          const element = await page.$("#artboard");
          if (!element) throw new CliError("Render target did not mount");

          const relative = options.flat
            ? fileName(screen, device.name, options.format, options.detailedNames)
            : join(
                locale,
                fileName(screen, device.name, options.format, options.detailedNames),
              );
          const target = resolve(options.outDir, relative);
          mkdirSync(dirname(target), { recursive: true });

          const buffer = await element.screenshot({
            type: options.format,
            ...(options.format === "jpeg" ? { quality: 92 } : {}),
          });
          writeFileSync(target, buffer);

          written.push(relative);
          options.onProgress?.(written.length, total, relative);
        }
      }
    }
  } finally {
    await browser?.close();
    server.stop();
  }

  return written;
}
