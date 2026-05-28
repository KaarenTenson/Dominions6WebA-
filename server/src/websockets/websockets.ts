// src/ws-server.ts
import { Server as HTTPServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Message, User, WsMessage, DraftEventType, DraftCard, UserReadyState, SyncData, UserConfirmationState, ResetData } from "../types.js";
import { DraftState, UserDraftSate } from "../classes/DraftState.js";
import { logger } from "../logger/logger.js";
import { writeMessage } from "../db/db-writer.js";
import { parseCookies } from "../crypto/cookies.js";
import { checkLobbyAccess, getUserById, readSession } from "../db/db-reading.js";
import { IncomingMessage } from "http";
import { generate_commander_pack, generate_hero_pack, generate_magic_site_pack, generate_pretender_pack, generate_unit_pack } from "../card_generator.js";
import { json } from "stream/consumers";
import { generateDraftResults } from "../utils/draft-utils.js";

let wss: WebSocketServer;

const connectionsByUser = new Map<string, UserWebsocketConnection>();
let draftSession: DraftState = new DraftState();

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
    console.log(`user connected ${userId}, ${lobbyId}`);
    if (lobbyId && lobbyId != "DRAFT") {
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
    if (lobbyId == "DRAFT") {
      if (draftSession.userDraftStates.has(userId)) {
        broadCastSyncInformation()
      } else if (draftSession.turn == 0) {
        draftSession.userDraftStates.set(userId, new UserDraftSate(userId));
        broadCastUsers();
        brodCastReady();
      }
    }
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
          ;
      } else if (msg.type == "delete") {
        connection.handleAction(msg);
      } else {
        const userId = getUserId(ws, req);
        handleDraftEvents(msg, userId!!);
      }
    });

    ws.on("close", () => {
      connectionsByUser.delete(userId);
      console.log(`User disconnected: ${userId}`);
      if ([...draftSession.userDraftStates.keys()].includes(userId))
        broadCastUsers();
    });
  });
}
const validateCardConfirmation = (cards: DraftCard<any>[]) => {
  if (cards.length != 2 || (cards.length == 2 && cards[0].id == cards[1].id)) {
    console.log("card confirmation is not valid");
    return false;
  }
  return true;
}
const handleDraftEvents = (msg: WsMessage<any>, userId: string) => {
  if (msg.type == "confirm") {
    if (!validateCardConfirmation(msg.data)) {
      return;
    }
    draftSession.selectCards(msg.data, userId);
    console.log(`got confirm msg from ${userId}`)
    if (draftSession.checkConfirmed()) {
      draftSession.addCards();
      console.log("next turn");
      nextTurn();
    } else {
      broacCastConfirm();
    }
  }
  if (msg.type == "ready") {
    const userState = draftSession.userDraftStates.get(userId);
    userState!!.isReady = msg.data as boolean;
    console.log(`User ready, userId: ${userId}, state: ${msg.data}`);
    if (draftSession.checkIsReady() && draftSession.userDraftStates.size > 1) {
      console.log(`Draft started`);
      startEvent();
      nextTurn();
    } else {
      brodCastReady();
    }
  }
  if (msg.type == "reset") {
    const userState = draftSession.userDraftStates.get(userId);
    userState!!.wantsReset = msg.data as boolean;
    if (draftSession.checkWantsReset()) {
      const resetMessage: WsMessage<null> = { lobbyId: "DRAFT", type: "reset", data: null };
      broadcastDraftMsg(resetMessage);
      endDraft();
    } else {
      broadcastResetStates();
    }
  }
  if (msg.type == "sync") {
    broadCastSyncInformation();
  }
  if (msg.type == "confirm_drafted_cards") {
    draftSession.setSelectedChosenDraftedCards(msg.data, userId);
    handleDraftedCardSelection();
    broacCastConfirm();
  }
}
const broadcastResetStates = () => {
  const resetStates: ResetData[] = [...draftSession.userDraftStates.entries()].map((state) => {
    return { userId: state[0], reset: state[1].wantsReset }
  })
  const resetStatesMsg: WsMessage<ResetData[]> = { lobbyId: "DRAFT", type: "reset_event", data: resetStates };
  broadcastDraftMsg(resetStatesMsg);
}

