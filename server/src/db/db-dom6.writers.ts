import { Nation } from "../types.js";
import { dom6DB } from "./init.js";
import { logger } from "../logger/logger.js";
import { Table } from "./tables.js";
import { randomUUID } from "crypto";

export const writeNations = (nations: Nation[]): void => {
  try {
    const insert = dom6DB.prepare(
      `INSERT OR IGNORE INTO ${Table.nation} (id, name, age) VALUES (?, ?, ?);`
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

export const writeLog = (msg: string, type: string) => {
  const instert = dom6DB
    .prepare(`INSERT INTO ${Table.log} (id, msg, type, created_at) VALUES (?, ?, ?, ?);`)
    .run(randomUUID(), msg, type, Date.now());
};
