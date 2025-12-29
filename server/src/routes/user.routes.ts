import { Router } from "express";
import {
  authenticateUser,
  getUserById,
  getUserFromToken,
} from "../db/db-reading";
import { createCookies, getSession } from "../crypto/cookies";
import { writeBlob } from "../db/db-blob-wrtiter";
import { updateUserProfilePic } from "../db/db-writer";
import multer from "multer";
import { logger } from "../logger/logger";
import sharp from "sharp";

const router = Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage });
router.post(
  "/user/upload-profile-pic",
  upload.single("profilePic"),
  async(req, res) => {
    try {
      const session = getSession(req.cookies.session);
      if (!session) return res.status(401).json({ error: "Not authenticated" });

      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const blob_id = crypto.randomUUID();
      const resizedBuffer = await sharp(req.file.buffer)
        .resize(256, 256, {
          fit: "cover", // square crop
          position: "centre",
        })
        .jpeg({ quality: 100 }) // normalize format
        .toBuffer();
      let result = writeBlob(blob_id, resizedBuffer, "image/jpeg");
      if (result.error) {
        res.status(500).json({ error: result.error });
      }

      result = updateUserProfilePic(session.userId, blob_id);
      if (result.error) {
        res.status(500).json({ error: result.error });
      }
      res.json({ status: "ok" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);
router.get("/user", (req, res) => {
  const sessionId = req.cookies.session;
  if (!sessionId) return res.status(401).json({ error: "Pole sisse logitud" });
  const session = getSession(sessionId); // fetch from DB
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: "Session expired" });
  }
  const result = getUserFromToken(sessionId);
  logger.info(result, "päritakse kasutajat");
  return res.status(200).json(result.data);
});
router.get("/user/:user_id", (req, res) => {
  const { user_id } = req.params;
  if (!user_id) return res.status(400).json({ error: "polekasutaja id'd" });
  const result = getUserById(user_id);
  logger.info(result, "päritakse kasutajat");
  return res.status(200).json(result.data);
});
export default router;
