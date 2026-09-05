"use client";

import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useEditor, useProjects } from "@/lib/editor-store";
import { projectFileName, toProjectFile } from "@/lib/project-file";

import { CopyButton } from "./copy-button";
import { savedLabel } from "@/lib/projects";

export function ProjectMenu() {
  const {
    projects,
    activeId,
    savedAt,
    saved,
    newProject,
    switchProject,
    renameProject,
    duplicateProject,
    deleteProject,
  } = useProjects();

  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const active = projects.find((project) => project.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setRenaming(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setRenaming(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /** Writes the same format the CLI reads, so work can move either way. */
  const downloadFile = () => {
    const name = active?.name ?? "Untitled";
    const file = toProjectFile(name, {
      tool: editor.tool,
      selectedScreenId: editor.selectedScreenId,
      canvasDeviceId: editor.canvasDeviceId,
      screens: editor.screens,
      media: editor.media,
      locale: editor.locale,
      zoom: editor.zoom,
      canvasMode: editor.canvasMode,
      inspectorTab: editor.inspectorTab,
      mediaTab: editor.mediaTab,
      activeTextStyleId: editor.activeTextStyleId,
      previewOpen: false,
      exportOpen: false,
      exportDeviceIds: editor.exportDeviceIds,
      exportFormat: editor.exportFormat,
      exportNaming: editor.exportNaming,
    });

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = projectFileName(name);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const commitRename = () => {
    if (draft.trim()) renameProject(activeId, draft);
    setRenaming(false);
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-[2px]">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-[5px] px-1 py-[2px] text-[12px] font-semibold text-[var(--ink)] transition-colors hover:bg-black/5"
      >
        {active?.name ?? "Untitled"}
        <ChevronDown className="size-[12px] text-[var(--muted)]" />
      </button>

      <CopyButton
        value={active?.name ?? "Untitled"}
        label="Copy project name"
        className="size-[22px]"
      />

      {open ? (
        <div
          role="menu"
          className="absolute top-[26px] left-0 z-50 w-[248px] overflow-hidden rounded-[10px] border border-[#00000014] bg-white shadow-[0_12px_32px_#00000026]"
        >
          <div className="flex items-center justify-between px-3 pt-[10px] pb-1">
            <span className="text-[9px] font-bold tracking-[0.6px] text-[var(--muted)]">
              PROJECTS
            </span>
            <span
              className={`text-[9px] ${saved ? "text-[var(--muted)]" : "font-semibold text-[#D0342C]"}`}
            >
              {saved ? `Saved ${savedLabel(savedAt)}` : "Not saved — storage full"}
            </span>
          </div>

          <ul className="max-h-[220px] overflow-y-auto py-1">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    switchProject(project.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-[7px] text-left transition-colors hover:bg-[#F5F5F7]"
                >
                  <Check
                    className={`size-[13px] shrink-0 ${
                      project.id === activeId
                        ? "text-[var(--purple)]"
                        : "text-transparent"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[var(--ink)]">
                    {project.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {renaming ? (
            <div className="border-t border-t-[#00000012] p-2">
              <input
                autoFocus
                value={draft}
                aria-label="Project name"
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commitRename}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitRename();
                  if (event.key === "Escape") setRenaming(false);
                }}
                className="h-[30px] w-full rounded-[6px] border border-[var(--line)] px-2 text-[12px] text-[var(--ink)] outline-none focus:border-[var(--purple)]"
              />
            </div>
          ) : (
            <div className="border-t border-t-[#00000012] py-1">
              {[
                {
                  label: "New project",
                  icon: Plus,
                  onClick: () => {
                    newProject();
                    setOpen(false);
                  },
                },
                {
                  label: "Rename",
                  icon: Pencil,
                  onClick: () => {
                    setDraft(active?.name ?? "");
                    setRenaming(true);
                  },
                },
                {
                  label: "Duplicate",
                  icon: Copy,
                  onClick: () => {
                    duplicateProject(activeId);
                    setOpen(false);
                  },
                },
                {
                  label: "Download file",
                  icon: Download,
                  onClick: () => {
                    downloadFile();
                    setOpen(false);
                  },
                },
              ].map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={onClick}
                  className="flex w-full items-center gap-2 px-3 py-[7px] text-left text-[12px] text-[var(--ink)] transition-colors hover:bg-[#F5F5F7]"
                >
                  <Icon className="size-[13px] text-[var(--muted)]" />
                  {label}
                </button>
              ))}

              <button
                type="button"
                role="menuitem"
                disabled={projects.length <= 1}
                onClick={() => {
                  deleteProject(activeId);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-[7px] text-left text-[12px] text-[#D0342C] transition-colors hover:bg-[#FFECEC] disabled:cursor-not-allowed disabled:text-[#C7C7CE] disabled:hover:bg-transparent"
              >
                <Trash2 className="size-[13px]" />
                Delete project
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
