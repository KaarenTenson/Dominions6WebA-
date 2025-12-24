import type { IncomingMessage } from "http";
import type { Logger } from "pino";
export type Message = {
    id: string;
    text: string;
    userId?: string;
    lobbyId?: string;
    createdAt: number;
};
export type WsMessage<T> = {
    lobbyId?: string,
    data: WsData<T>
};
export type WsDataType = "message"

export type WsData<T> = {
    type: WsDataType,
    data: T
}
export type Age = "EA" | "MA" | "LA";
export type Nation = {
    id: number,
    name: string,
    age: Age
}
export type Lobby = {
    id: string;
    name: string;
    password: string;
    createdAt?: number;
};
export type HttpLoggerOptions = {
    logger?: Logger;
    customLogLevel?: (res?: IncomingMessage & {
        statusCode?: number;
    }, err?: unknown) => "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
};
export type User = {
    id?: string;
    username: string;
    nation?: string;
    password?: string;
    profilePicId?: string;
    token?: string;
    created_at?: number;
};

export type QuestUser = {
    id?: string;
    username: string;
    nation?: string;
    profile_pic_id?: string;
    token?: string;
    created_at?: number;
};

export type SessionCookie = {
    sessionId: string,
    userId: string,
    expiresAt: number
}

export type Result<T> = {
    error?: string;
    data?: T;
}
export type Blob = {
    mime_type: string,
    data:any,
}
export type Error = {
  status: string,
  msg: string,
}