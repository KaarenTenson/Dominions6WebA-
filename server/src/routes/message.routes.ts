// src/routes/message.routes.ts
import { Router } from "express";
import {
  getAllMessagesFromLobby,
  getAllMessagesFromMainLobby,
  checkLobbyAccess,
} from "../db/db-reading.js";
import { getSession } from "../crypto/cookies.js";
import { logger } from "../logger/logger.js";

const router = Router();

router.get("/message", (_req, res) => {
  const result = getAllMessagesFromMainLobby();
  logger.info(result);
  if (result.error) return res.status(500).json({ error: result.error });
  res.status(200).json(result.data);
});

router.get("/message/:lobby_id", (req, res) => {
  const { lobby_id } = req.params;

  const session = getSession(req.cookies.session);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const hasAccess = checkLobbyAccess(session.userId, lobby_id);
  if (hasAccess.error) return res.status(401).json({ error: hasAccess.error });

  const result = getAllMessagesFromLobby(lobby_id);
  logger.info(result);
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  return res.status(200).json(result.data);
});

export default router;
