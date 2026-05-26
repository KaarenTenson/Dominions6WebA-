import { randomUUID } from "node:crypto";
import { DraftState, UserDraftSate } from "../classes/DraftState.js";
import { writeBlob } from "../db/db-blob-wrtiter.js";
import { getUserById } from "../db/db-reading.js";
import { MagicSite, SiteGemEffect } from "../draftypes/magicSite.js";
import { DraftCard } from "../types.js";
import { Unit } from "../draftypes/unit.js";

export function generateDraftResults(draftResults: DraftState): string {
    const mime_type = "text/plain";
    const blob_id = randomUUID();

    const txtContent = buildDraftFile(draftResults);

    const buffer = Buffer.from(txtContent, "utf-8");

    writeBlob(
        blob_id,
        buffer,
        mime_type,
    );

    return blob_id;
}

function buildDraftFile(draftState: DraftState): string {
    const nations: string[] = [];

    draftState.userDraftStates.forEach((userState, id) => {
        nations.push(buildNationSection(userState, id ));
    })

    return nations.join("\n\n");
}

function buildNationSection(
    userState: UserDraftSate,
    userId: string
): string {

    const commanderIds = userState.confirmedChosenDraftedCards!!.commanders
        .map((card: any) => extractCardId(card))
        .join(" ");

    const unitIds = userState.confirmedChosenDraftedCards!!.units
        .map((card: any) => extractCardId(card))
        .join(" ");

    const pretenderIds = userState.confirmedChosenDraftedCards!!.pretenders
        .map((card: any) => extractCardId(card))
        .join(" ");

    const magicSiteEffects = 
        userState.confirmedChosenDraftedCards!!.magicSites.length > 0
            ? extractMagicSiteEffect(concatMagicSites(userState.confirmedChosenDraftedCards!!.magicSites as DraftCard<MagicSite>[]))
            : "";

    return `
${getUserById(userId).data?.username}
-
MA
-
${commanderIds || "TODO"}
-
${unitIds || "TODO"}
-
${magicSiteEffects}
-
-
-   
${pretenderIds || "TODO"}
-
${userState.confirmedChosenDraftedCards?.startLocation}
-
${userState.confirmedChosenDraftedCards?.heat}
-
-
`.trim();
}

function extractCardId(card: any): string {
    if (card?.id !== undefined && card?.id !== null) {
        return String(card.data.id);
    }

    return "TODO";
}
function concatMagicSites(sites: DraftCard<MagicSite>[]): MagicSite {
    const newSite:MagicSite = {name:"uus", level:4, gold:0, resource:0, decUnrest:0, supply:0, summonUnit:[], gemEffects:[]};
    sites.map((c) => c.data).forEach((site) => {
        if (site.gold) {
            newSite.gold += site.gold;
        }
        if (site.decUnrest) {
            newSite.decUnrest += site.decUnrest;
        }
        if (site.resource) {
            newSite.resource += site.resource;
        }
        if (site.summonUnit) {
            (newSite.summonUnit as Unit[]).push(site.summonUnit as Unit);
        }
        if (site.supply) {
            newSite.supply += site.supply;
        }
        if (site.gemEffects) {
         concatGemEffect(newSite.gemEffects, site.gemEffects);   
        }
    })
    return newSite;
}
function concatGemEffect(se1:SiteGemEffect[], se2:SiteGemEffect[]) {
    se2.forEach((e) => {
        let hasgems = false;
        se1.forEach((e2) => {
            if (e2.type == e.type) {
                e2.gemAmount += e.gemAmount;
                hasgems = true;
            }
        }) 
        if (!hasgems) {
            se1.push(e);
        }
    })
}
function extractMagicSiteEffect(site: MagicSite): string {

    const siteEffects:string[] = [];
    site.gemEffects?.forEach((e) => {
        siteEffects.push(`gems ${e.type} ${e.gemAmount}`);
    })
    if (site.gold && site.gold > 0) {
        siteEffects.push(`gold ${site.gold}`);
    }
    
    if (site.resource && site.resource > 0) {
        siteEffects.push(`res ${site.resource}`);
    }
    if (site.supply && site.supply > 0) {
        siteEffects.push(`supply ${site.supply}`);
    }
    if (site.decUnrest && site.decUnrest > 0) {
        siteEffects.push(`decunrest ${site.decUnrest}`);
    }
    if (site.summonUnit) {
        (site.summonUnit as Unit[]).forEach((u) => siteEffects.push(`natcom ${u.id}`));
    }
    console.log(siteEffects);;
    

    return siteEffects.join("\n");
}