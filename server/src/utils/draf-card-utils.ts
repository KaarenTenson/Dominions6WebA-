// utils/unitCalculations.ts

import { Unit } from "../draftypes/unit.js";

/* =========================================================
 * GOLD
 * ========================================================= */

export function calculateGold(unit: Unit): number {
  if (unit.gold !== undefined) {
    return unit.gold;
  }

  if (unit.basecost < 10000) {
    return Math.max(0, unit.basecost);
  }

  let gold = unit.basecost - 10000;

  if (unit.commander) {
    const leadership =
      (unit.leader ?? 0) +
      (unit.undeadleader ?? 0) +
      (unit.magicleader ?? 0);

    gold += Math.floor(leadership / 40);

    const paths = unit.magicPaths;
    const pathTotal =
      (paths.fire ?? 0) +
      (paths.air ?? 0) +
      (paths.water ?? 0) +
      (paths.earth ?? 0) +
      (paths.astral ?? 0) +
      (paths.death ?? 0) +
      (paths.nature ?? 0) +
      (paths.glamour ?? 0) +
      (paths.blood ?? 0) +
      (paths.holy ?? 0);

    gold += pathTotal * 7;

    for (const rand of unit.randomMagicPaths) {
      gold += rand.nbr * 2;
    }

    gold += (unit.researchbonus ?? 0) * 2;
  }

  if ((unit.magicPaths.holy ?? 0) > 0) {
    gold += 5;
  }

  if (unit.keywords.includes("mounted")) {
    gold += 10;
  }

  const combatPower =
    unit.hp +
    unit.prot +
    unit.str +
    unit.att +
    unit.def +
    unit.mor;

  if (combatPower > 70) {
    gold += Math.floor((combatPower - 70) / 5);
  }

  gold += (unit.awe ?? 0) * 4;
  gold += (unit.fear ?? 0) * 3;
  gold += (unit.regeneration ?? 0);
  gold += (unit.invulnerable ?? 0);

  if (unit.stealthy !== undefined && unit.stealthy > 0) {
    gold += 2;
  }

  return Math.max(1, Math.round(gold));
}

/* =========================================================
 * RESEARCH
 * ========================================================= */

export function calculateResearch(unit: Unit): number {
  if (!unit.commander) {
    return 0;
  }

  let research = 0;

  const paths = unit.magicPaths;
  research +=
    (paths.fire ?? 0) +
    (paths.air ?? 0) +
    (paths.water ?? 0) +
    (paths.earth ?? 0) +
    (paths.astral ?? 0) +
    (paths.death ?? 0) +
    (paths.nature ?? 0) +
    (paths.glamour ?? 0) +
    (paths.blood ?? 0);

  for (const rand of unit.randomMagicPaths) {
    research += rand.nbr * 0.5;
  }

  research += unit.researchbonus ?? 0;

  // FIX: maxage does not exist on Unit — removed old-age penalty.
  // If you add maxage to the Unit interface later, restore:
  // if (unit.startage !== undefined && unit.maxage !== undefined
  //     && unit.startage > unit.maxage * 0.75) { research -= 1; }

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
  // FIX: was unit.calculatedResources (doesn't exist); correct field is unit.resources
  if (unit.resources !== undefined) {
    return unit.resources;
  }

  if (unit.rcost >= 0) {
    return unit.rcost;
  }

  let resources = 0;

  resources += unit.prot * 0.9;
  resources *= 0.8 + unit.size * 0.2;

  if (unit.prot >= 15) {
    resources += 5;
  }

  if (unit.keywords.includes("mounted")) {
    resources += 8;
  }

  if (unit.att >= 13) {
    resources += 2;
  }

  if (unit.armors.length >= 2) {
    resources += 2;
  }

  return Math.max(1, Math.round(resources));
}