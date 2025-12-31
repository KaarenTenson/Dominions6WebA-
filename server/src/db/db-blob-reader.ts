import {Blob, Result } from "../../types";
import { logger } from "../logger/logger";
import { blobDB } from "./init";
import { Table } from "./tables";

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