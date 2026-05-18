import { Message } from "../../types.js";
export const mapMessage = (dbResult: any): Message => {
  const r: {
    id: string;
    text: string;
    lobbyId: string;
    userId: string;
    blobId: string;
    mimeType: string;
    fileSize: number;
    fileName: string;
    created_at: number;
  } = dbResult;
  return {
    id: r.id,
    text: r.text,
    lobbyId: r.lobbyId,
    userId: r.userId,
    createdAt: r.created_at,
    fileMetaData: r.blobId
      ? {
          blobId: r.blobId,
          fileName: r.fileName,
          fileSize: r.fileSize,
          mimeType: r.mimeType,
        }
      : undefined,
  };
};
