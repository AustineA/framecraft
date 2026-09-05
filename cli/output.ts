/** Prints either a JSON payload or an aligned table, per `--json`. */
export function emit(json: boolean, data: unknown, table: () => void): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    return;
  }
  table();
}

export function rows(headers: string[], data: string[][]): void {
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...data.map((row) => (row[column] ?? "").length)),
  );
  const line = (cells: string[]) =>
    cells.map((cell, index) => (cell ?? "").padEnd(widths[index])).join("  ").trimEnd();

  process.stdout.write(`${line(headers)}\n`);
  process.stdout.write(`${widths.map((w) => "─".repeat(w)).join("  ")}\n`);
  for (const row of data) process.stdout.write(`${line(row)}\n`);
}

export function info(message: string): void {
  process.stdout.write(`${message}\n`);
}
