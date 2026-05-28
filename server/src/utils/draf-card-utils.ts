// utils/unitCalculations.ts

import { Armor, ArmorProtectionData } from "../draftypes/armor.js";
import { Unit } from "../draftypes/unit.js";

/**
 * Gold/research autocalc ported from dom6inspector MUnit.js (larzm42).
 *
 * Key differences from the old approximation:
 *  - Leadership cost uses a lookup table, not a /40 division
 *  - Path cost uses tiered lookup tables (path1 / path2) where the
 *    highest path is priced at path1 and every additional path at path2
 *  - Priest (holy) cost uses its own lookup table
 *  - Spy/assassin/seduce costs are included
 *  - Commander gold is multiplied by 1.4 and rounded to nearest 5
 *  - Sacred (holy) units get a ×1.3 multiplier
 *  - Research formula: (5 + 2 × total_levels) + researchbonus + fixedresearch
 */

/* =========================================================
 * Lookup tables (from MUnit.autocalc)
 * ========================================================= */

const LEADERSHIP_COST: Record<number, number> = {
  0: 10,
  10: 15,
  20: 20,
  30: 20,
  40: 30,
  50: 30,
  60: 30,
  75: 30,
  80: 60,
  100: 60,
  120: 80,
  150: 100,
  160: 100,
  200: 150,
};

// Cost of the highest magic path level
const PATH1_COST: Record<number, number> = {
  1: 30,
  2: 90,
  3: 150,
  4: 210,
  5: 270,
};

// Cost of each additional magic path level
const PATH2_COST: Record<number, number> = {
  1: 20,
  2: 60,
  3: 100,
  4: 140,
  5: 180,
};

// Holy / priest cost
const PRIEST_COST: Record<number, number> = {
  1: 20,
  2: 40,
  3: 100,
  4: 140,
};

/* =========================================================
 * Helpers
 * ========================================================= */

/** Round down to nearest 5 */
function round5(n: number): number {
  return 5 * Math.floor(n / 5);
}

/** Round down to nearest 5 only if > 30, otherwise floor */
function roundIfNeeded(n: number): number {
  return n > 30 ? round5(n) : Math.floor(n);
}

/** Look up leadership cost; clamp to the nearest known key */
function leadershipCost(leader: number): number {
  const keys = Object.keys(LEADERSHIP_COST).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) {
    if (leader >= k) best = k;
  }
  return LEADERSHIP_COST[best] ?? 10;
}

/** Compute path cost for a sorted-descending array of path levels */
function pathArrayCost(sorted: number[]): number {
  let cost = 0;
  for (let i = 0; i < sorted.length; i++) {
    const level = sorted[i];
    if (level <= 0) continue;
    cost += i === 0
      ? (PATH1_COST[level] ?? 0)
      : (PATH2_COST[level] ?? 0);
  }
  return cost;
}

/* =========================================================
 * GOLD
 * ========================================================= */

