import { Nation } from "../../types"
import { logger } from "../logger/logger";
import { dom6DB } from "./init"

export const getNations = ():Nation[] => {
    try {
        return dom6DB.prepare("select * from NATION").all() as Nation[];
    } catch (error) {
        logger.error(error, "failed to fecth nations");
        return [];
    }
}