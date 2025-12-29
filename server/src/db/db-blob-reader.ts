import {Blob, Result } from "../../types";
import { logger } from "../logger/logger";
import { blobDB } from "./init";

export const getBlob = (blobId: string):Result<Blob> => {
    try {
         const row = blobDB.prepare("SELECT data, mime_type FROM FILE WHERE id = ?").get(blobId) as Blob;
         if (!row) {
            return {error: "seda pilti ei eksisteeri"};
         }
         return {data: row};
    } catch(error) {
        logger.error(error, "viga faili pärimisel");
         return {error:"eba õnnestus su faili pärida"}
    }
}