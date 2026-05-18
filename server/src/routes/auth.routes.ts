// src/routes/auth.routes.ts
import { Router } from "express";
import { authenticateUser, checkIfUserExists } from "../db/db-reading.js";
import { createCookies, getSession } from "../crypto/cookies.js";
import { QuestUser, User } from "../types.js";
import { logger } from "../logger/logger.js";
import { writeQuest, writeUser } from "../db/db-writer.js";

const router = Router();

router.post("/login", (req, res) => {
  const result = authenticateUser(req.body);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  createCookies(result.data!, res);
  res.json({ status: "ok" });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  res.json({ ok: true });
});
router.post("/register_quest", (req, res) => {
  const body = req.body as QuestUser;
  logger.info(body);

  if (!body) {
    return res.status(400).json({ error: "valet infot saadad" });
  }
  body.id = crypto.randomUUID();
  let result = checkIfUserExists(body);
  if (result.error) {
    res.status(500).json({ error: result.error });
    return res;
  }
  result = writeQuest(body);
  if (result.error) {
    res.status(500).json({ error: result.error });
  }

  if (!createCookies(body.id, res).error) {
    res.status(200).json({ status: "ok" });
  }
  res.status(500).json({ error: "swwy" });
});

router.post("/register", (req, res) => {
  const body = req.body as User;
  if (!body || !body.password) {
    return res.status(400).json({ error: "Valet infot saadad" });
  }
  body.id = crypto.randomUUID();
  let result = checkIfUserExists(body);
  if (result.error) {
    res.status(500).json({ error: result.error });
    return res;
  }
  result = writeUser(body);
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  if (!createCookies(body.id, res).error) {
    return res.status(200).json({ status: "ok" });
  }
  res.status(500).json({ error: "swwy" });
});

router.get("/me", (req, res) => {
  const sessionId = req.cookies.session;
  if (!sessionId) return res.status(401).json({ error: "Not logged in" });

  const session = getSession(sessionId); // fetch from DB
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: "Session expired" });
  }

  res.json({ status: "ok" });
});
export default router;
