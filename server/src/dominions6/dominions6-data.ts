import { parse } from "csv-parse";
import { Age, Nation } from "../types.js";
import * as fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
const parser = parse({
  delimiter: "\t",
});
function readCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];

    fs.createReadStream(filePath)
      .pipe(parser)
      .on("data", (row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", reject);
  });
}

const nationMap = { "1": "EA", "2": "MA", "3": "LA" };
export const getNations = async(): Promise<Nation[]> => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const filePath = path.join(__dirname, "../../nations.csv");
  const rows: string[] = await readCsv(filePath);

  const nations: Nation[] = [];
  const idRow = 0;
  const name = 1;
  const age = 5;
  rows.forEach((r) => {
    if (r[age] === "0") {
      return;
    }
    nations.push({
      id: parseInt(r[idRow]),
      name: r[name],
      age: nationMap[r[age] as "1" | "2" | "3"] as Age,
    });
  });
  return nations;
};
