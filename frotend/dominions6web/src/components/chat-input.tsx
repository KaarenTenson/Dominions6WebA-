import { useRef, useState } from "react";
import type { FileMetaData, Message } from "../../types";
import { SERVER_ENDPOINT } from "../constants";

type Props = {
  ws: WebSocket | null;
  lobbyId?: string;
};

export function ChatInput({ ws, lobbyId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileMeta, setFileMeta] = useState<FileMetaData | null>(null);
  const [uploading, setUploading] = useState(false);
  if (!ws) {
    return;
  }
  const uploadFile = async (file: File): Promise<FileMetaData> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${SERVER_ENDPOINT}/blob/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  };

  const sendMessage = () => {
    if (!text && !fileMeta) return;
    if (ws.readyState !== WebSocket.OPEN) return;

    const msg: Message = {
      id: "",
      text: text || undefined,
      fileMetaData: fileMeta || undefined,
      lobbyId,
      createdAt: Date.now(),
    };

    ws.send(
      JSON.stringify({
        data: msg,
        lobbyId,
        type: "message",
      })
    );

    setText("");
    setFileMeta(null);
  };

  return (
    <div style={styles.wrapper}>
      {fileMeta && (
        <div style={styles.attachment}>
          📎 {fileMeta.fileName}
          <button style={styles.remove} onClick={() => setFileMeta(null)}>
            ✕
          </button>
        </div>
      )}

      <div style={styles.row}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            uploadFile(file)
              .then(setFileMeta)
              .finally(() => {
                setUploading(false);
                if (fileRef.current) fileRef.current.value = "";
              });
          }}
        />

        <button
          style={styles.iconButton}
          onClick={() => fileRef.current?.click()}
        >
          📎
        </button>

        <button
          style={{
            ...styles.sendButton,
            ...(uploading || (!text && !fileMeta) ? styles.sendDisabled : {}),
          }}
          onClick={sendMessage}
          disabled={uploading || (!text && !fileMeta)}
        >
          Send
        </button>
      </div>
    </div>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    borderTop: "1px solid #e5e7eb",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
  },

  iconButton: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: "50%",
    padding: "6px 8px",
    cursor: "pointer",
    fontSize: 16,
  },

  sendButton: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: 14,
    fontSize: 14,
    cursor: "pointer",
  },

  sendDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  attachment: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#e5e7eb",
    padding: "6px 10px",
    borderRadius: 14,
    fontSize: 13,
    width: "fit-content",
  },

  remove: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
  },
};