const handleDraftedCardSelection = () => {
  if (draftSession.checkConfirmed()) {
    draftSession.confirmSelectedChosenDraftedCards();
    const blob_id = generateDraftResults(draftSession);
    draftSession.userDraftStates.forEach((sess) => {
      sess.blobId = blob_id;
      sess.isEnded = true;
    })
    const endMsg: WsMessage<string> = { lobbyId: "DRAFT", type: "end", data: blob_id };
    broadcastDraftMsg(endMsg);
    //endDraft();
  }
}
const broacCastConfirm = () => {
  const msg: WsMessage<UserConfirmationState[]> = { type: "confirm_event", data: draftSession.getConfirmedStatus(), lobbyId: "DRAFT" };
  broadcastDraftMsg(msg);
}
const broadcastDraftMsg = (msg: WsMessage<any>) => {
  draftSession.userDraftStates.forEach((state, userId) => {
    const conn = connectionsByUser.get(userId);
    if (!conn || !conn.ws) {
      return;
    }
    conn!!.ws.send(JSON.stringify(msg));
  })
}
const broadCastSyncInformation = () => {
  broadCastUsers();
  brodCastReady();
  broacCastConfirm();
  broadcastResetStates();
  draftSession.userDraftStates.forEach((state, userId) => {
    const data = state.toSyncInfo(draftSession.cardSelection);
    const msg: WsMessage<SyncData> = { type: "sync", data: data, lobbyId: "DRAFT" };
    const conn = connectionsByUser.get(userId);
    if (!conn || !conn.ws) {
      return;
    }
    conn!!.ws.send(JSON.stringify(msg));
  })
}
const brodCastReady = () => {
  const user_readyness: UserReadyState[] = [...draftSession.userDraftStates.values()].map((sess) => {
    return { userId: sess.user, ready: sess.isReady }
  });
  const msg: WsMessage<UserReadyState[]> = { lobbyId: "DRAFT", type: "ready_states", data: user_readyness };
  broadcastDraftMsg(msg);
}
const broadCastUsers = () => {
  const draftUserIds = [...draftSession.userDraftStates.values()].map((sess) => sess.user);
  const users_results = draftUserIds.map(id => getUserById(id));
  const error = users_results.find((res) => res.error != undefined);
  if (error != undefined) {
    console.log(error.data);
    return;
  }
  console.log(users_results);
  const users = users_results.map((r) => r.data!!);
  const msg: WsMessage<User[]> = { lobbyId: "DRAFT", type: "user_data", data: users };
  broadcastDraftMsg(msg);
}
const startEvent = () => {
  broadCastUsers();
  draftSession.userDraftStates.forEach(sess => {
    const ws_conn = connectionsByUser.get(sess.user);
    if (ws_conn?.lobbydId != "DRAFT") {
      return;
    }
    if (!ws_conn || !ws_conn.ws) {
      return;
    }
    const msg: WsMessage<null> = { lobbyId: "DRAFT", type: "start", data: null };
    ws_conn?.ws.send(JSON.stringify(msg))
  })
}
const nextTurn = () => {
  draftSession.nextTurn();
  if (draftSession.checkEmptyPacks()) {
    new_pack_event();
  } else {
    draftSession.forward_packs();
    draftSession.userDraftStates.forEach(sess => {
      const ws_conn = connectionsByUser.get(sess.user);
      if (ws_conn?.lobbydId != "DRAFT") {
        return;
      }
      if (!ws_conn || !ws_conn.ws) {
        return;
      }
      const msg: WsMessage<DraftCard<any>[]> = { lobbyId: "DRAFT", type: "next_pack", data: sess.current_pack };
      ws_conn?.ws.send(JSON.stringify(msg))
    })
  }
  broacCastConfirm();
}

const new_pack_event = () => {
  draftSession.turn += 1;
  if (draftSession.turn > 9) {
    endDraft();
  }
  draftSession.userDraftStates.forEach(sess => {
    const ws_conn = connectionsByUser.get(sess.user);
    if (!ws_conn || !ws_conn.ws) {
      return;
    }
    let pack: DraftCard<any>[];
    if (draftSession.turn == 1) {
       pack = generate_magic_site_pack();
    } else if (draftSession.turn == 2 || draftSession.turn == 3) {
      pack = generate_commander_pack();
    } else if (draftSession.turn == 5 || draftSession.turn == 4) {
      pack = generate_unit_pack();
    }  else if (draftSession.turn == 6)  {
      pack = generate_hero_pack();
    } else if (draftSession.turn == 7) {
     pack = generate_pretender_pack();
    } else {
      cardSelectionEvent();
      return;
    }
    sess.current_pack = pack;

    const msg: WsMessage<DraftCard<any>[]> = { lobbyId: "DRAFT", type: "next_pack", data: pack };
    ws_conn?.ws.send(JSON.stringify(msg))

  })
}
const cardSelectionEvent = () => {
  const msg: WsMessage<undefined> = { lobbyId: "DRAFT", type: "card_selection", data: undefined };
  draftSession.cardSelection = true;
  broadcastDraftMsg(msg);
  broadCastSyncInformation();
  return;
}
const endDraft = () => {
  //TODO
  draftSession = new DraftState();
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