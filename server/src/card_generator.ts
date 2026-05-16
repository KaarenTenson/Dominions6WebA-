import { DraftCard } from "../types"
import { parsePretendersCsv } from "./draftParser/pretenderparser";
import { parseUnitsCsv } from "./draftParser/unitparser";
import { Pretender } from "./draftypes/pretender";
import { Unit } from "./draftypes/unit";
const pretenderPool = parsePretendersCsv("pretenders_export.csv");
const unitAndCommanderPool = parseUnitsCsv("units_export.csv");
const commanderPool = unitAndCommanderPool.filter((unit) => unit.commander);
const unitPool = unitAndCommanderPool.filter((unit) => !unit.commander);

const generate_unit = (): DraftCard<Unit> => {
    const unit = unitPool[Math.floor(Math.random() * unitPool.length)]
    return { id: crypto.randomUUID(), type: "unit", data: unit };
};
const generate_pretender = (): DraftCard<Pretender> => {
    const pretender = pretenderPool[Math.floor(Math.random() * pretenderPool.length)]
    return { id: crypto.randomUUID(), type: "pretender", data: pretender };
}

const generate_commander = (): DraftCard<Unit> => {
    const commander = commanderPool[Math.floor(Math.random() * commanderPool.length)]
    return { id: crypto.randomUUID(), type: "commander", data: commander };
};

const generate_magic_site = (): DraftCard<any> => {
    return { id: crypto.randomUUID(), type: "magic_site", data: "as" };
};

// ---- Pack generators ----

const generatePack = (
    generator: () => DraftCard<any>,
    size: number = 8
): DraftCard<any>[] => {
    return Array.from({ length: size }, () => generator());
};

export const generate_unit_pack = (): DraftCard<any>[] => {
    return generatePack(generate_unit);
};

export const generate_commander_pack = (): DraftCard<any>[] => {
    return generatePack(generate_commander);
};
export const generate_pretender_pack = (): DraftCard<any>[] => {
    return generatePack(generate_pretender);
};
export const generate_magic_site_pack = (): DraftCard<any>[] => {
    return generatePack(generate_magic_site);
};