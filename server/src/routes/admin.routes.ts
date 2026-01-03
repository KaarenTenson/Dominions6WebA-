import { Router } from "express";
import { getSession } from "../crypto/cookies";
import { logger } from "../logger/logger";
import { hashPassword } from "../crypto/crypto";
import { getEnv } from "../utils/env-utils";
import { deleteMessage } from "../db/db-writer";
import { newGame } from "../../dominions6/dominions-game-manager";
import { Dominions6Cofing } from "../../types";
const router = Router();
router.get("/admin/is_admin", (req, res) => {
  const session = getSession(req.cookies.session);
  if (!session || !session.isAdmin || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: "Pole luba" });
  }
  res.json({ status: "ok" });
});
router.post("/admin/login", (req, res) => {
  const session = getSession(req.cookies.session);
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: "Pole sisse logitud!!!!" });
  }
  const body = req.body as { password: string };
  if (!body || !body.password) {
    return res.status(400).json({ error: "Valet infot saadad" });
  }
  if (hashPassword(body.password) === getEnv("ADMIN_KEY")) {
    session.isAdmin = true;
    return res.status(200).json({ status: "ok" });
  }
  res.status(401).json({ error: "vale pass" });
});
router.post("/admin/new_game", (req, res) => {
  const session = getSession(req.cookies.session);
  if (!session || !session.isAdmin) {
    return res.status(401).json({ error: "Pole luba!!!!" });
  }
  const body = req.body as Dominions6Cofing;
  newGame(body);
  return res.status(200).json({ status: "ok" });
});
router.delete("/admin/delete_message/:message_id", (req, res) => {
  const session = getSession(req.cookies.session);
  const { message_id } = req.params;
  if (!session || !session.isAdmin) {
    return res.status(401).json({ error: "Pole luba!!!!" });
  }
  const result = deleteMessage(message_id);
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  res.status(200).json({ status: "ok" });
});
export default router;
