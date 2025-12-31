import type { IncomingMessage } from "http";
import type { Logger } from "pino";
export type Message = {
    id: string;
    text?: string;
    fileMetaData?: FileMetaData,  
    userId?: string;
    lobbyId?: string;
    createdAt: number;
};
export type FileMetaData = {
    blobId: string;
    mimeType: string;
    fileSize: number;
    fileName: string;
}
export type WsMessage<T> = {
    lobbyId?: string,
    data: T,
    type: WsDataType,
};
export type WsDataType = "message"|"delete"

export type MessageDelete = {
    messageId: string
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
    profilePicId?: string;
    token?: string;
    created_at?: number;
};

export type SessionCookie = {
    sessionId: string,
    userId: string,
    expiresAt: number,
    isAdmin?:boolean
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