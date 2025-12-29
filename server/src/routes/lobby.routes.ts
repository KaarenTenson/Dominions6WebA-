// src/routes/lobby.routes.ts
import { Router } from "express";
import { getAllLobbys, getLobby, checkLobbyAccess } from "../db/db-reading";
import { addUserToLobby, writeLobby } from "../db/db-writer";
import { getSession } from "../crypto/cookies";
import { hashPassword } from "../crypto/crypto";
import { logger } from "../logger/logger";
import { Lobby } from "../../types";

const router = Router();

router.get("/lobby", (_req, res) => {
 const result = getAllLobbys();
  if (result.error) {
    res.status(500).json({ error: result.error });
    return;
  }
  res.status(200).json(result.data);
});
router.get("/lobby/auth/:lobby_id", (req, res) => {
  const session = getSession(req.cookies.session);
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  const { lobby_id } = req.params;
  const result = checkLobbyAccess(session.userId, lobby_id);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  return res.status(200).json({ status: "ok" });
});
router.post("/lobby/login/:lobby_id", (req, res) => {
    const body = req.body;
    const session = getSession(req.cookies.session);
    if (!session) return res.status(401).json({ error: "Not authenticated" });
  
    const { lobby_id } = req.params;
    if (!body || !lobby_id || !(body as Lobby).password) {
      return res.status(400).json({ error: "someting wwnet frog with jsooon" });
    }
  
    const lobby = getLobby(lobby_id);
    logger.info(lobby, "lobbysse siise lgoimine");
    logger.info(lobby, "serveri leitud lobby");
    if (lobby?.password != hashPassword((body as Lobby).password)) {
      return res.status(401).json({ error: "Vale pass" });
    } else {
      const result = addUserToLobby(session.userId, lobby_id);
      if (result.error) {
        return res.status(401).json({ error: result.error });
      }
      return res.status(200).json({ status: "ok" });
    }
});
router.post("/lobby", (req, res) => {
  const body = req.body;

  const session = getSession(req.cookies.session);

  if (!session) return res.status(401).json({ error: "Not authenticated" });

  if (!body) {
    return res.status(400).json({ error: "someting wwnet frog with jsooon" });
  }

  if (
    typeof body.name === "undefined" ||
    body.name === null ||
    (body.name as string).length == 0
  ) {
    return res.status(400).json({ error: "Nimi puudu" });
  }

  let err = writeLobby(body as Lobby);
  if (err.error) {
    res.status(500).json({ error: err.error });
    return;
  }

  err = addUserToLobby(session.userId, (body as Lobby).id);
  if (err.error) {
    res.status(500).json({ error: err.error });
    return;
  }

  res.status(200).json({ status: "ok" });
});

export default router;
