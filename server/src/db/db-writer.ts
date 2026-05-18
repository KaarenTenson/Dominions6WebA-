import { error } from "node:console";
import type {
  Lobby,
  Message,
  QuestUser,
  Result,
  SessionCookie,
  User,
} from "../types.js";
import { hashPassword } from "../crypto/crypto.js";
import { logger } from "../logger/logger.js";
import { sqliteDB } from "./init.js";
import { Table } from "./tables.js";

export const writeMessage = (msg: Message) => {
  const containsFile = !!msg.fileMetaData;
  try {
    if (containsFile) {
      sqliteDB
        .prepare(`INSERT INTO ${Table.message} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(
          crypto.randomUUID(),
          msg.text ? msg.text : "",
          msg.lobbyId,
          msg.userId,
          msg.fileMetaData?.blobId,
          msg.fileMetaData?.fileName,
          msg.fileMetaData?.mimeType,
          msg.fileMetaData?.fileSize,
          Date.now()
        );
    } else {
      sqliteDB
        .prepare(`INSERT INTO ${Table.message} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(
          crypto.randomUUID(),
          msg.text,
          msg.lobbyId,
          msg.userId,
          null,
          null,
          null,
          null,
          Date.now()
        );
    }
    logger.info("successfully wrote message to db");
  } catch (err) {
    logger.error(err, "failed to write message");
  }
};

export const addUserToLobby = (
  userId: string,
  lobbyId: string
): Result<void> => {
  logger.info(lobbyId + " adding user to the the lobby" + userId);

  try {
    sqliteDB
      .prepare(`INSERT INTO ${Table.lobbyToUser} VALUES (?, ?, ?);`)
      .run(lobbyId, userId, Date.now());
    return {};
  } catch (error) {
    logger.error(error, "ei õnnestunud lobbysse lisada kasutajat");
    return { error: "ei õnentnud sind lobbysse lisada" };
  }
};
export const writeLobby = (lobby: Lobby): Result<void> => {
  logger.info("writing to db");
  lobby.id = crypto.randomUUID();
  try {
    sqliteDB
      .prepare(`INSERT INTO ${Table.lobby} VALUES (?, ?, ?, ?)`)
      .run(
        lobby.id,
        lobby.name,
        lobby.password ? hashPassword(lobby.password) : null,
        Date.now()
      );

    logger.info("successfully wrote message to db");
    return {};
  } catch (err) {
    logger.error(err, "failed to write message");
    return { error: "failed to write lobby to database" };
  }
};

export const writeQuest = (user: User): Result<void> => {
  logger.info("writing to db");
  try {
    const res = sqliteDB
      .prepare(`INSERT INTO ${Table.user} VALUES (?, ?, ?, ?, ?, ?)`)
      .run(user.id, user.username, user.nation, null, null, Date.now());

    logger.info(res, "successfully wrote user to db");
    return {};
  } catch (err) {
    logger.error(err, "failed to write user");
    return { error: "failed to save user to database" };
  }
};
export const writeUser = (user: User): Result<void> => {
  logger.info("writing to db");
  try {
    if (!user.password) {
      return { error: "ei ole pass lollike" };
    }

    const res = sqliteDB
      .prepare(`INSERT INTO ${Table.user} VALUES (?, ?, ?, ?, ?, ?)`)
      .run(
        user.id,
        user.username,
        user.nation,
        hashPassword(user.password),
        null,
        Date.now()
      );

    logger.info(res, "successfully wrote user to db");
    return {};
  } catch (err) {
    logger.error(err, "failed to write user");
    return { error: "failed to save user to database" };
  }
};

export const updateUserProfilePic = (
  userId: string,
  picId: string
): Result<void> => {
  try {
    const res = sqliteDB
      .prepare(`UPDATE ${Table.user} set profile_pic_id = ? where id = ?;`)
      .run(picId, userId);
    logger.info(res, "profiili pildi uuendamine");
    return {};
  } catch (error) {
    return { error: "ei õnnestunud salvestada" };
  }
};
export const deleteMessage = (msgId: string): Result<void> => {
  logger.info("deleting a message");
  try {
     const res = sqliteDB
      .prepare(`DELETE FROM ${Table.message} where id = ?`)
      .run(msgId);

    return {};
  } catch (error) {
    logger.error(error, "sõnumi kustutamine ebaõennestus");
    return {error: "sõnumi kustutamine ebaõennestus"};
  }
}
export const writeSession = (cookie: SessionCookie): Result<void> => {
  logger.info("writing cookie to db");
  console.log(cookie);
  try {
    const res = sqliteDB
      .prepare(`INSERT INTO ${Table.sessionCookie} VALUES (?, ?, ?)`)
      .run(cookie.sessionId, cookie.userId, cookie.expiresAt);

    return {};
  } catch (error) {
    logger.error(error, "something went wrong with writing cookie");
    return { error: "midagi küpsistega läks valesti" };
  }
};
export const writeQuestUser = (user: QuestUser): Result<void> => {
  logger.info("writing to db");
  try {
    const res = sqliteDB
      .prepare(`INSERT INTO ${Table.user} VALUES (?, ?, ?, ?, ?, ?)`)
      .run(
        crypto.randomUUID(),
        user.username,
        user.nation,
        null,
        null,
        Date.now()
      );

    logger.info(res, "successfully wrote user to db");
    return {};
  } catch (err) {
    logger.error(err, "failed to write user");
    return { error: "failed to save user to database" };
  }
};
