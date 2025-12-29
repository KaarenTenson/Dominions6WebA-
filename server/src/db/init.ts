// sqlite.ts
import Database from "better-sqlite3";
import type { Database as SqliteDatabase } from "better-sqlite3";
import { getNations } from "../../dominions6/dominions6-data";
import { Nation } from "../../types";
import {writeNations} from "./db-dom6.writers.js"
export const dom6DB: SqliteDatabase = new Database("dom6.sqlite");
dom6DB.exec(`
  CREATE TABLE IF NOT EXISTS NATION (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age TEXT NOT NULL
  );
`)
writeNations(await getNations());
export const blobDB: SqliteDatabase = new Database("blob.sqlite");
blobDB.exec(`
  CREATE TABLE IF NOT EXISTS FILE (
    id TEXT PRIMARY KEY,
    data BLOB NOT NULL,
    mime_type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

export const sqliteDB: SqliteDatabase = new Database("data.sqlite");
sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    lobbyId TEXT,
    userId TEXT NOT NULL,
    blobId Text,
    fileName Text,
    mimteType Text,
    fileSize INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (lobbyId) REFERENCES lobby(id) ON DELETE CASCADE
  )
`);
//sqliteDB.exec(`DROP TABLE lobby;`);
sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS lobby (
    id TEXT PRIMARY KEY,
    name TEXT,
    password TEXT,
    created_at INTEGER NOT NULL
  )
`);

sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS lobbyToUser (
    lobbyId TEXT NOT NULL,
    userId TEXT NOT NULL,
    created_at INTEGER NOT NULL,
   PRIMARY KEY (lobbyId, userId),
    FOREIGN KEY (lobbyId) REFERENCES lobby(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES USER(id) ON DELETE CASCADE
  )
`);
sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS SESSION_COOKIE (
    id TEXT PRIMARY KEY,
    userId TEXT,
    expiresAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES USER(id) ON DELETE CASCADE

  )
`);

sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS USER (
    id TEXT PRIMARY KEY,
    username TEXT unique,
    nation TEXT,
    password TEXT,
    profile_pic_id TEXT,
    created_at INTEGER NOT NULL
  )
`);


