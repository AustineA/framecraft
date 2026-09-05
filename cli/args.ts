/** Minimal flag parser: `--flag value`, `--flag=value`, and `--bool`. */
export type Flags = Record<string, string | boolean>;

export function parse(argv: string[]): { positional: string[]; flags: Flags } {
  const positional: string[] = [];
  const flags: Flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    const body = token.slice(2);
    const eq = body.indexOf("=");
    if (eq !== -1) {
      flags[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }

    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[body] = true;
    } else {
      flags[body] = next;
      index += 1;
    }
  }

  return { positional, flags };
}

/**
 * Rejects flags a command does not define. A silently ignored `--screens`
 * would report success while exporting everything, which is the worst
 * failure mode for a CLI meant to be driven unattended.
 */
export function assertKnownFlags(flags: Flags, known: readonly string[]): void {
  const unknown = Object.keys(flags).filter((name) => !known.includes(name));
  if (unknown.length === 0) return;

  const suggestions = unknown.map((name) => {
    const near =
      known.find(
        (candidate) => candidate.startsWith(name) || name.startsWith(candidate),
      ) ?? known.find((candidate) => candidate.includes(name));
    return near ? `--${name} (did you mean --${near}?)` : `--${name}`;
  });
  throw new Error(
    `Unknown flag${unknown.length > 1 ? "s" : ""}: ${suggestions.join(", ")}`,
  );
}

export function str(flags: Flags, name: string): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

export function num(flags: Flags, name: string): number | undefined {
  const value = str(flags, name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function bool(flags: Flags, name: string): boolean {
  return flags[name] === true || flags[name] === "true";
}

export function list(flags: Flags, name: string): string[] | undefined {
  const value = str(flags, name);
  if (!value) return undefined;
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
