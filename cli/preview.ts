import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

import { resolveLayerText, resolveText } from "../src/lib/localize";
import type { Screen } from "../src/lib/editor-types";

import { CliError, type ProjectFile } from "./store";

const IMAGE = /\.(png|jpe?g)$/i;
const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".html": "text/html; charset=utf-8",
};

export type PreviewSet = { locale: string; files: string[] };

/**
 * An export directory is either per-locale folders (the default `export`
 * layout) or, with `--flat`, images directly inside it. Both preview the same
 * way: one row per locale, the files in export order.
 */
export function scanExport(dir: string): PreviewSet[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new CliError(`No export directory at ${dir}. Run \`framecraft export --out ${dir}\` first.`);
  }
  const entries = readdirSync(dir);
  const images = (folder: string) =>
    readdirSync(folder).filter((name) => IMAGE.test(name)).sort();

  const sets = entries
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .map((name) => ({ locale: name, files: images(join(dir, name)) }))
    .filter((set) => set.files.length > 0)
    .sort((a, b) => (a.locale === "en-US" ? -1 : b.locale === "en-US" ? 1 : a.locale.localeCompare(b.locale)));
  if (sets.length > 0) return sets;

  const flat = images(dir);
  if (flat.length > 0) return [{ locale: "", files: flat }];
  throw new CliError(`No PNG or JPEG files under ${dir}.`);
}

/** Headline (or, for layer-only screens, the text layers) per locale, for hover titles. */
function captions(file: ProjectFile | undefined, sets: PreviewSet[]): Record<string, string[]> {
  if (!file) return {};
  const screens: Screen[] = file.project.screens;
  const caption = (screen: Screen, locale: string): string => {
    const headline = resolveText(screen, locale || "en-US").headline.trim();
    if (headline) return headline.replace(/\n/g, " / ");
    return (screen.layers ?? [])
      .filter((layer) => layer.kind === "text")
      .map((layer) => resolveLayerText(layer, locale || "en-US").trim())
      .filter(Boolean)
      .join(" / ");
  };
  return Object.fromEntries(
    sets.map((set) => [set.locale, screens.map((screen) => caption(screen, set.locale))]),
  );
}

export function previewPage(sets: PreviewSet[], titles: Record<string, string[]>, name: string): string {
  const data = JSON.stringify({
    sets: sets.map((set) => ({ locale: set.locale, files: set.files.map((f) => (set.locale ? `${set.locale}/${f}` : f)) })),
    titles,
  });
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(name)} · framecraft preview</title>
<style>
  body{margin:0;font:14px -apple-system,system-ui,sans-serif;background:#d0d0d0;color:#111}
  header{position:sticky;top:0;z-index:1;background:#fff;padding:10px 16px;display:flex;gap:12px;align-items:center;box-shadow:0 1px 4px #0002}
  select{font-size:15px}.hint{color:#666;margin-left:auto}
  .row{display:flex;gap:8px;padding:12px;overflow-x:auto}
  .row img{height:calc(100vh - 80px);border-radius:12px;box-shadow:0 4px 12px #0003;background:#fff}
</style>
<header><b>${escapeHtml(name)}</b><select id="locale"></select><span id="count"></span><span class="hint">← → switch locale</span></header>
<div class="row" id="row"></div>
<script>
  const D=${data};const sel=document.getElementById('locale'),row=document.getElementById('row'),count=document.getElementById('count');
  sel.innerHTML=D.sets.map(s=>'<option value="'+s.locale+'">'+(s.locale||'export')+'</option>').join('');
  sel.hidden=D.sets.length<2;
  function show(){const s=D.sets.find(s=>s.locale===sel.value)||D.sets[0];location.hash=s.locale;
    row.innerHTML=s.files.map((f,i)=>'<img src="'+encodeURI(f)+'" title="'+((D.titles[s.locale]||[])[i]||f).replace(/"/g,'&quot;')+'" alt="">').join('');
    count.textContent=s.files.length+' screens';}
  const initial=decodeURIComponent(location.hash.slice(1));
  sel.value=D.sets.some(s=>s.locale===initial)?initial:D.sets[0].locale;sel.onchange=show;show();
  addEventListener('keydown',e=>{const i=D.sets.findIndex(s=>s.locale===sel.value);if(i<0)return;
    if(e.key==='ArrowRight'){sel.value=D.sets[(i+1)%D.sets.length].locale;show();}
    if(e.key==='ArrowLeft'){sel.value=D.sets[(i-1+D.sets.length)%D.sets.length].locale;show();}});
</script>`;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
}

function openInBrowser(url: string): void {
  const [command, args] =
    process.platform === "darwin" ? ["open", [url]]
    : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]]
    : ["xdg-open", [url]];
  spawn(command, args, { stdio: "ignore", detached: true }).on("error", () => undefined).unref();
}

export type PreviewOptions = {
  dir: string;
  port: number;
  open: boolean;
  project?: ProjectFile;
  name: string;
  onListen?: (url: string, sets: PreviewSet[]) => void;
};

/** Serves the export directory plus a generated index page; resolves when the server closes. */
export function preview(options: PreviewOptions): Promise<void> {
  const root = resolve(options.dir);
  const sets = scanExport(root);
  const page = previewPage(sets, captions(options.project, sets), options.name);

  const handle = (request: IncomingMessage, response: ServerResponse) => {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname);
    if (pathname === "/" || pathname === "/index.html") {
      response.writeHead(200, { "content-type": TYPES[".html"], "cache-control": "no-store" });
      response.end(page);
      return;
    }
    const file = normalize(join(root, pathname));
    const type = TYPES[extname(file).toLowerCase()];
    if (!file.startsWith(root + sep) || !type || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    response.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    response.end(readFileSync(file));
  };

  return new Promise((done, fail) => {
    const server = createServer(handle);
    server.on("error", (error: NodeJS.ErrnoException) => {
      fail(
        error.code === "EADDRINUSE"
          ? new CliError(`Port ${options.port} is in use. Pass --port <n>.`)
          : error,
      );
    });
    server.listen(options.port, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : options.port;
      const url = `http://localhost:${port}/`;
      options.onListen?.(url, sets);
      if (options.open) openInBrowser(url);
    });
    const stop = () => server.close(() => done());
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });
}
