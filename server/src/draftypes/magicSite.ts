import { Unit } from "./unit.js";

export type SiteGemEffect = {
    gemAmount:number;
    type:  "fire"|"air"|"water"|"earth"|"astral"|"death"|"nature"|"glamour"|"blood";
}
export type SiteLevel = 1|2|3|4;
export type MagicSite = {
    //max 5 gems for site
    gemEffects?:SiteGemEffect[];
    //max 300
    gold?: number;
    //max 200
    resource?: number;
    //max 100
    supply?: number;
    name:string;
    //max 30
    decUnrest?: number;
    level:SiteLevel;
    //any unit
    summonUnit?: Unit;

}