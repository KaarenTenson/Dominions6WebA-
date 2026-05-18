"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapMessage = void 0;
const mapMessage = (dbResult) => {
    const r = dbResult;
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
exports.mapMessage = mapMessage;
