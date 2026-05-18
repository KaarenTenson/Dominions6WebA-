import { Nation } from "../types.js"
import { logger } from "../logger/logger.js";
import { dom6DB } from "./init.js"
import { Table } from "./tables.js";

export const getNations = ():Nation[] => {
    try {
        return dom6DB.prepare(`select * from ${Table.nation}`).all() as Nation[];
    } catch (error) {
        logger.error(error, "failed to fecth nations");
        return [];
    }
}