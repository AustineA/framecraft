"use client";

import {
  ArrowRight,
  Clock,
  FolderOpen,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import { artboardHeightFor, exportDevice } from "@/lib/editor-data";
import { useProjects } from "@/lib/editor-store";
import { parseProjectFile } from "@/lib/project-file";
import { savedLabel, templateCopyName } from "@/lib/projects";
import { TEMPLATES, type Template } from "@/lib/templates";

import { ArtboardCard } from "./artboard";
import { CopyButton } from "./copy-button";

/**
 * Cards render a real artboard, scaled to the card and cropped to its top —
 * a full 852px artboard would make each card taller than the viewport.
 */
const ARTBOARD_WIDTH = 392;
const PREVIEW_WIDTH = 244;
const PREVIEW_HEIGHT = 296;
const PREVIEW_SCALE = PREVIEW_WIDTH / ARTBOARD_WIDTH;

function TemplatePreview({ template }: { template: Template }) {
  const screen = template.data.screens?.[0];
  const device = exportDevice(
    template.data.canvasDeviceId ?? "iphone-69",
  );
  const height = artboardHeightFor(device);
  if (!screen) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[10px] bg-[#E6E6E9]"
      style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
    >
      <div
        className="origin-top-left"
        style={{ transform: `scale(${PREVIEW_SCALE})` }}
      >
        <ArtboardCard screen={screen} height={height} />
      </div>
      {/* Softens the crop so the cut edge reads as deliberate. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[54px] bg-linear-to-b from-transparent to-black/12" />
    </div>
  );
}

export function StartScreen() {
  const { projects, newProject, switchProject, deleteProject } = useProjects();
  const [pending, setPending] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  /** Opens a project file written by the CLI — or downloaded from here. */
  const openFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const parsed = parseProjectFile(JSON.parse(await file.text()));
      newProject(parsed.name, parsed.project);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "That file could not be read.",
      );
    }
  };

  const start = (template: Template) => {
    // Rendering six artboards makes the click feel heavy without a cue.
    setPending(template.id);
    requestAnimationFrame(() =>
      newProject(templateCopyName(template.name), template.data, true),
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--soft)]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-16 px-10 py-16">
        <header className="flex flex-col gap-5">
          <span className="flex items-center gap-[10px]">
            <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-linear-to-b from-[#39A8FF] to-[var(--purple)]">
              <Sparkles className="size-[17px] text-white" />
            </span>
            <span className="text-[17px] font-[650] tracking-[-0.2px] text-[var(--ink)]">
              Framecraft
            </span>
          </span>

          <div className="flex flex-col gap-3">
            <h1 className="max-w-[620px] text-[44px] leading-[1.05] font-bold tracking-[-1.6px] text-[var(--ink)]">
              App Store screenshots,
              <br />
              designed in minutes.
            </h1>
            <p className="max-w-[520px] text-[15px] leading-[1.6] text-[var(--muted)]">
              Start from a category template, drop in your own screens, and
              export every size App Store Connect asks for.
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-bold tracking-[-0.4px] text-[var(--ink)]">
                Start from a template
              </h2>
              <p className="text-[13px] text-[var(--muted)]">
                Six sets, written for the categories that sell the most.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex h-[38px] items-center gap-2 rounded-[9px] border border-[#0000001A] bg-white px-4 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-[#F5F5F7]"
              >
                <FolderOpen className="size-[15px]" />
                Open file
              </button>
              <button
                type="button"
                onClick={() => newProject()}
                className="flex h-[38px] items-center gap-2 rounded-[9px] border border-[#0000001A] bg-white px-4 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-[#F5F5F7]"
              >
                <Plus className="size-[15px]" />
                Blank project
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(event) => {
                  void openFile(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          {importError ? (
            <p role="alert" className="text-[12px] text-[#D0342C]">
              {importError}
            </p>
          ) : null}

          <ul className="grid justify-center gap-7 [grid-template-columns:repeat(auto-fill,268px)]">
            {TEMPLATES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={pending !== null}
                  onClick={() => start(item)}
                  className="group flex w-full flex-col gap-3 text-left disabled:cursor-wait"
                >
                  <span className="relative block overflow-hidden rounded-[14px] border border-[#00000012] bg-white p-3 shadow-[0_1px_2px_#00000010] transition-all group-hover:-translate-y-[3px] group-hover:shadow-[0_16px_32px_#00000018]">
                    <TemplatePreview template={item} />
                    <span
                      className="pointer-events-none absolute inset-x-3 bottom-3 flex h-[34px] translate-y-[6px] items-center justify-center gap-[6px] rounded-[9px] text-[12px] font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                      style={{ backgroundColor: item.accent }}
                    >
                      {pending === item.id ? "Opening…" : "Use this template"}
                      <ArrowRight className="size-[13px]" />
                    </span>
                  </span>

                  <span className="flex flex-col gap-[5px] px-[2px]">
                    <span className="flex items-center gap-[7px]">
                      <span
                        className="size-[7px] shrink-0 rounded-full"
                        style={{ backgroundColor: item.accent }}
                      />
                      <span className="text-[10px] font-bold tracking-[0.5px] text-[var(--muted)] uppercase">
                        {item.category}
                      </span>
                    </span>
                    <span className="text-[15px] font-semibold text-[var(--ink)]">
                      {item.name}
                    </span>
                    <span className="text-[12px] leading-[1.5] text-[var(--muted)]">
                      {item.tagline}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-6 pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-bold tracking-[-0.4px] text-[var(--ink)]">
              Your projects
            </h2>
            <p className="text-[13px] text-[var(--muted)]">
              {projects.length
                ? "Pick up where you left off."
                : "Nothing saved yet — start from a template above."}
            </p>
          </div>

          {projects.length ? (
            <ul className="flex flex-col gap-[10px]">
              {projects.map((project) => (
                <li key={project.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => switchProject(project.id)}
                    className="flex w-full items-center gap-4 rounded-[12px] border border-[#00000012] bg-white px-4 py-[14px] text-left transition-colors hover:border-[#00000022] hover:bg-[#FCFCFD]"
                  >
                    <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--soft)] text-[13px] font-bold text-[var(--muted)]">
                      {project.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                      <span className="truncate text-[14px] font-semibold text-[var(--ink)]">
                        {project.name}
                      </span>
                      <span className="flex items-center gap-[5px] text-[11px] text-[var(--muted)]">
                        <Clock className="size-[11px]" />
                        Edited {savedLabel(project.updatedAt)}
                      </span>
                    </span>
                    <ArrowRight className="size-[15px] shrink-0 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>

                  <CopyButton
                    value={project.name}
                    label={`Copy name of ${project.name}`}
                    className="absolute top-1/2 right-[82px] -translate-y-1/2 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                  />

                  <button
                    type="button"
                    aria-label={`Delete ${project.name}`}
                    onClick={() => deleteProject(project.id)}
                    className="absolute top-1/2 right-[52px] flex size-[26px] -translate-y-1/2 items-center justify-center rounded-[7px] text-[var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[#FFECEC] hover:text-[#D0342C] focus-visible:opacity-100"
                  >
                    <Trash2 className="size-[13px]" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}
