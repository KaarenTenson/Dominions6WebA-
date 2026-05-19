// draftypes/unit.ts

export interface RandomMagicPath {
  rand: number;
  nbr: number;
  link: number;
  mask: number;
}

export interface UnitMagicPaths {
  fire?: number;
  air?: number;
  water?: number;
  earth?: number;
  astral?: number;
  death?: number;
  nature?: number;
  glamour?: number;
  blood?: number;
  holy?: number;
}

export interface Unit {
  id: number;
  name: string;

  commander: boolean;
  capitalOnly: boolean;
  pretender?: boolean;

  gold?: number;
  research?:number;
  reqPoints?: number;
  calculatedResources?:number;

  hp: number;
  prot: number;
  mr: number;
  mor: number;
  str: number;
  att: number;
  def: number;
  prec: number;
  enc: number;

  mapmove: number;
  ap: number;
  size: number;
  ressize: number;

  basecost: number;
  rcost: number;

  reclimit?: number;
  rt: number;

  leader?: number;
  undeadleader?: number;
  magicleader?: number;

  startage?: number;
  maxage?: number;

  magicPaths: UnitMagicPaths;
  randomMagicPaths: RandomMagicPath[];

  weapons: number[];
  armors: number[];

  resources?: number;

  reinvigoration?: number;
  awe?: number;
  fear?: number;
  berserk?: number;
  darkvision?: number;

  heat?: number;
  cold?: number;

  poisonres?: number;
  fireres?: number;
  coldres?: number;
  shockres?: number;

  slashres?: number;
  bluntres?: number;
  pierceres?: number;
  acidres?: number;

  regeneration?: number;
  iceprot?: number;
  invulnerable?: number;
  fireshield?: number;
  banefireshield?: number;

  standard?: number;
  inspirational?: number;
  taskmaster?: number;
  beastmaster?: number;
  bodyguard?: number;

  supplybonus?: number;
  patrolbonus?: number;
  pillagebonus?: number;
  siegebonus?: number;
  researchbonus?: number;
  castledef?: number;

  stealthy?: number;
  taxcollector?: number;
  alch?: number;
  forgebonus?: number;

  nametype?: number;

  keywords: string[];
}