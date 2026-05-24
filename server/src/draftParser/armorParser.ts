// parser/parseArmorsCsv.ts

import fs from "node:fs";
import { Armor, ArmorProtectionData } from "../draftypes/armor.js";
const IdToArmor = new Map<number, Armor>();
const protectionData = new Map<number, ArmorProtectionData[]>();

const filePath = "armors.csv";
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
export function getArmor(id:string):Armor {
    if (IdToArmor.size == 0) {
        const armors = parseArmorsCsv(filePath);
        armors.forEach((a) => (IdToArmor.set(a.id, a)));
    }
    return IdToArmor.get(toNumber(id));
}
function parseProtectionData() {
   const content = fs.readFileSync("protections_by_armor.csv", "utf-8");
   const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return {zone_number: toNumber(values[0]),	protection:toNumber(values[1]), armor_number:toNumber(values[2])}
  })
}
function getArmorProtectionData(armorId: number) {
  if (protectionData.size == 0) {
    parseProtectionData().forEach((el) => {
      if (!protectionData.has(el.armor_number)) {
        protectionData.set(el.armor_number, []);
      }
      protectionData.get(el.armor_number).push(el);
    })
  }
  //console.log(protectionData);
  if (protectionData.get(armorId) == undefined) {
    return [];
  }
  return protectionData.get(armorId);
}
function parseArmorsCsv(filePath: string): Armor[] {
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
    const protectionData  = getArmorProtectionData(Number(row.id));
    const armor: Armor = {
      id: Number(row.id),
      name: row.name,
      type: Number(row.type),
      def: Number(row.def),
      enc: Number(row.enc),
      rcost: Number(row.rcost),
      protection: protectionData,
    };

    return armor;
  });
}