import { parseProjectFile, type ProjectFile } from "./project-file";

/**
 * Links a project to a real file on disk, so the editor and the CLI work on
 * the same JSON instead of trading copies.
 *
 * The browser cannot open a path by name, so the user picks the file once
 * and the handle is kept in IndexedDB — localStorage cannot hold one. From
 * then on saves write through to that file, and changes an agent makes to it
 * are picked up here.
 */

type Permission = "granted" | "denied" | "prompt";

export type LinkHandle = FileSystemFileHandle & {
  queryPermission?: (opts: { mode: "readwrite" }) => Promise<Permission>;
  requestPermission?: (opts: { mode: "readwrite" }) => Promise<Permission>;
};

type PickerOptions = {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
};

type PickerWindow = Window & {
  showSaveFilePicker?: (opts?: PickerOptions) => Promise<LinkHandle>;
  showOpenFilePicker?: (
    opts?: PickerOptions & { multiple?: boolean },
  ) => Promise<LinkHandle[]>;
};

const DB = "framecraft.files";
const STORE = "handles";

/** The name the CLI looks for when no path is given. */
export const LINK_FILE_NAME = "framecraft.json";

const JSON_TYPE: PickerOptions["types"] = [
  { description: "Framecraft project", accept: { "application/json": [".json"] } },
];

export function fileLinkSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as PickerWindow).showSaveFilePicker === "function"
  );
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | undefined> {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      }),
  );
}

export const loadHandle = (projectId: string) =>
  tx<LinkHandle>("readonly", (store) => store.get(projectId) as IDBRequest<LinkHandle>);

export const saveHandle = (projectId: string, handle: LinkHandle) =>
  tx("readwrite", (store) => store.put(handle, projectId));

export const forgetHandle = (projectId: string) =>
  tx("readwrite", (store) => store.delete(projectId));

/** Confirms write access, prompting only when the browser asks us to. */
export async function ensureWritable(handle: LinkHandle): Promise<boolean> {
  const state = (await handle.queryPermission?.({ mode: "readwrite" })) ?? "granted";
  if (state === "granted") return true;
  if (state === "denied") return false;
  return (await handle.requestPermission?.({ mode: "readwrite" })) === "granted";
}

/** Picks a file to link, defaulting to the name the CLI discovers. */
export async function chooseFile(): Promise<LinkHandle | null> {
  const picker = window as PickerWindow;
  if (!picker.showSaveFilePicker) return null;
  try {
    return await picker.showSaveFilePicker({
      suggestedName: LINK_FILE_NAME,
      types: JSON_TYPE,
    });
  } catch {
    return null; // The picker was dismissed.
  }
}

/** Opens a project file the CLI already created. */
export async function openExisting(): Promise<LinkHandle | null> {
  const picker = window as PickerWindow;
  if (!picker.showOpenFilePicker) return null;
  try {
    const [handle] = await picker.showOpenFilePicker({ types: JSON_TYPE });
    return handle ?? null;
  } catch {
    return null;
  }
}

export type FileStamp = { text: string; modifiedAt: number };

export async function readFile(handle: LinkHandle): Promise<FileStamp | null> {
  try {
    const file = await handle.getFile();
    return { text: await file.text(), modifiedAt: file.lastModified };
  } catch {
    return null;
  }
}

/** Writes the project and returns the file's new timestamp. */
export async function writeFile(
  handle: LinkHandle,
  file: ProjectFile,
): Promise<number | null> {
  try {
    const writable = await handle.createWritable();
    await writable.write(`${JSON.stringify(file, null, 2)}\n`);
    await writable.close();
    return (await handle.getFile()).lastModified;
  } catch {
    return null;
  }
}

export function parse(text: string): ProjectFile | null {
  try {
    return parseProjectFile(JSON.parse(text));
  } catch {
    return null;
  }
}
