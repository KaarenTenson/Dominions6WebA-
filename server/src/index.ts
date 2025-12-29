import express from "express";
import { logger, httpLogger } from "./logger/logger.js";
import type { Lobby, QuestUser, User } from "../types.js";
import {
  addUserToLobby,
  updateUserProfilePic,
  writeLobby,
  writeQuest,
  writeUser,
} from "./db/db-writer.js";
import { error, log } from "node:console";
import {
  authenticateUser,
  checkIfUserExists,
  checkLobbyAccess,
  getAllLobbys,
  getAllMessagesFromLobby,
  getAllMessagesFromMainLobby,
  getLobby,
  getUserById,
  getUserFromToken,
} from "./db/db-reading.js";
import { initWebSocket } from "./websockets/websockets.js";
import { createServer } from "http";
import app from "./app.ts";
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = createServer(app);
initWebSocket(server);
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
