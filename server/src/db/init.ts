// sqlite.ts
import Database from "better-sqlite3";
import type { Database as SqliteDatabase } from "better-sqlite3";
import { getNations } from "../dominions6/dominions6-data.js";
import { Nation } from "../types.js";
import {writeNations} from "./db-dom6.writers.js"
import {Table} from "./tables.js";
import { table } from "node:console";
export const dom6DB: SqliteDatabase = new Database("dom6.sqlite");
dom6DB.exec(`
  CREATE TABLE IF NOT EXISTS ${Table.nation} (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age TEXT NOT NULL
  );
`)

dom6DB.exec(`CREATE TABLE IF NOT EXISTS ${Table.log} (
  id TEXT PRIMARY KEY,
  msg TEXT NOT NULL,
  type TEXT,
  created_at INTEGER NOT NULL);`)
writeNations(await getNations());
export const blobDB: SqliteDatabase = new Database("blob.sqlite");
blobDB.exec(`
  CREATE TABLE IF NOT EXISTS ${Table.file} (
    id TEXT PRIMARY KEY,
    data BLOB NOT NULL,
    mime_type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

export const sqliteDB: SqliteDatabase = new Database("data.sqlite");
//sqliteDB.exec(`DROP TABLE messages;`);
sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS ${Table.message} (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    lobbyId TEXT,
    userId TEXT NOT NULL,
    blobId Text,
    fileName Text,
    mimeType Text,
    fileSize INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (lobbyId) REFERENCES ${Table.lobby}(id) ON DELETE CASCADE
  )
`);
//sqliteDB.exec(`DROP TABLE lobby;`);
sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS ${Table.lobby} (
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
    FOREIGN KEY (lobbyId) REFERENCES ${Table.lobby}(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES ${Table.user}(id) ON DELETE CASCADE
  )
`);
sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS ${Table.sessionCookie} (
    id TEXT PRIMARY KEY,
    userId TEXT,
    expiresAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES ${Table.user}(id) ON DELETE CASCADE

  )
`);

sqliteDB.exec(`
  CREATE TABLE IF NOT EXISTS ${Table.user} (
    id TEXT PRIMARY KEY,
    username TEXT unique,
    nation TEXT,
    password TEXT,
    profile_pic_id TEXT,
    created_at INTEGER NOT NULL
  )
`);


