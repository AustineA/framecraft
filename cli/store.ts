import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { INITIAL_STATE, SCREENS } from "../src/lib/editor-data";
import type { EditorState, Screen } from "../src/lib/editor-types";
import {
  parseProjectFile,
  type ProjectFile,
} from "../src/lib/project-file";
import { template } from "../src/lib/templates";

export type { ProjectFile };

export class CliError extends Error {}

/** The project a command acts on when no path is given. */
export const PROJECT_FILE = "framecraft.json";

/**
 * Locates the project to act on.
 *
 * With no path, looks for `framecraft.json` in the working directory and
 * then each parent — so commands work from anywhere inside a project, the
 * way `package.json` is found.
 */
export function findProject(explicit?: string): string {
  if (explicit) return explicit;

  let dir = process.cwd();
  for (;;) {
    const candidate = join(dir, PROJECT_FILE);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new CliError(
    `No ${PROJECT_FILE} here or in any parent directory.\n` +
      "  Run `framecraft init` to start one, or pass a path.",
  );
}

/** Where `init` writes. Never walks up: a new project belongs where you are. */
export function newProjectPath(explicit: string | undefined, force: boolean): string {
  const path = explicit ?? join(process.cwd(), PROJECT_FILE);
  if (existsSync(path) && !force) {
    throw new CliError(
      `${explicit ?? PROJECT_FILE} already exists. Use --force to replace it.`,
    );
  }
  return path;
}

export function load(path: string): ProjectFile {
  let raw: string;
  try {
    raw = readFileSync(resolve(path), "utf8");
  } catch {
    throw new CliError(`Cannot read project file: ${path}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new CliError(`${path} is not valid JSON`);
  }

  try {
    return parseProjectFile(json);
  } catch (error) {
    throw new CliError(
      error instanceof Error ? `${path}: ${error.message}` : `${path} is not a project`,
    );
  }
}

export function save(path: string, file: ProjectFile): void {
  const next = { ...file, updatedAt: new Date().toISOString() };
  writeFileSync(resolve(path), `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export function create(name: string, templateId?: string): ProjectFile {
  const base = templateId ? template(templateId) : undefined;
  if (templateId && !base) {
    throw new CliError(`Unknown template: ${templateId}`);
  }

  const project = {
    ...INITIAL_STATE,
    ...(base?.data ?? { screens: SCREENS }),
  } as EditorState;

  return {
    framecraft: 1,
    name: name || base?.name || "Untitled",
    updatedAt: new Date().toISOString(),
    project: {
      ...project,
      screens: project.screens.map((screen) => ({ ...screen })),
      selectedScreenId: project.screens[0].id,
    },
  };
}

/**
 * Resolves a screen selector: a 1-based index, a screen id, or `all`.
 * Returns the indices the command should act on.
 */
export function selectScreens(screens: Screen[], selector: string): number[] {
  if (selector === "all") return screens.map((_, index) => index);

  const asNumber = Number(selector);
  if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= screens.length) {
    return [asNumber - 1];
  }

  const byId = screens.findIndex((screen) => screen.id === selector);
  if (byId !== -1) return [byId];

  throw new CliError(
    `No screen matches "${selector}". Use 1-${screens.length}, a screen id, or "all".`,
  );
}

export function renumber(screens: Screen[]): Screen[] {
  return screens.map((screen, index) => ({
    ...screen,
    number: String(index + 1).padStart(2, "0"),
  }));
}
