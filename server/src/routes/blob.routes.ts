import { Router } from "express";
import { logger } from "../logger/logger.js";
import { getBlob } from "../db/db-blob-reader.js";
import multer from "multer";
import { getSession } from "../crypto/cookies.js";
import { writeBlob } from "../db/db-blob-wrtiter.js";
import { FileMetaData } from "../types.js";

const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage });
router.get("/blob/:blob_id", (req, res) => {
  const { blob_id } = req.params;
  logger.info("päritakse faili, id:" + blob_id);
  const result = getBlob(blob_id);
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  res.setHeader("Content-Type", result.data!!.mime_type);
  res.send(result.data?.data);
});

router.post("/blob/upload", upload.single("file"), async (req, res) => {
  try {
    const session = getSession(req.cookies.session);
    if (!session) return res.status(401).json({ error: "Not authenticated" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const blob_id = crypto.randomUUID();
    let result = writeBlob(blob_id, req.file.buffer, req.file.mimetype);
    if (result.error) {
      res.status(500).json({ error: result.error });
    }
    res.json({
      blobId: blob_id,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    } as FileMetaData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});
export default router;
