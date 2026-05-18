// stores/useMessageStore.ts
import { create } from "zustand";

import type {DraftCard } from "../types";

type DraftStore = {
    commanders: DraftCard<any>[];
    magicSites: DraftCard<any>[];
    units: DraftCard<any>[];
    pretenders: DraftCard<any>[];
    currentPack: DraftCard<any>[];
    addCommander: (commander: DraftCard<any>) => void;
    addMagicSite: (magicSite: DraftCard<any>) => void;
    addUnit: (unit: DraftCard<any>) => void;
    addPretender: (pretender: DraftCard<any>) => void;
    setPack: (newPack:DraftCard<any>[]) => void;
    setCommanders: (commanders: DraftCard<any>[]) => void;
    setUnits: (units: DraftCard<any>[]) => void;
    setPretenders: (pretenders: DraftCard<any>[]) => void;
    setMagicSites: (magicSites: DraftCard<any>[]) => void;
};

export const useDraftStore = create<DraftStore>((set, get) => ({
    commanders: [],
    magicSites: [],
    pretenders: [],
    units: [],
    currentPack: [],
    addCommander: (commander) => {
        const current_commander = get().commanders;
        current_commander.push(commander)
        set({commanders:current_commander});
    
    },
    addMagicSite: (magicSite) => {
        const current_magicSites = get().magicSites;
        current_magicSites.push(magicSite)
        set({magicSites:current_magicSites});
    },
    addUnit: (unit) => {
        const current_units = get().units;
        current_units.push(unit)
        set({units:current_units});
    },
    addPretender: (pretender: DraftCard<any>) => {
        const current_pretenders = get().pretenders;
        current_pretenders.push(pretender);
        set({pretenders:current_pretenders});
    },
    setPack: (pack:DraftCard<any>[]) => {
        set({currentPack:pack})
    },
    setCommanders: (commanders: DraftCard<any>[]) => {
        set({commanders: commanders})
    },
    setUnits: (units: DraftCard<any>[]) => {
        set({units: units})
    },
    setPretenders: (pretenders: DraftCard<any>[]) => {
        set({pretenders: pretenders})
    },
    setMagicSites: (magicSites: DraftCard<any>[]) => {
        set({magicSites: magicSites})
    },
    }));
