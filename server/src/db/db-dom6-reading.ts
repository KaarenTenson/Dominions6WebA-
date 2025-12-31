import { Nation } from "../../types"
import { logger } from "../logger/logger";
import { dom6DB } from "./init"
import { Table } from "./tables";

export const getNations = ():Nation[] => {
    try {
        return dom6DB.prepare(`select * from ${Table.nation}`).all() as Nation[];
    } catch (error) {
        logger.error(error, "failed to fecth nations");
        return [];
    }
}