import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

/**
 * The agent skills that ship with Framecraft (`.agents/skills/<name>` in the repo).
 *
 * `framecraft install` copies each one to `~/.agents/skills/<name>` and links it
 * into every coding agent it finds, the same layout the AustineA skill installers
 * use, so one canonical copy serves Claude Code, Codex, Cursor and the rest.
 * `SKILL_INSTALL_HOME` redirects all of it, for testing.
 */
const HOME = process.env.SKILL_INSTALL_HOME ? resolve(process.env.SKILL_INSTALL_HOME) : homedir();
const CANONICAL_ROOT = join(HOME, ".agents", "skills");

const AGENTS = [
  { name: "Claude Code", dir: join(HOME, ".claude", "skills") },
  { name: "Codex", dir: join(HOME, ".codex", "skills") },
  { name: "Cursor", dir: join(HOME, ".cursor", "skills") },
  { name: "Windsurf", dir: join(HOME, ".windsurf", "skills") },
  { name: "Antigravity", dir: join(HOME, ".antigravity", "skills") },
  { name: "Trae", dir: join(HOME, ".trae", "skills") },
  { name: "Amp", dir: join(HOME, ".amp", "skills") },
];

export type SkillReport = { skill: string; linked: string[]; skipped: string[] };

const isLinkTo = (path: string, target: string): boolean => {
  try {
    return lstatSync(path).isSymbolicLink() && resolve(dirname(path), readlinkSync(path)) === target;
  } catch {
    return false;
  }
};

const exists = (path: string): boolean => {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
};

/** Names of the skills bundled in the package at `root`. */
export function bundledSkills(root: string): string[] {
  const dir = join(root, ".agents", "skills");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => existsSync(join(dir, name, "SKILL.md")));
}

/** Copies each bundled skill to ~/.agents/skills and links it into the agents present. */
export function installSkills(root: string): SkillReport[] {
  return bundledSkills(root).map((skill) => {
    const destination = join(CANONICAL_ROOT, skill);
    mkdirSync(CANONICAL_ROOT, { recursive: true });
    rmSync(destination, { recursive: true, force: true });
    cpSync(join(root, ".agents", "skills", skill), destination, { recursive: true });

    const report: SkillReport = { skill, linked: [], skipped: [] };
    for (const agent of AGENTS) {
      // Only agents that are installed: their home folder (~/.claude etc.) exists.
      if (!existsSync(dirname(agent.dir))) continue;
      mkdirSync(agent.dir, { recursive: true });
      const link = join(agent.dir, skill);
      if (isLinkTo(link, destination)) {
        report.linked.push(agent.name);
      } else if (exists(link)) {
        // A real folder (or someone else's link): the user's own copy, never replaced.
        report.skipped.push(`${agent.name} (${link} already exists)`);
      } else {
        symlinkSync(destination, link);
        report.linked.push(agent.name);
      }
    }
    return report;
  });
}

/** Removes the links this installer made and the canonical copies. */
export function uninstallSkills(root: string): string[] {
  const removed: string[] = [];
  for (const skill of bundledSkills(root)) {
    const destination = join(CANONICAL_ROOT, skill);
    for (const agent of AGENTS) {
      const link = join(agent.dir, skill);
      if (isLinkTo(link, destination)) rmSync(link, { force: true });
    }
    if (existsSync(destination)) {
      rmSync(destination, { recursive: true, force: true });
      removed.push(skill);
    }
  }
  return removed;
}

/** Which bundled skills are installed, and for which agents. */
export function skillStatus(root: string): SkillReport[] {
  return bundledSkills(root).map((skill) => {
    const destination = join(CANONICAL_ROOT, skill);
    const linked = AGENTS.filter((agent) => isLinkTo(join(agent.dir, skill), destination)).map((a) => a.name);
    const skipped = AGENTS.filter((agent) => exists(join(agent.dir, skill)) && !isLinkTo(join(agent.dir, skill), destination))
      .map((a) => a.name);
    return { skill, linked, skipped };
  });
}
