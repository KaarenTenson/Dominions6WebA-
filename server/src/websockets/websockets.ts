// src/ws-server.ts
import { Server as HTTPServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Message, User, WsMessage } from "../../types";
import { logger } from "../logger/logger";
import { writeMessage } from "../db/db-writer";
import { parseCookies } from "../crypto/cookies";
import { checkLobbyAccess, readSession } from "../db/db-reading";
import { IncomingMessage } from "http";

let wss: WebSocketServer;

const connectionsByUser = new Map<string, UserWebsocketConnection>();

export class UserWebsocketConnection {
  userId: string;
  ws: WebSocket;
  lobbydId: string | undefined;

  constructor(userId: string, ws: WebSocket, lobbyId?: string) {
    this.userId = userId;
    this.lobbydId = lobbyId;
    this.ws = ws;
  }

  sendAction(msg: WsMessage<any>) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  handleMessage(msg: WsMessage<Message>) {
    const user = msg.data.userId;
    const result = writeMessage(msg.data);
    if (!user) return;
    logger.info(msg, "got mesaage");

    [...connectionsByUser.keys()].forEach((n) => {
      if (connectionsByUser && connectionsByUser.get(n)) {
        if (
          this.lobbydId &&
          connectionsByUser.get(n)?.lobbydId !== this.lobbydId
        ) {
          return;
        }
        connectionsByUser.get(n)!!.sendAction(msg);
      }
    });
  }
    handleAction(msg: WsMessage<any>) {
    logger.info(msg, "got mesaage");
    [...connectionsByUser.keys()].forEach((n) => {
      if (connectionsByUser && connectionsByUser.get(n)) {
        if (
          this.lobbydId &&
          connectionsByUser.get(n)?.lobbydId !== this.lobbydId
        ) {
          return;
        }
        connectionsByUser.get(n)!!.sendAction(msg);
      }
    });
  }
}

export function initWebSocket(server: HTTPServer) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const userId = getUserId(ws, req);

    if (!userId) {
      return;
    }
    const url = new URL(req.url ?? "", "http://localhost");
    
    const lobbyId = url.searchParams.get("lobbyId");
    if (lobbyId) {
      const result = checkLobbyAccess(userId, lobbyId);
      if (result.error) {
        ws.close(3000, result.error);
      }
    }
    const connection = new UserWebsocketConnection(
      userId,
      ws,
      lobbyId ? lobbyId : undefined
    );

    const existing = connectionsByUser.get(userId);
    if (existing) {
      existing.ws.close(1000, "Logged in from another device");
    }

    connectionsByUser.set(userId, connection);
    console.log(`User connected: ${userId}`);

    ws.on("message", (raw) => {
      let msg: WsMessage<any>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (msg.type == "message") {
        msg.data.userId = userId;
        connection.handleMessage(msg)
      ;} else {
        connection.handleAction(msg);
      }
    });

    ws.on("close", () => {
      connectionsByUser.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
  });
}
const getUserId = (ws: WebSocket, req: IncomingMessage): string | null => {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies["session"]) {
    ws.close(1008, "not authenticated");
    return null;
  }
  const res = readSession(cookies["session"]);

  if (res.error) {
    ws.close(1008, res.error);
    return null;
  }

  if (!res.data) {
    ws.close(1008, res.error);
    return null;
  }
  return res.data.userId;
};