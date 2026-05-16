import { log, table } from "node:console";
import type {
  Result,
  Lobby,
  Message,
  SessionCookie,
  User,
} from "../../types.js";
import { hashPassword } from "../crypto/crypto.js";
import { logger } from "../logger/logger.js";
import { sqliteDB } from "./init.js";
import { mapMessage } from "./mappers.ts/messageMapper.js";
import { Table } from "./tables.js";

export const lobbys = new Map<string, Lobby>();

export const checkIfUserExists = (user: User): Result<void> => {
  try {
    const result = sqliteDB
      .prepare(`SELECT id FROM ${Table.user} WHERE username = ?;`)
      .pluck()
      .get(user.username) as string | undefined;
    console.log("check fi user eqists query" + result ? result : "null");
    if (result) {
      return {
        error: "user with that username already exists",
      };
    } else {
      console.log("check fi user eqists query" + result ? result : "null");
      return {};
    }
  } catch (err) {
    logger.error(err, "failed to register user");
    return { error: "failed to register user" };
  }
};

export const authenticateUser = (user: User): Result<string> => {
  try {
    const userId = sqliteDB
      .prepare(`SELECT id from ${Table.user} where username = ? and password = ?;`)
      .get(user.username, hashPassword(user.password!!)) as { id: string };
    if (userId) {
      return { data: userId.id };
    }
    return { error: "vales pass või nimi" };
  } catch (error) {
    return { error: "oops" };
  }
};

export const getAllMessagesFromMainLobby = (): Result<Message[]> => {
  try {
    const result = sqliteDB
      .prepare(
        `SELECT * FROM ${Table.message} where lobbyId IS NULL ORDER BY created_at asc LIMIT 50;`
      )
      .all();
    console.log("check fi user eqists query" + result ? result : "null");
    if (!result) {
      return {
        error: "errror retriving messages",
      };
    } else {
      return {
        data: result.map((r) => mapMessage(r)),
      };
    }
  } catch (err) {
    logger.error(err, "failed to query message");
    return { error: "failed to query message" };
  }
};

export const getAllMessagesFromLobby = (lobbyId: string): Result<Message[]> => {
  try {
    const result = sqliteDB
      .prepare(
        `SELECT * FROM ${Table.message} where lobbyId = ? ORDER BY created_at asc LIMIT 50;`
      )
      .all(lobbyId);
    console.log("check fi user eqists query" + result ? result : "null");
    if (!result) {
      return {
        error: "errror retriving messages",
      };
    } else {
      return {
        data: result.map((r) => mapMessage(r)),
      };
    }
  } catch (err) {
    logger.error(err, "failed to query message");
    return { error: "failed to query message" };
  }
};
export const getAllLobbys = (): Result<Lobby[]> => {
  try {
    const result = sqliteDB
      .prepare(`SELECT id, name, password FROM ${Table.lobby};`)
      .all() as Lobby[];
    result.forEach((lobby) => {
      lobbys.set(lobby.name, lobby);
    });
    return { data: result };
  } catch (error) {
    logger.error(error, "ei õnnestunud lobbyd saada");
    return { error: "ei õnnestunud lobbyd saada." };
  }
};
export const readSession = (sessionId: string): Result<SessionCookie> => {
  try {
    logger.info("pärin küpsiseid");
    const result = sqliteDB
      .prepare(`SELECT * FROM ${Table.sessionCookie} WHERE id = ?;`)
      .get(sessionId) as SessionCookie;
    if (!result) {
      logger.info("pärin küpsist ei eksisteeri");
      return { error: "ei eksisteeri" };
    }

    return { data: result };
  } catch (err) {
    logger.error(err, "ei õnnestnud su küpsiseid lakkuda");
    return { error: "ei õnnestnud su küpsiseid lakkuda" };
  }
};
export const getUserById = (userId: string): Result<User> => {
  try {
    logger.info("pärin inimesi");
    const result = sqliteDB
      .prepare(
        `SELECT id, username, nation, profile_pic_id FROM ${Table.user} WHERE id = ?;`
      )
      .get(userId) as {
      id: string;
      username: string;
      nation: string;
      profile_pic_id: string;
    };
    if (!result) {
      logger.info("quering users failed");
      return { error: "Midagi läks väga valesti" };
    }

    return {
      data: {
        id: result.id,
        username: result.username,
        nation: result.nation,
        profilePicId: result.profile_pic_id,
      },
    };
  } catch (err) {
    logger.error(
      err,
      "ei õnnestnud kasutajat info leia andembaasist, skill issue"
    );
    return {
      error: "ei õnnestnud kasutajat info leia andembaasist, skill issue",
    };
  }
};
export const getUserFromToken = (sessionId: string): Result<User> => {
  try {
    logger.info("pärin küpsiseid");
    const result = sqliteDB
      .prepare(
        `SELECT id, username, nation, profile_pic_id from ${Table.user} where id in (SELECT userId FROM ${Table.sessionCookie} WHERE id = ?);`
      )
      .all(sessionId) as {
      id: string;
      username: string;
      nation: string;
      profile_pic_id: string;
    }[];
    if (!result || result.length < 1 || result.length > 2) {
      logger.info(result, "getUserFromToken failed");
      return { error: "Midagi läks väga valesti" };
    }

    return {
      data: {
        id: result[0].id,
        nation: result[0].nation,
        username: result[0].username,
        profilePicId: result[0].profile_pic_id,
      },
    };
  } catch (err) {
    logger.error(err, "ei õnnestnud su info leia andembaasist, skill issue");
    return { error: "ei õnnestnud su info leia andembaasist, skill issue" };
  }
};
export const doesLobbyHaveAuth = (lobbyId: string): boolean => {
  logger.info(lobbys, "lobbyd");
  if (lobbys.get(lobbyId)) {
    if (
      !lobbys.get(lobbyId)?.password ||
      lobbys.get(lobbyId)?.password.length == 0
    ) {
      return false;
    } else {
      return true;
    }
  }
  const lobby = getLobby(lobbyId);
  logger.info(lobby, "fetched lobby");
  if (!lobby) {
    return true;
  }
  lobbys.set(lobby.id, lobby);
  if (lobby.password && lobby.password.length != 0) {
    return true;
  } else {
    return false;
  }
};
export const getLobby = (lobbyId: string): Lobby | null => {
  try {
    const result = sqliteDB
      .prepare(`SELECT * from ${Table.lobby} where id = ?;`)
      .get(lobbyId) as Lobby;
    logger.info(result, "andmebaasi lobby päring");
    return result;
  } catch (error) {
    logger.error(error, "error in fetching lobby");
    return null;
  }
};
export const checkLobbyAccess = (
  userId: string,
  lobbyId: string
): Result<void> => {
  try {
    logger.info("kontrollin, kas lobbyga saab liituda");
    if (!doesLobbyHaveAuth(lobbyId)) {
      return {};
    }
    const result = sqliteDB
      .prepare(`SELECT 1 from ${Table.lobbyToUser} where userId = ? AND lobbyId = ?;`)
      .all(userId, lobbyId) as number[];

    if (!result || result.length <= 0) {
      logger.info(result, "checking lobby access failed");
      return { error: "Ei ole luba lobbysse" };
    }

    return {};
  } catch (err) {
    logger.error(err, "midagi läks väga valesti");
    return { error: "midagi läks väga valesti" };
  }
};
