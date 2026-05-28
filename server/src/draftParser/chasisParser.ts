import fs from "node:fs";
function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === null || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];

  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result;
}

export function parseChassisValues(filePath: string): Map<number, number> {
  const content = fs.readFileSync(filePath, "utf-8");

  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  const headers = parseCsvLine(lines[0]);
  const result = new Map<number, number>();

  lines.slice(1).forEach((line) => {
    const values = parseCsvLine(line);

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    result.set(toNumber(row.id), toNumber(row.chassis_value));
  })
  return result;
}