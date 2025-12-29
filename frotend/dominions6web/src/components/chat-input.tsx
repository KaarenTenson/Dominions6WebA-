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

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const meta = await uploadFile(file);
      setFileMeta(meta);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
        data: { data: msg },
        lobbyId,
      })
    );

    setText("");
    setFileMeta(null);
  };
  
  return (
    <div className="chat-input">
      {fileMeta && (
        <div className="attachment-preview">
          📎 {fileMeta.fileName}
          <button onClick={() => setFileMeta(null)}>✕</button>
        </div>
      )}

      <input
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
        onChange={handleFileSelect}
      />

      <button onClick={() => fileRef.current?.click()}>
        📎
      </button>

      <button
        onClick={sendMessage}
        disabled={uploading || (!text && !fileMeta)}
      >
        Send
      </button>
    </div>
  );
}
