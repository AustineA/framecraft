"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  DEVICE_FRAMES,
  INITIAL_STATE,
  TEXT_STYLES,
  ZOOM_STEPS,
} from "./editor-data";
import {
  createProject,
  duplicateOf,
  meta,
  readStore,
  writeStore,
  type ProjectMeta,
  type ProjectRecord,
  type AppView,
  type ProjectData,
  type ProjectStore,
} from "./projects";
import type {
  Align,
  MediaAsset,
  CanvasMode,
  EditorState,
  ExportFormat,
  InspectorTab,
  MediaTab,
  Screen,
  ToolId,
} from "./editor-types";

type Snapshot = { screens: Screen[]; selectedScreenId: string };

type State = EditorState & {
  past: Snapshot[];
  future: Snapshot[];
  hydrated: boolean;
  /** Project metadata lives in the reducer so effects never setState. */
  projects: ProjectMeta[];
  activeProjectId: string;
  view: AppView;
  savedAt: number;
  /** False once a write to local storage has failed (usually quota). */
  saved: boolean;
};

export type Action =
  | {
      type: "projectLoaded";
      projects: ProjectMeta[];
      activeId: string;
      view: AppView;
      data: Partial<EditorState>;
    }
  | {
      type: "projectsChanged";
      projects: ProjectMeta[];
      savedAt: number;
      saved: boolean;
    }
  | { type: "setView"; view: AppView }
  | { type: "setTool"; tool: ToolId }
  | { type: "setCanvasDevice"; id: string }
  | { type: "setLocale"; locale: string }
  | { type: "selectScreen"; id: string }
  | { type: "addScreen" }
  | { type: "deleteScreen"; id: string }
  | { type: "moveScreen"; id: string; toIndex: number }
  | { type: "updateScreen"; id: string; patch: Partial<Screen> }
  | { type: "addMedia"; assets: MediaAsset[] }
  | { type: "removeMedia"; id: string }
  | { type: "applyTextStyle"; styleId: string }
  | { type: "applyBrand"; family: string; chip: string }
  | { type: "setZoom"; zoom: number }
  | { type: "stepZoom"; direction: 1 | -1 }
  | { type: "setCanvasMode"; mode: CanvasMode }
  | { type: "setInspectorTab"; tab: InspectorTab }
  | { type: "setMediaTab"; tab: MediaTab }
  | { type: "setPreviewOpen"; open: boolean }
  | { type: "setExportOpen"; open: boolean }
  | { type: "toggleExportDevice"; id: string }
  | { type: "setExportFormat"; format: ExportFormat }
  | { type: "toggleExportNaming" }
  | { type: "undo" }
  | { type: "redo" };

const initialState: State = {
  ...INITIAL_STATE,
  past: [],
  future: [],
  hydrated: false,
  projects: [],
  activeProjectId: "",
  view: "start",
  savedAt: 0,
  saved: true,
};

/**
 * Saved state can predate fields added later, which would put `undefined`
 * into a transform. Missing keys fall back to the default screen shape, and
 * a frame that no longer exists resets to a known one.
 */
function normalize(payload: Partial<EditorState>): Partial<EditorState> {
  if (!payload.screens) return payload;
  const template = INITIAL_STATE.screens[0];
  // `app` is derived, not user-editable, so keep known screens in step with
  // the built-in definitions rather than freezing an older placeholder.
  const builtIn = new Map(
    INITIAL_STATE.screens.map((screen) => [screen.id, screen.app]),
  );
  return {
    ...payload,
    locale: payload.locale ?? "en-US",
    screens: payload.screens.map((screen) => {
      const merged = { ...template, ...screen };
      return {
        ...merged,
        brandChip: merged.brandChip ?? "HABITLY",
        app: builtIn.get(merged.id) ?? merged.app,
        mediaId: merged.mediaId ?? null,
        translations: merged.translations ?? {},
        textX: merged.textX ?? 0,
        textY: merged.textY ?? 0,
        brandChipVisible: merged.brandChipVisible ?? true,
        deviceChrome: merged.deviceChrome ?? true,
        decorations: merged.decorations ?? [],
        accentShape: merged.accentShape ?? null,
        deviceFrame: DEVICE_FRAMES.includes(merged.deviceFrame)
          ? merged.deviceFrame
          : template.deviceFrame,
      };
    }),
  };
}