export function calculateGold(unit: Unit): number {
  if (unit.gold !== undefined) {
    return unit.gold;
  }

  if (parseInt(unit.basecost as any) <= 9000) {
    return roundIfNeeded(unit.basecost);
  }

  // ── Autocalc ────────────────────────────────────────────

  // 1. Leadership cost (commanders only)
  let ldrCost = 0;
  if (unit.leader) {
    ldrCost += leadershipCost(unit.leader);
  }
  if (unit.inspirational) {
    ldrCost += 10 * unit.inspirational;
  }
  /*if (unit.sailingshipsize && unit.sailingshipsize > 0) {
    ldrCost += 0.5 * ldrCost;
  }*/

  // 2. Path cost
  const paths = unit.magicPaths;
  const baseLevels = [
    paths.fire ?? 0,
    paths.air ?? 0,
    paths.water ?? 0,
    paths.earth ?? 0,
    paths.astral ?? 0,
    paths.death ?? 0,
    paths.nature ?? 0,
    paths.glamour ?? 0,
    paths.blood ?? 0,
  ];

  const hasRandom = unit.randomMagicPaths.some(r => r.rand === 100 && r.mask > 0);
  let pathsCost = 0;

  if (hasRandom) {
    const combinations: number[][] = [];

    function buildCombos(idx: number, current: number[]): void {
      // Skip non-100% chance randoms (matches inspector's buildRandomArrays logic)
      while (idx < unit.randomMagicPaths.length && unit.randomMagicPaths[idx].rand !== 100) {
        idx++;
      }
      if (idx >= unit.randomMagicPaths.length) {
        return;
      }
      const rand = unit.randomMagicPaths[idx];
      const maskBits = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
      for (let p = 0; p < maskBits.length; p++) {
        if (rand.mask & maskBits[p]) {
          const next = [...current];
          next[p] = (next[p] ?? 0) + rand.nbr;
          if (idx + 1 < unit.randomMagicPaths.length) {
            const before = combinations.length;
            buildCombos(idx + 1, next);
            // If nothing was added by recursion, push this combo
            if (combinations.length === before) {
              combinations.push(next);
            }
          } else {
            combinations.push(next);
          }
        }
      }
    }

    buildCombos(0, [...baseLevels]);

    let largest = 0;
    let smallest = 0;
    for (const combo of combinations) {
      const sorted = [...combo].sort((a, b) => b - a);
      let tempCost = 0;
      for (let i = 0; i < sorted.length; i++) {
        const v = sorted[i];
        if (!v) continue;
        tempCost += i === 0 ? (PATH1_COST[v] ?? 0) : (PATH2_COST[v] ?? 0);
      }
      if (largest === 0) {
        largest = tempCost;
        smallest = tempCost;
      } else {
        if (tempCost > largest) largest = tempCost;
        else if (tempCost < smallest) smallest = tempCost;
      }
    }
    pathsCost = largest * 0.75 + smallest * 0.25;

  } else {
    const sorted = baseLevels.filter(v => v > 0).sort((a, b) => b - a);
    for (let i = 0; i < sorted.length; i++) {
      pathsCost += i === 0 ? (PATH1_COST[sorted[i]] ?? 0) : (PATH2_COST[sorted[i]] ?? 0);
    }
  }

  // Research bonus adjusts path cost
  const resBonus = unit.researchbonus ?? 0;
  if (pathsCost > 0 && resBonus > 0) {
    pathsCost += resBonus * 5;
  }
  if (resBonus < 0) {
    pathsCost -= 5;
  }

  // forgebonus adjusts path cost
  if (unit.forgebonus) {
    pathsCost += pathsCost * (unit.forgebonus / 100);
  }

  // 3. Priest cost
  const holyLevel = paths.holy ?? 0;
  const priestCost = PRIEST_COST[holyLevel] ?? 0;

  // 4. Spy/assassin/seduce cost (part of cost_array, combined with others)
  let spyCost = 0;
  /*if (unit.spy && unit.spy > 0) spyCost += 40;
  if (unit.assassin && unit.assassin > 0) spyCost += 40;
  if (unit.seduce && unit.seduce > 0) spyCost += 60;
  else if (unit.succubus && unit.succubus > 0) spyCost += 60;*/

  // 5. Combine costs: largest full, rest at half — only for commanders
  const costArray = [ldrCost, pathsCost, priestCost, spyCost].sort((a, b) => b - a);
  let cost = 0;
  if (unit.commander) {
    cost = costArray[0]
      + costArray[1] / 2
      + costArray[2] / 2
      + costArray[3] / 2;
  }

  // 6. Special costs (added flat, NOT part of the cost_array halving)
  let specialCost = 0;
  if (unit.stealthy && unit.stealthy > 0 && unit.commander) {
    specialCost += 5;
  }
  /*if (unit.autohealer && unit.autohealer > 0 && unit.commander) {
    specialCost += 50;
  }
  if (unit.autodishealer && unit.autodishealer > 0 && unit.commander) {
    specialCost += 20;
  }*/

  cost = Math.floor(cost + specialCost);

  // 7. Base offset
  cost += unit.basecost - 10000;

  // 8. Slow-to-recruit discount (commanders only)
  if (unit.rt === 2 && unit.commander) {
    cost *= 0.9;
  }

  // 9. Sacred multiplier
  if (holyLevel > 0) {
    cost *= 1.3;
  }

  // 10. Commander markup and round
  if (!unit.commander) {
    cost = roundIfNeeded(cost);
  } else {
    cost = round5(cost * 1.4);
  }

  return Math.max(1, cost);
}

