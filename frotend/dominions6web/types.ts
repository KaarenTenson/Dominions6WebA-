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
export type WsMessage<T> = {
    lobbyId?: string,
    data: WsData<T>
};
export type WsDataType = "message"

export type WsData<T> = {
    type: WsDataType,
    data: T
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