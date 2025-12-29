import type { Message } from "../../types";
import { SERVER_ENDPOINT } from "../constants";

const isImage = (mimeType?: string) =>
  mimeType?.startsWith("image/");

export const MessageAttachement = ({ msg }: { msg: Message }) => {
  const file = msg.fileMetaData;
  if (!file) return null;

  const url = `${SERVER_ENDPOINT}/blob/${file.blobId}`;

  return (
    <div className="message-attachment">
      {isImage(file.mimeType) ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={file.fileName}
            loading="lazy"
            style={{
              maxWidth: "240px",
              maxHeight: "240px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer">
          📎 {file.fileName}
          <small>
            {" "}
            ({Math.round(Number(file.fileSize) / 1024)} KB)
          </small>
        </a>
      )}
    </div>
  );
};