function snapshot(state: State): Snapshot {
  return { screens: state.screens, selectedScreenId: state.selectedScreenId };
}

/** Wrap a screens-mutating result so undo/redo can step over it. */
function withHistory(state: State, next: Partial<State>): State {
  return {
    ...state,
    ...next,
    past: [...state.past, snapshot(state)].slice(-50),
    future: [],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "projectLoaded":
      return {
        ...state,
        ...normalize(action.data),
        projects: action.projects,
        activeProjectId: action.activeId,
        view: action.view,
        savedAt: Date.now(),
        saved: true,
        past: [],
        future: [],
        hydrated: true,
      };

    case "setView":
      return { ...state, view: action.view };

    case "projectsChanged":
      return {
        ...state,
        projects: action.projects,
        savedAt: action.savedAt,
        saved: action.saved,
      };

    case "setTool":
      return { ...state, tool: action.tool };

    case "setCanvasDevice":
      return { ...state, canvasDeviceId: action.id };

    case "setLocale":
      return { ...state, locale: action.locale };

    case "selectScreen":
      return { ...state, selectedScreenId: action.id };

    case "addScreen": {
      const index = state.screens.length + 1;
      const source = state.screens[state.screens.length - 1];
      const created: Screen = {
        ...source,
        id: `screen-${Date.now()}`,
        number: String(index).padStart(2, "0"),
        name: `Screen ${index}`,
        miniTitle: "NEW SCREEN",
        headline: "New headline.",
      };
      return withHistory(state, {
        screens: [...state.screens, created],
        selectedScreenId: created.id,
      });
    }

    case "deleteScreen": {
      // The set must keep at least one screen to edit.
      if (state.screens.length <= 1) return state;
      const index = state.screens.findIndex((s) => s.id === action.id);
      if (index === -1) return state;
      const remaining = state.screens
        .filter((s) => s.id !== action.id)
        .map((s, i) => ({ ...s, number: String(i + 1).padStart(2, "0") }));
      const nextSelected =
        state.selectedScreenId === action.id
          ? remaining[Math.min(index, remaining.length - 1)].id
          : state.selectedScreenId;
      return withHistory(state, {
        screens: remaining,
        selectedScreenId: nextSelected,
      });
    }

    case "moveScreen": {
      const from = state.screens.findIndex((s) => s.id === action.id);
      const to = Math.max(0, Math.min(state.screens.length - 1, action.toIndex));
      if (from === -1 || from === to) return state;

      const screens = [...state.screens];
      const [moved] = screens.splice(from, 1);
      screens.splice(to, 0, moved);

      // Position is what `number` means, so it is reassigned, not carried.
      return withHistory(state, {
        screens: screens.map((screen, index) => ({
          ...screen,
          number: String(index + 1).padStart(2, "0"),
        })),
      });
    }

    case "updateScreen":
      return withHistory(state, {
        screens: state.screens.map((screen) =>
          screen.id === action.id ? { ...screen, ...action.patch } : screen,
        ),
      });

    case "addMedia":
      return withHistory(state, { media: [...action.assets, ...state.media] });

    case "removeMedia":
      return withHistory(state, {
        media: state.media.filter((asset) => asset.id !== action.id),
        // Any screen using it falls back to the mock app UI.
        screens: state.screens.map((screen) =>
          screen.mediaId === action.id ? { ...screen, mediaId: null } : screen,
        ),
      });

    case "applyTextStyle": {
      const style = TEXT_STYLES.find((item) => item.id === action.styleId);
      if (!style) return state;
      return withHistory(state, {
        activeTextStyleId: style.id,
        screens: state.screens.map((screen) =>
          screen.id === state.selectedScreenId
            ? { ...screen, fontSize: style.size }
            : screen,
        ),
      });
    }

    case "applyBrand":
      return withHistory(state, {
        screens: state.screens.map((screen) => ({
          ...screen,
          fontFamily: action.family,
          brandChip: action.chip,
        })),
      });

    case "setZoom":
      return { ...state, zoom: action.zoom };

    case "stepZoom": {
      const current = ZOOM_STEPS.indexOf(state.zoom);
      const base =
        current === -1
          ? ZOOM_STEPS.reduce((closest, step) =>
              Math.abs(step - state.zoom) < Math.abs(closest - state.zoom)
                ? step
                : closest,
            )
          : state.zoom;
      const index = ZOOM_STEPS.indexOf(base) + action.direction;
      const clamped = Math.max(0, Math.min(ZOOM_STEPS.length - 1, index));
      return { ...state, zoom: ZOOM_STEPS[clamped] };
    }

    case "setCanvasMode":
      return { ...state, canvasMode: action.mode };

    case "setInspectorTab":
      return { ...state, inspectorTab: action.tab };

    case "setMediaTab":
      return { ...state, mediaTab: action.tab };

    case "setPreviewOpen":
      return { ...state, previewOpen: action.open };

    case "setExportOpen":
      return { ...state, exportOpen: action.open };

    case "toggleExportDevice":
      return {
        ...state,
        exportDeviceIds: state.exportDeviceIds.includes(action.id)
          ? state.exportDeviceIds.filter((id) => id !== action.id)
          : [...state.exportDeviceIds, action.id],
      };

    case "setExportFormat":
      return { ...state, exportFormat: action.format };

    case "toggleExportNaming":
      return { ...state, exportNaming: !state.exportNaming };

    case "undo": {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        ...state,
        ...previous,
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future].slice(0, 50),
      };
    }

    case "redo": {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return {
        ...state,
        ...next,
        past: [...state.past, snapshot(state)],
        future: rest,
      };
    }

    default:
      return state;
  }
}

