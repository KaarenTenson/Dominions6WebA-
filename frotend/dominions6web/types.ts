export type Message = {
  id: string,
  text?: string,
  fileMetaData?: FileMetaData,  
  lobbyId?: string,
  userId?: string,
  user?: User,
  createdAt: number
}
export type FileMetaData = {
    blobId: string;
    mimeType: string;
    fileSize: number;
    fileName: string;
}
export type User = {
    id?: string;
    username: string;
    nation: string;
    profilePicId?: string;
    created_at?: number;
};
export type Lobby = {
    id: string;
    name: string;
    password?: string;
    createdAt?: number;
};
export type MapSize = {
    width: number,
    height: number
}
export type Thrones = {
    level1: number,
    level2: number,
    level3: number
}
export type Dominions6Cofing = {
    port: string,
    mapSize: MapSize,
    age: Age,
    thrones: Thrones,
    name: string,
}
export type WsMessage<T> = {
    lobbyId?: string,
    data: T,
    type: WsDataType,
};
export type DraftEventType = "confirm"|"next_pack"|"ready"|"reset"|"start"|"user_data"|"ready_states"|"sync"|"confirm_event"|"card_selection";
export type WsDataType = "message" | "delete" | DraftEventType;
export type UserReadyState = {
  ready: boolean;
  userId: string;
}
export type UserConfirmationState = {
  confirmed: boolean;
  userId: string;
}
export type DraftCardType = "unit"|"commander"|"magic_site"|"pretender";
export type DraftCard<T> = {
    userId?:string;
    type :DraftCardType;
    id:string;
    data: T;
}
export type SyncData = {
  currentPack: DraftCard<any>[];
  confirmed: boolean;
  ready: boolean;
  selectedCards: DraftCard<any>[];
}

export type MessageDelete = {
    messageId: string
}

export type Success = {
    status: "ok"
}
export type Error = {
    error: string
}
export type Age = "EA" | "MA" | "LA";
export type Nation = {
    id: number,
    name: string,
    age: Age
}