/* =========================================================
 * RESEARCH
 * ========================================================= */

export function calculateResearch(unit: Unit): number {
  if (!unit.commander) {
    return 0;
  }

  const paths = unit.magicPaths;

  // Sum all non-holy path levels
  let totalLevels =
    (paths.fire ?? 0) +
    (paths.air ?? 0) +
    (paths.water ?? 0) +
    (paths.earth ?? 0) +
    (paths.astral ?? 0) +
    (paths.death ?? 0) +
    (paths.nature ?? 0) +
    (paths.glamour ?? 0) +
    (paths.blood ?? 0);

  // Random paths: average contribution = levels × chance/100
  for (const rand of unit.randomMagicPaths) {
    // chance is stored as integer 1-100 in rand.mask context;
    // dom6inspector uses levels*chance/100, defaulting chance to 100
    totalLevels += rand.nbr; // nbr = levels; treat as 100% for base calc
  }

  // dom6inspector formula: research = 5 + (2 × totalLevels)
  let research = totalLevels > 0 ? 5 + 2 * totalLevels : 0;

  // Additive bonuses
  research += unit.researchbonus ?? 0;

  return Math.max(0, Math.floor(research));
}

/* =========================================================
 * RECRUITMENT POINTS
 * ========================================================= */

export function calculateRecruitmentPoints(unit: Unit): number {
  if (unit.reqPoints !== undefined) {
    return unit.reqPoints;
  }

  let points = 1;

  if (unit.commander) {
    points += 1;
  }

  if ((unit.magicPaths.holy ?? 0) > 0) {
    points += 1;
  }

  points += Math.max(0, unit.size - 2);

  const combatScore =
    unit.hp +
    unit.prot +
    unit.att +
    unit.def +
    unit.str;

  if (combatScore > 55) {
    points += 1;
  }

  const totalPaths =
    (unit.magicPaths.fire ?? 0) +
    (unit.magicPaths.air ?? 0) +
    (unit.magicPaths.water ?? 0) +
    (unit.magicPaths.earth ?? 0) +
    (unit.magicPaths.astral ?? 0) +
    (unit.magicPaths.death ?? 0) +
    (unit.magicPaths.nature ?? 0) +
    (unit.magicPaths.glamour ?? 0) +
    (unit.magicPaths.blood ?? 0);

  if (totalPaths >= 3) {
    points += 1;
  }

  return Math.max(1, Math.floor(points));
}

/* =========================================================
 * RESOURCES
 * ========================================================= */

