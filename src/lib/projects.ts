import { INITIAL_STATE } from "./editor-data";
import type { EditorState } from "./editor-types";

const STORE_KEY = "framecraft.projects.v1";
/** Single-project key used before projects existed. */
const LEGACY_KEY = "framecraft.editor.v1";

export type ProjectData = Partial<EditorState>;

export type ProjectRecord = {
  id: string;
  name: string;
  updatedAt: number;
  data: ProjectData;
};

export type ProjectMeta = Omit<ProjectRecord, "data">;

export type AppView = "start" | "editor";

export type ProjectStore = {
  activeId: string;
  /** Which surface the app opens on; persisted so a reload lands back. */
  view: AppView;
  projects: ProjectRecord[];
};

export function newId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function meta(project: ProjectRecord): ProjectMeta {
  return { id: project.id, name: project.name, updatedAt: project.updatedAt };
}

function blank(name: string, data?: ProjectData): ProjectRecord {
  return {
    id: newId(),
    name,
    updatedAt: Date.now(),
    data: data ?? { ...INITIAL_STATE },
  };
}

/**
 * Reads the project store, migrating a pre-projects save into the first
 * project so existing work is not silently dropped.
 */
export function readStore(): ProjectStore {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectStore;
      if (parsed?.projects?.length) {
        return { ...parsed, view: parsed.view ?? "editor" };
      }
    }

    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const project = blank("Habitly", JSON.parse(legacy) as ProjectData);
      return { activeId: project.id, view: "editor", projects: [project] };
    }
  } catch {
    // Corrupt or unavailable storage — start fresh.
  }

  // A first-time visitor lands on the start screen, with nothing to restore.
  return { activeId: "", view: "start", projects: [] };
}

/** Returns false when the write failed, so the UI can say so. */
export function writeStore(store: ProjectStore): boolean {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    window.localStorage.removeItem(LEGACY_KEY);
    return true;
  } catch {
    // Quota or private mode — editing continues, but nothing is persisted.
    return false;
  }
}

export function createProject(name: string, data?: ProjectData): ProjectRecord {
  return blank(name, data);
}

/**
 * Name for a project started from a template.
 *
 * Stamped so several runs at the same template stay tellable apart, and
 * marked a copy so the template's own name is not mistaken for it.
 */
export function templateCopyName(templateName: string, now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${templateName}-copy-${stamp}`;
}

export function duplicateOf(project: ProjectRecord): ProjectRecord {
  return {
    id: newId(),
    name: `${project.name} copy`,
    updatedAt: Date.now(),
    data: JSON.parse(JSON.stringify(project.data)) as ProjectData,
  };
}

/** "just now", "4 min ago", "3 Sep" — for the saved-state readout. */
export function savedLabel(updatedAt: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(updatedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
