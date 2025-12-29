import { Nation } from "../../types";
import { dom6DB } from "./init";
import { logger } from "../logger/logger.js";

export const writeNations = (nations: Nation[]): void => {
  try {
    const insert = dom6DB.prepare(
      "INSERT OR IGNORE INTO NATION (id, name, age) VALUES (?, ?, ?);"
    );
    const insertMany = dom6DB.transaction((rows: Nation[]) => {
      for (const row of rows) {
        insert.run(row.id, row.name, row.age);
      }
    });
    insertMany(nations);
  } catch (error) {
    logger.error(error, "ei õnnestnud nationeid kirjutada");
  }
};
