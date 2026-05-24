export type Armor = {
    id:number;
    name:string;
    type:number;
    def:number;
    enc:number;
    rcost:number;
    protection?: ArmorProtectionData[];
}
export type ArmorProtectionData = {
  zone_number: number;
  protection:number;
  armor_number:number;
}