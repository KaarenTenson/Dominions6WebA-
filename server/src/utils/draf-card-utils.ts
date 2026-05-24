// utils/unitCalculations.ts

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
  // Explicit override
  if (unit.gold !== undefined) {
    return unit.gold;
  }

  // Non-autocalc: basecost is the literal gold cost
  if (unit.basecost <= 9000) {
    return roundIfNeeded(unit.basecost);
  }

  // ── Commander autocalc ──────────────────────────────────

  // 1. Leadership cost (lookup table)
  let totalLeader =
    (unit.leader ?? 0) +
    (unit.undeadleader ?? 0) +
    (unit.magicleader ?? 0);
  let ldrCost = leadershipCost(totalLeader);
  if (!unit.commander) {
    totalLeader = 0;
  }

  if (unit.inspirational) {
    ldrCost += 10 * unit.inspirational;
  }

  // 2. Path cost (tiered)
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

  // Handle random magic paths (100%-chance ones affect cost)
  const hasRandom = unit.randomMagicPaths.some(r => r.mask > 0);
  let pathsCost = 0;

  if (hasRandom) {
    // Build all possible path combinations from randoms,
    // then average as 75% largest + 25% smallest (matches inspector)
    const combinations: number[][] = [];

    function buildCombos(idx: number, current: number[]): void {
      if (idx >= unit.randomMagicPaths.length) {
        combinations.push([...current]);
        return;
      }
      const rand = unit.randomMagicPaths[idx];
      // Each bit in mask is a possible path; nbr = levels granted
      const possiblePaths = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // F A W E S D N G B
      const maskBits = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
      const options: number[] = [];
      for (let p = 0; p < maskBits.length; p++) {
        if (rand.mask & maskBits[p]) options.push(p);
      }
      if (options.length === 0) {
        buildCombos(idx + 1, current);
        return;
      }
      for (const opt of options) {
        const next = [...current];
        next[opt] = (next[opt] ?? 0) + rand.nbr;
        buildCombos(idx + 1, next);
      }
    }

    buildCombos(0, [...baseLevels]);

    const costs = combinations.map(combo =>
      pathArrayCost([...combo].sort((a, b) => b - a))
    );
    const largest = Math.max(...costs);
    const smallest = Math.min(...costs);
    pathsCost = largest * 0.75 + smallest * 0.25;
  } else {
    const sorted = [...baseLevels].sort((a, b) => b - a);
    pathsCost = pathArrayCost(sorted);
  }

  // Research bonus adjusts path cost
  const resBonus = unit.researchbonus ?? 0;
  if (pathsCost > 0 && resBonus > 0) {
    pathsCost += resBonus * 5;
  } else if (resBonus < 0) {
    pathsCost -= 5;
  }

  // 3. Priest cost
  const holyLevel = paths.holy ?? 0;
  const priestCost = PRIEST_COST[holyLevel] ?? 0;

  // 4. Spy / assassin cost
  let spyCost = 0;
  if (unit.stealthy !== undefined && unit.stealthy > 0 && unit.commander) {
    spyCost += 5; // stealthy commander bonus (scout-like)
  }

  // 5. Combine costs: largest full price, rest at half (dom6inspector formula)
  const costArray = [ldrCost, pathsCost, priestCost, spyCost].sort((a, b) => b - a);
  let cost = costArray[0]
    + costArray[1] / 2
    + costArray[2] / 2
    + costArray[3] / 2;

  // 6. Base offset
  cost += unit.basecost - 10000;

  // 7. Slow-to-recruit discount
  if (unit.rt === 2) {
    cost *= 0.9;
  }

  // 8. Sacred multiplier
  if (holyLevel > 0) {
    cost *= 1.3;
  }

  // 9. Commander markup (×1.4, round to 5)
  cost = round5(cost * 1.4);

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
        totalResourceCost +=(weapon.rcost * ressize) / 3;
      }
    });
  }
  if (totalResourceCost > 60000) {
    totalResourceCost = 1;
  }
  return Math.floor(totalResourceCost);
}
export function calculateProtection(unit: Unit): number {
  const baseProt = unit.prot;

  // Each zone starts at baseProt (natural protection)
  const zoneProt: Record<number, number> = {
    1: baseProt,
    2: baseProt,
    3: baseProt,
    4: baseProt,
    5: baseProt,
  };

  // Group armor protection entries by zone
  const byZone: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  for (const armor of unit.armors) {
    if (!armor.protection) continue;
    for (const pr of armor.protection) {
      const z = pr.zone_number;
      if (byZone[z] !== undefined) {
        byZone[z].push(pr.protection);
      }
    }
  }

  // For each zone, iteratively stack armor layers on top of natural prot
  for (const zone of [1, 2, 3, 4, 5] as const) {
    let current = baseProt;
    for (const armorProt of byZone[zone]) {
      // Dom6 stacking formula: new = armor + current - (armor * current / 40)
      current = armorProt + current - (armorProt * current / 40);
    }
    zoneProt[zone] = current;
  }

  const mean = Math.ceil(
    (zoneProt[1] + zoneProt[2] + zoneProt[3] + zoneProt[4] + zoneProt[5]) / 5
  );
  let p_general = zoneProt[3] + zoneProt[4] + zoneProt[5];
  let p_body = zoneProt[1];
  let p_head = zoneProt[2];

  if (p_body || p_head) {
			//displayed values
			p_body = (baseProt + p_body - (baseProt * p_body/40));
			p_head = (baseProt + p_head - (baseProt * p_head/40));
			var p_total = ((p_body * 4) + p_head) / 5;

			p_total = (p_head > 10 && p_general == 0) ? Math.floor(p_total) : p_total;

      return Math.ceil(p_total);
		} else {
			return Math.max(baseProt, 1);
		}
  return mean;
}