const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

/** Only durable editor data is persisted — modals and history are not. */
function persistable(state: State) {
  return {
    tool: state.tool,
    selectedScreenId: state.selectedScreenId,
    canvasDeviceId: state.canvasDeviceId,
    screens: state.screens,
    media: state.media,
    locale: state.locale,
    zoom: state.zoom,
    canvasMode: state.canvasMode,
    inspectorTab: state.inspectorTab,
    mediaTab: state.mediaTab,
    activeTextStyleId: state.activeTextStyleId,
    exportDeviceIds: state.exportDeviceIds,
    exportFormat: state.exportFormat,
    exportNaming: state.exportNaming,
  };
}

const ProjectsContext = createContext<{
  newProject: (name?: string, data?: ProjectData, fromTemplate?: boolean) => void;
  goToStart: () => void;
  switchProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
} | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const store = useRef<ProjectStore | null>(null);
  /**
   * A project opened from a template but not yet edited.
   *
   * Nothing is written for it, so browsing templates does not fill the start
   * screen with untouched copies. The first real change clears this and the
   * project saves from then on.
   */
  const pristine = useRef<string | null>(null);

  // Load after mount so server and client first render agree.
  useEffect(() => {
    const loaded = readStore();
    store.current = loaded;
    const active = loaded.projects.find((p) => p.id === loaded.activeId);
    dispatch({
      type: "projectLoaded",
      projects: loaded.projects.map(meta),
      activeId: loaded.activeId,
      view: loaded.view,
      data: active?.data ?? {},
    });
  }, []);

  // Autosave the active project. Keyed on the persisted payload alone, so
  // recording the save does not retrigger this effect.
  const payload = state.hydrated ? JSON.stringify(persistable(state)) : null;
  // `projectLoaded` clears the history, so anything in it is a change the
  // user made to this project since it opened.
  const edited = state.past.length > 0;
  useEffect(() => {
    const current = store.current;
    if (!payload || !current) return;

    // An untouched template copy is held in memory only, so browsing
    // templates does not fill the start screen with copies nobody changed.
    if (pristine.current === current.activeId) {
      if (!edited) return;
      pristine.current = null;
    }

    const savedAt = Date.now();
    const next: ProjectStore = {
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.activeId
          ? { ...project, data: JSON.parse(payload), updatedAt: savedAt }
          : project,
      ),
    };
    store.current = next;
    const saved = writeStore(next);
    dispatch({
      type: "projectsChanged",
      projects: next.projects.map(meta),
      savedAt,
      saved,
    });
  }, [payload, edited]);

  const projectsApi = useMemo(() => {
    const apply = (next: ProjectStore, load?: ProjectRecord) => {
      store.current = next;
      const saved = writeStore(next);
      if (load) {
        dispatch({
          type: "projectLoaded",
          projects: next.projects.map(meta),
          activeId: next.activeId,
          view: next.view,
          data: load.data,
        });
      } else {
        dispatch({
          type: "projectsChanged",
          projects: next.projects.map(meta),
          savedAt: Date.now(),
          saved,
        });
      }
    };

    return {
      newProject: (name?: string, data?: ProjectData, fromTemplate = false) => {
        const current = store.current;
        if (!current) return;
        const project = createProject(
          name ?? `Project ${current.projects.length + 1}`,
          data,
        );

        const next: ProjectStore = {
          activeId: project.id,
          view: "editor",
          projects: [...current.projects, project],
        };

        if (fromTemplate) {
          // Held back from storage until the first edit.
          pristine.current = project.id;
          store.current = next;
          dispatch({
            type: "projectLoaded",
            projects: next.projects.map(meta),
            activeId: next.activeId,
            view: next.view,
            data: project.data,
          });
          return;
        }

        apply(next, project);
      },
      switchProject: (id: string) => {
        const current = store.current;
        const project = current?.projects.find((p) => p.id === id);
        if (!current || !project) return;
        apply({ ...current, activeId: id, view: "editor" }, project);
      },
      /** Flushes the open project, then returns to the start screen. */
      goToStart: () => {
        const current = store.current;
        if (!current) return;

        // An untouched template copy was never saved; drop it on the way out.
        const dropped = pristine.current;
        pristine.current = null;
        apply({
          ...current,
          view: "start",
          projects: dropped
            ? current.projects.filter((project) => project.id !== dropped)
            : current.projects,
        });
        dispatch({ type: "setView", view: "start" });
      },
      renameProject: (id: string, name: string) => {
        const current = store.current;
        if (!current || !name.trim()) return;
        apply({
          ...current,
          projects: current.projects.map((project) =>
            project.id === id ? { ...project, name: name.trim() } : project,
          ),
        });
      },
      duplicateProject: (id: string) => {
        const current = store.current;
        const source = current?.projects.find((p) => p.id === id);
        if (!current || !source) return;
        const copy = duplicateOf(source);
        apply(
          {
            activeId: copy.id,
            view: "editor",
            projects: [...current.projects, copy],
          },
          copy,
        );
      },
      deleteProject: (id: string) => {
        const current = store.current;
        if (!current) return;
        // Removing the last project drops back to the start screen.
        if (current.projects.length <= 1) {
          apply({ activeId: "", view: "start", projects: [] });
          dispatch({ type: "setView", view: "start" });
          return;
        }
        const remaining = current.projects.filter((p) => p.id !== id);
        if (id !== current.activeId) {
          apply({ ...current, projects: remaining });
          return;
        }
        apply(
          { activeId: remaining[0].id, view: current.view, projects: remaining },
          remaining[0],
        );
      },
    };
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <ProjectsContext.Provider value={projectsApi}>
          {children}
        </ProjectsContext.Provider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  const state = useContext(StateContext);
  if (!context || !state)
    throw new Error("useProjects must be used inside EditorProvider");
  return {
    ...context,
    projects: state.projects,
    activeId: state.activeProjectId,
    view: state.view,
    savedAt: state.savedAt,
    saved: state.saved,
  };
}

export function useEditor(): State {
  const context = useContext(StateContext);
  if (!context) throw new Error("useEditor must be used inside EditorProvider");
  return context;
}

export function useEditorDispatch(): Dispatch<Action> {
  const context = useContext(DispatchContext);
  if (!context)
    throw new Error("useEditorDispatch must be used inside EditorProvider");
  return context;
}

export function useSelectedScreen(): Screen {
  const { screens, selectedScreenId } = useEditor();
  return useMemo(
    () => screens.find((screen) => screen.id === selectedScreenId) ?? screens[0],
    [screens, selectedScreenId],
  );
}

export type { Align };
