import {Blob, Result } from "../types.js";
import { logger } from "../logger/logger.js";
import { blobDB } from "./init.js";
import { Table } from "./tables.js";

export const getBlob = (blobId: string):Result<Blob> => {
    try {
         const row = blobDB.prepare(`SELECT data, mime_type FROM ${Table.file} WHERE id = ?`).get(blobId) as Blob;
         if (!row) {
            return {error: "seda pilti ei eksisteeri"};
         }
         return {data: row};
    } catch(error) {
        logger.error(error, "viga faili pärimisel");
         return {error:"eba õnnestus su faili pärida"}
    }
}