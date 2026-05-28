import type { IncomingMessage } from "http";
import type { Logger } from "pino";
export type Message = {
  id: string;
  text?: string;
  fileMetaData?: FileMetaData;
  userId?: string;
  lobbyId?: string;
  createdAt: number;
};
export type FileMetaData = {
  blobId: string;
  mimeType: string;
  fileSize: number;
  fileName: string;
};
export type WsMessage<T> = {
  lobbyId?: string;
  data: T;
  type: WsDataType;
};
export type ReadyMessage = {
  userId: string;
  ready: boolean;
}
export type ResetMessage = {
  userId: string;
  reset: boolean;
}
export type DraftEventType = "confirm"|"next_pack"|"ready"|"reset"|"reset_event"|"start"|"user_data"|"ready_states"|"sync"|"confirm_event"|"card_selection"|"confirm_drafted_cards"|"end";
export type WsDataType = "message" | "delete" | DraftEventType;
export type UserReadyState = {
  ready: boolean;
  userId: string;
}
export type ResetData = {
  reset: boolean;
  userId: string;
}
export type UserConfirmationState = {
  confirmed: boolean;
  userId: string;
}
export type DraftedCardChoosingState = {
    pretenders: DraftCard<any>[],
    units: DraftCard<any>[],
    commanders: DraftCard<any>[],
    magicSites: DraftCard<any>[],
    heros: DraftCard<any>[],
    startLocation:StartLocation;
    heat: number;
}
export type StartLocation = "land"|"cave"|"water";

export type SyncData = {
  currentPack: DraftCard<any>[];
  confirmed: boolean;
  ready: boolean;
  selectedCards: DraftCard<any>[];
  cardSelection:boolean;
  commanders: DraftCard<any>[];
  units: DraftCard<any>[];
  pretenders: DraftCard<any>[];
  magicSites: DraftCard<any>[];
  heros: DraftCard<any>[];
  isEnded: boolean;
  blobId?: string;
}

export type DraftCard<T> = {
    userId?:string;
    type :"unit"|"commander"|"magic_site"|"pretender"|"hero";
    id:string;
    data: T;
}


export type MessageDelete = {
  messageId: string;
};

export type Age = "EA" | "MA" | "LA";
export type Nation = {
  id: number;
  name: string;
  age: Age;
};
export type Lobby = {
  id: string;
  name: string;
  password: string;
  createdAt?: number;
};
export type HttpLoggerOptions = {
  logger?: Logger;
  customLogLevel?: (
    res?: IncomingMessage & {
      statusCode?: number;
    },
    err?: unknown
  ) => "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
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
  sessionId: string;
  userId: string;
  expiresAt: number;
  isAdmin?: boolean;
};

export type Result<T> = {
  error?: string;
  data?: T;
};
export type Blob = {
  mime_type: string;
  data: any;
};
export type Error = {
  status: string;
  msg: string;
};

export type MapSize = {
  width: number;
  height: number;
};
export type Thrones = {
  level1: number;
  level2: number;
  level3: number;
};
export type Dominions6Cofing = {
  port: string;
  mapSize: MapSize;
  age: Age;
  thrones: Thrones;
  name: string;
};
