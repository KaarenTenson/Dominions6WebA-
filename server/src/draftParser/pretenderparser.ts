import fs from "node:fs";
import { Pretender, RandomMagicPath } from "../draftypes/pretender.js";
import { Unit } from "../draftypes/unit.js";
import { calculateResearch } from "../utils/draf-card-utils.js";

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === null || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseKeywords(value: string | undefined): string[] {
  if (!value || value.trim() === "") {
    return [];
  }

  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
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

function createRandomMagicPaths(row: Record<string, string>): RandomMagicPath[] {
  const paths: RandomMagicPath[] = [];

  for (let i = 1; i <= 4; i++) {
    const rand = toNumber(row[`rand${i}`]);
    const nbr = toNumber(row[`nbr${i}`]);
    const link = toNumber(row[`link${i}`]);
    const mask = toNumber(row[`mask${i}`]);

    if (
      rand !== undefined ||
      nbr !== undefined ||
      link !== undefined ||
      mask !== undefined
    ) {
      paths.push({
        rand: rand ?? 0,
        nbr: nbr ?? 0,
        link: link ?? 0,
        mask: mask ?? 0,
      });
    }
  }

  return paths;
}

export function parsePretendersCsv(filePath: string): Pretender[] {
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

    const pretender: Pretender = {
      id: Number(row.id),
      name: row.name,
      pretender: true,
      hp: Number(row.hp),
      prot: Number(row.prot),
      mr: Number(row.mr),
      mor: Number(row.mor),
      str: Number(row.str),
      att: Number(row.att),
      def: Number(row.def),
      prec: Number(row.prec),
      enc: Number(row.enc),

      mapmove: Number(row.mapmove),
      ap: Number(row.ap),
      size: Number(row.size),
      ressize: Number(row.ressize),

      basecost: Number(row.basecost),
      rcost: Number(row.rcost),
      reclimit: toNumber(row.reclimit),
      rt: Number(row.rt),

      leader: toNumber(row.leader),
      undeadleader: toNumber(row.undeadleader),
      magicleader: toNumber(row.magicleader),

      startage: toNumber(row.startage),
      maxage: toNumber(row.maxage),

      magicPaths: {
        fire: toNumber(row.F),
        air: toNumber(row.A),
        water: toNumber(row.W),
        earth: toNumber(row.E),
        astral: toNumber(row.S),
        death: toNumber(row.D),
        nature: toNumber(row.N),
        glamour: toNumber(row.G),
        blood: toNumber(row.B),
        holy: toNumber(row.H),
      },

      randomMagicPaths: createRandomMagicPaths(row),

      weapons: [
        row.wpn1,
        row.wpn2,
        row.wpn3,
        row.wpn4,
        row.wpn5,
        row.wpn6,
        row.wpn7,
      ]
        .map(toNumber)
        .filter((value): value is number => value !== undefined),

      armors: [row.armor1, row.armor2, row.armor3, row.armor4]
        .map(toNumber)
        .filter((value): value is number => value !== undefined),

      resources: toNumber(row.resources),
      reinvigoration: toNumber(row.reinvigoration),
      awe: toNumber(row.awe),
      fear: toNumber(row.fear),
      berserk: toNumber(row.berserk),
      darkvision: toNumber(row.darkvision),

      heat: toNumber(row.heat),
      cold: toNumber(row.cold),

      poisonres: toNumber(row.poisonres),
      fireres: toNumber(row.fireres),
      coldres: toNumber(row.coldres),
      shockres: toNumber(row.shockres),

      slashres: toNumber(row.slashres),
      bluntres: toNumber(row.bluntres),
      pierceres: toNumber(row.pierceres),
      acidres: toNumber(row.acidres),

      regeneration: toNumber(row.regeneration),
      iceprot: toNumber(row.iceprot),
      invulnerable: toNumber(row.invulnerable),
      fireshield: toNumber(row.fireshield),
      banefireshield: toNumber(row.banefireshield),

      standard: toNumber(row.standard),
      inspirational: toNumber(row.inspirational),
      taskmaster: toNumber(row.taskmaster),
      beastmaster: toNumber(row.beastmaster),
      bodyguard: toNumber(row.bodyguard),

      supplybonus: toNumber(row.supplybonus),
      patrolbonus: toNumber(row.patrolbonus),
      pillagebonus: toNumber(row.pillagebonus),
      siegebonus: toNumber(row.siegebonus),
      researchbonus: toNumber(row.researchbonus),
      castledef: toNumber(row.castledef),

      stealthy: toNumber(row.stealthy),
      taxcollector: toNumber(row.taxcollector),
      alch: toNumber(row.alch),
      forgebonus: toNumber(row.forgebonus),

      nametype: toNumber(row.nametype),

      keywords: parseKeywords(row.keywords),
    };
    pretender.research = calculateResearch(pretender as unknown as Unit);
    return pretender;
  });
}
