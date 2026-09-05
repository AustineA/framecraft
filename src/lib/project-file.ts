import type { EditorState } from "./editor-types";

/**
 * The on-disk project format, shared by the CLI and the web editor.
 *
 * Both sides read and write this exact shape, so a file the CLI creates opens
 * in the browser and a file the browser downloads can be driven by the CLI.
 */
export type ProjectFile = {
  framecraft: 1;
  name: string;
  updatedAt: string;
  project: EditorState;
};

export function toProjectFile(
  name: string,
  project: EditorState,
): ProjectFile {
  return {
    framecraft: 1,
    name,
    updatedAt: new Date().toISOString(),
    project,
  };
}

export class ProjectFileError extends Error {}

/**
 * Validates untrusted JSON. Missing newer fields are tolerated — the editor
 * normalises them on load — but the file must carry recognisable screens.
 */
export function parseProjectFile(raw: unknown): ProjectFile {
  if (typeof raw !== "object" || raw === null) {
    throw new ProjectFileError("That file is not a Framecraft project.");
  }

  const file = raw as Partial<ProjectFile>;
  const screens = file.project?.screens;
  if (!Array.isArray(screens) || screens.length === 0) {
    throw new ProjectFileError(
      "That file has no screens — it may not be a Framecraft project.",
    );
  }

  return {
    framecraft: 1,
    name: typeof file.name === "string" && file.name.trim() ? file.name : "Imported project",
    updatedAt:
      typeof file.updatedAt === "string" ? file.updatedAt : new Date().toISOString(),
    project: file.project as EditorState,
  };
}

/** Filename a downloaded project should use. */
export function projectFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "project"}.framecraft.json`;
}