export function calculateResources(unit: Unit): number {
  if (unit.armors.length == 0 || !unit.armors) {
    return unit.resources;
  }
  // rcost < 0 means autocalc; 0+ is explicit
  const ressize = unit.ressize || 3;

  // 2. Sum up the resource costs of all armor equipped by the unit
  let totalResourceCost = unit.rcost || 1;

  if (unit.armors && unit.armors.length > 0) {
    unit.armors.forEach(armor => {
      // Find matching armor object from your dataset
      if (armor.rcost) {
        // Calculate dynamic cost: (rcost * ressize) / 3
        totalResourceCost += (armor.rcost * ressize) / 3;
      }
    });
  }
  if (unit.weapons && unit.weapons.length > 0) {
    unit.weapons.forEach(weapon => {
      // Find matching armor object from your dataset
      if (weapon.rcost) {
        // Calculate dynamic cost: (rcost * ressize) / 3
        totalResourceCost += (weapon.rcost * ressize) / 3;
      }
    });
  }
  if (totalResourceCost > 60000) {
    totalResourceCost = 1;
  }
  return Math.floor(totalResourceCost);
}
export function calculateProtection(unit: Unit): number {
  const p_nat = unit.prot ?? 0;

  let p_body = 0;
  let p_head = 0;
  let p_general = 0;

  for (const armor of unit.armors) {
    const result = calculateArmorProtection(armor);

    // protBody and protHeadFinal already include general protection
    if (result.protBody !== null) {
      p_body = result.protBody;
    }
    if (result.protHeadFinal !== null) {
      p_head = result.protHeadFinal;
    }
    if (result.protGeneral !== null) {
      p_general = result.protGeneral;
    }
  }

  if (p_body || p_head) {
    // Dom6 stacking formula: combine natural prot with armor prot
    const p_body_final = p_nat + p_body - (p_nat * p_body / 40);
    const p_head_final = p_nat + p_head - (p_nat * p_head / 40);

    let p_total = (p_body_final * 4 + p_head_final) / 5;

    // Floor only when head prot is significant and no general zone armor
    p_total = (p_head_final > 10 && p_general === 0)
      ? Math.floor(p_total)
      : p_total;

    return Math.round(p_total);
  } else {
    return p_nat > 0 ? p_nat : 0;
  }
}
export type ArmorProtectionResult = {
  protHead: number | null;    // zone 1
  protTorso: number | null;   // zone 2 (raw)
  protUpper: number | null;   // zone 3 (raw)
  protLower: number | null;   // zone 4 (raw)
  protShield: number | null;  // zone 5
  protGeneral: number | null; // zone 6
  protBody: number | null;    // derived: blended torso/upper/lower + general
  protHeadFinal: number | null; // head + general
};
export function calculateArmorProtection(armor: Armor): ArmorProtectionResult {
  let protHead: number | null = null;
  let protTorso: number | null = null;
  let protUpper: number | null = null;
  let protLower: number | null = null;
  let protShield: number | null = null;
  let protGeneral: number | null = null;

  // Map zone data from protection entries
  for (const entry of armor.protection ?? []) {
    const zone = entry.zone_number;
    const prot = entry.protection;

    switch (zone) {
      case 1: protHead    = prot; break;
      case 2: protTorso   = prot; break;
      case 3: protUpper   = prot; break;
      case 4: protLower   = prot; break;
      case 5: protShield  = prot; break;
      case 6: protGeneral = prot; break;
    }
  }

  // Derive protBody from torso/upper/lower zones (if present)
  let protBody: number | null = null;
  if (protTorso !== null && protUpper !== null && protLower !== null) {
    protBody = Math.floor((protTorso + (protUpper + protLower) / 2) / 2);
  } else if (protTorso !== null) {
    // Partial data: fall back to torso only
    protBody = protTorso;
  }

  // Add general protection on top of body and head
  const protBodyFinal =
    protGeneral !== null
      ? (protBody ?? 0) + protGeneral
      : protBody;

  const protHeadFinal =
    protGeneral !== null
      ? (protHead ?? 0) + protGeneral
      : protHead;

  return {
    protHead,
    protTorso,
    protUpper,
    protLower,
    protShield,
    protGeneral,
    protBody: protBodyFinal,
    protHeadFinal,
  };
}
const unitMap = new Map<number, Unit>();
function makeUnitsMap(unitPool:Unit[]) {
  if (unitMap.size == 0) {
    unitPool.forEach((u) => {
      unitMap.set(u.id, u);
    })
  }
}
export function addMountGoldAndResources(unit:Unit, unitPool:Unit[]):void {
  makeUnitsMap(unitPool);
  if (!unit.mountmnr) {
    return;
  }
  if (unit.mountmnr && !unitMap.get(unit.mountmnr)) {
    console.log(unit.mountmnr);
    return;
  }
  const gold = calculateGold(unitMap.get(unit.mountmnr));
  if (gold) {
    unit.gold += gold;
  }
  const resources = calculateGold(unitMap.get(unit.resources));
  if (resources) {
    unit.resources += resources;
  }

}