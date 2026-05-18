import { DraftCard } from "./types.js";
import { parsePretendersCsv } from "./draftParser/pretenderparser.js";
import { parseUnitsCsv } from "./draftParser/unitparser.js";
import { Pretender } from "./draftypes/pretender.js";
import { Unit } from "./draftypes/unit.js";
import { MagicSite, SiteGemEffect, SiteLevel } from "./draftypes/magicSite.js";

const pretenderPool = parsePretendersCsv("pretenders_export.csv");
const unitAndCommanderPool = parseUnitsCsv("units_export.csv");

const commanderPool = unitAndCommanderPool.filter((unit) => unit.commander);
const unitPool = unitAndCommanderPool.filter((unit) => !unit.commander);

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

const rand = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

const chance = (percent: number): boolean =>
    Math.random() * 100 < percent;

const pickRound = (values: number[]): number =>
    rand(values);

const gemTypes: SiteGemEffect["type"][] = [
    "fire",
    "air",
    "water",
    "earth",
    "astral",
    "death",
    "nature",
    "glamour",
    "blood",
];

// ----------------------------------------------------
// Name generation
// ----------------------------------------------------

const adjectives = [
    "Ancient",
    "Forgotten",
    "Burning",
    "Silver",
    "Twilight",
    "Golden",
    "Hidden",
    "Cursed",
    "Crystal",
    "Black",
    "Sacred",
    "Emerald",
    "Frozen",
    "Shattered",
    "Storm",
];

const nouns = [
    "Sanctum",
    "Vault",
    "Forest",
    "Temple",
    "Keep",
    "Spire",
    "Cavern",
    "Well",
    "Grove",
    "Citadel",
    "Ruins",
    "Library",
    "Gate",
    "Throne",
    "Pit",
];

const suffixes = [
    "of Flames",
    "of Stars",
    "of the Moon",
    "of Night",
    "of Kings",
    "of Sorcery",
    "of Bones",
    "of Dawn",
    "of Madness",
    "of Plenty",
    "of Silence",
];

const generateSiteName = (): string => {
    return `${rand(adjectives)} ${rand(nouns)} ${rand(suffixes)}`;
};

// ----------------------------------------------------
// Unit selection
// ----------------------------------------------------

const generateRecruitUnit = (): Unit => {
    return rand(unitAndCommanderPool);
};

// ----------------------------------------------------
// Gem generation
// ----------------------------------------------------

const generateGemEffects = (
    level: SiteLevel,
    hasUnit: boolean
): SiteGemEffect[] | undefined => {
    // no gems sometimes
    if (chance(35)) return undefined;

    const effects: SiteGemEffect[] = [];

    const maxTotalGems = hasUnit ? 3 : 5;

    // very rare 5 gem site
    let total =
        level === 4 && !hasUnit && chance(3)
            ? 5
            : level === 4
            ? pickRound([2, 3, 3, 4])
            : level === 3
            ? pickRound([1, 2, 2, 3])
            : level === 2
            ? pickRound([1, 1, 2])
            : 1;

    total = Math.min(total, maxTotalGems);

    // split into 1-2 gem types
    const splitCount =
        total >= 3 && chance(40)
            ? 2
            : 1;

    if (splitCount === 1) {
        effects.push({
            gemAmount: total,
            type: rand(gemTypes),
        });

        return effects;
    }

    const first = Math.max(1, Math.floor(total / 2));
    const second = total - first;

    const type1 = rand(gemTypes);

    let type2 = rand(gemTypes);
    while (type2 === type1) {
        type2 = rand(gemTypes);
    }

    effects.push({
        gemAmount: first,
        type: type1,
    });

    effects.push({
        gemAmount: second,
        type: type2,
    });

    return effects;
};

// ----------------------------------------------------
// Site generation
// ----------------------------------------------------

const generateMagicSiteData = (): MagicSite => {
    // weighted levels
    const level: SiteLevel = rand([
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        3,
        3,
        4,
    ]);

    const site: MagicSite = {
        level,
        name: generateSiteName(),
    };

    // recruitable unit chance
    const hasRecruitUnit =
        level >= 3
            ? chance(45)
            : chance(20);

    if (hasRecruitUnit) {
        site.summonUnit = generateRecruitUnit();
    }

    // gold
    if (chance(55)) {
        site.gold = pickRound(
            level === 4
                ? [100, 150, 200, 250, 300]
                : level === 3
                ? [50, 75, 100, 125, 150]
                : level === 2
                ? [25, 50, 75, 100]
                : [25, 50]
        );
    }

    // resources
    if (chance(40)) {
        site.resource = pickRound(
            level === 4
                ? [100, 150, 200]
                : level === 3
                ? [50, 75, 100, 125]
                : [25, 50, 75]
        );
    }

    // supply
    if (chance(35)) {
        site.supply = pickRound(
            level === 4
                ? [40, 60, 80, 100]
                : level === 3
                ? [20, 40, 60]
                : [10, 20, 30]
        );
    }

    // unrest reduction
    if (chance(35)) {
        site.decUnrest = pickRound(
            level === 4
                ? [10, 15, 20, 25, 30]
                : level === 3
                ? [5, 10, 15, 20]
                : [5, 10]
        );
    }

    // gems
    site.gemEffects = generateGemEffects(
        level,
        hasRecruitUnit
    );

    return site;
};

// ----------------------------------------------------
// Card generators
// ----------------------------------------------------

const generate_unit = (): DraftCard<Unit> => {
    const unit =
        unitPool[Math.floor(Math.random() * unitPool.length)];

    return {
        id: crypto.randomUUID(),
        type: "unit",
        data: unit,
    };
};

const generate_pretender = (): DraftCard<Pretender> => {
    const pretender =
        pretenderPool[
            Math.floor(Math.random() * pretenderPool.length)
        ];

    return {
        id: crypto.randomUUID(),
        type: "pretender",
        data: pretender,
    };
};

const generate_commander = (): DraftCard<Unit> => {
    const commander =
        commanderPool[
            Math.floor(Math.random() * commanderPool.length)
        ];

    return {
        id: crypto.randomUUID(),
        type: "commander",
        data: commander,
    };
};

const generate_magic_site = (): DraftCard<MagicSite> => {
    return {
        id: crypto.randomUUID(),
        type: "magic_site",
        data: generateMagicSiteData(),
    };
};

// ----------------------------------------------------
// Pack generators
// ----------------------------------------------------

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