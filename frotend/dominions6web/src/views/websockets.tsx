import { useEffect, useRef, useState, type RefObject } from "react";
import type { Message, WsMessage } from "../../types";
import { useMessageStore } from "../messages-store";
import { useUserStore } from "../user-store";
import LobbyList from "../components/lobby-selection";

function WebSocketComp() {
  const socketRef: RefObject<WebSocket | null> = useRef(null);
  const {
    messages,
    addMessage,
    getAllMessages,
    currentLobby,
    getAllMessagesFromLobby,
  } = useMessageStore();
  const { getOtherUser, user, getUser } = useUserStore();
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    getUser();
    const url = new URL("ws://localhost:3000/ws");
    if (currentLobby) {
      url.searchParams.append("lobbyId", currentLobby);
    }
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = async () => {
      console.log("WebSocket connected");
      if (currentLobby) {
        await getAllMessagesFromLobby(currentLobby);
      } else {
        await getAllMessages();
      }
      setConnected(true);
    };

    socketRef.current.onmessage = async (event: MessageEvent<string>) => {
      const msg: Message = JSON.parse(event.data);
      const user = await getOtherUser(msg.userId!!);
      if (user) {
        msg.user = user;
      }
      addMessage(msg);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [addMessage, currentLobby ? currentLobby.valueOf() : null]);

  const sendMessage = () => {
    if (!socketRef.current || !connected || !input.trim()) return;

    const msg: WsMessage<Message> = {
      data: {
        type: "message",
        data: {
          id: "",
          lobbyId: currentLobby,
          text: input,
          createdAt: 0,
        },
      },
    };

    socketRef.current.send(JSON.stringify(msg));
    setInput("");
  };

  return (
    <div style={styles.rowContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span>Status:</span>
          <span style={{ color: connected ? "green" : "red" }}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <ul style={styles.messages}>
          {messages.map((msg, i) => (
            <li
              key={i}
              style={{
                ...styles.messageBase,
                ...(msg.userId === user.id
                  ? styles.myMessage
                  : styles.otherMessage),
              }}
            >
              <div style={styles.username}>{msg.user?.username}</div>
              <div>{msg.text}</div>
            </li>
          ))}
        </ul>

        <div style={styles.inputRow}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={styles.input}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            style={styles.button}
          >
            Send
          </button>
        </div>
      </div>
      <div style={styles.container}>
        <LobbyList />
      </div>
    </div>
  );
}
const styles = {
  rowContainer: {
    maxWidth: 1000,

    margin: "10px auto",
    padding: 5,
    display: "flex",
    flexDirection: "row" as const,
    gap: 5,
  },
  container: {
    flex: 1,
    maxWidth: 500,
    margin: "40px auto",
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 500,
  },
  messages: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flex: 1,
    overflowY: "auto" as const,
    border: "1px solid #eee",
    borderRadius: 4,
  },
  messageBase: {
    maxWidth: "75%",
    padding: "8px 12px",
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.4,
    wordBreak: "break-word" as const,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
    color: "white",
    borderBottomRightRadius: 4,
  },

  message: {
    padding: "6px 8px",
    borderBottom: "1px solid #eee",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    color: "#111",
    borderBottomLeftRadius: 4,
  },

  username: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  inputRow: {
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 8,
  },
  button: {
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default WebSocketComp;
