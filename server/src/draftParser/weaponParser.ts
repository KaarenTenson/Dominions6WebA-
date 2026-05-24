// parser/parseWeaponsCsv.ts

import fs from "node:fs";
import { Weapon } from "../draftypes/weapon.js";

const IdToWeapon = new Map<number, Weapon>();

const filePath = "weapons.csv";

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

    if ((char === "," || char === "\t") && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result;
}

export function getWeapon(id: string): Weapon {
  if (IdToWeapon.size === 0) {
    const weapons = parseWeaponsCsv(filePath);

    weapons.forEach((w) => IdToWeapon.set(w.id, w));
  }

  return IdToWeapon.get(Number(id));
}

function parseWeaponsCsv(filePath: string): Weapon[] {
  const content = fs.readFileSync(filePath, "utf-8");

  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    const weapon: Weapon = {
      id: Number(row.id),
      name: row.name,
      effect_record_id: Number(row.effect_record_id),
      att: Number(row.att),
      def: Number(row.def),
      len: Number(row.len),
      nratt: Number(row.nratt),
      ammo: Number(row.ammo),
      secondaryeffect: Number(row.secondaryeffect),
      secondaryeffectalways: Number(row.secondaryeffectalways),
      rcost: Number(row.rcost),
      weapon: Number(row.weapon),
    };

    return weapon;
  });
}