import { Result } from "../types.js";
import { logger } from "../logger/logger.js";
import { blobDB } from "./init.js";
import { Table } from "./tables.js";
export const writeBlob = (
  blobId: string,
  buffer: Buffer<ArrayBufferLike>,
  mime_type: string,
): Result<void> => {
  try {
    blobDB
      .prepare(`INSERT INTO ${Table.file} VALUES (?, ?, ?, ?);`)
      .run(blobId, buffer, mime_type, Date.now());
    return {};
  } catch (error) {
    logger.error(error, "faili kirjutamine ebaõnnestus");
    return {  error: "uups midagi valesti" };
  }
};
