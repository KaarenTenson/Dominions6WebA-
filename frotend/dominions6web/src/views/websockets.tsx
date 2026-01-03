import { useEffect, useRef, useState, type RefObject } from "react";
import type { Message, MessageDelete, WsMessage } from "../../types";
import { useMessageStore } from "../messages-store";
import { useUserStore } from "../user-store";
import LobbyList from "../components/lobby-selection";
import { data, useNavigate } from "react-router-dom";
import { useLobbyStore } from "../lobbyStore";
import { SERVER_ENDPOINT, WS_SERVER_ENDPOINT } from "../constants";
import { ChatInput } from "../components/chat-input";
import { MessageAttachement } from "../components/chat-message";
import { globalStyle } from "../global-styles";
import { AdminLogin } from "../components/admin-login";
import { checkAdminAccess } from "../auth";

function WebSocketComp() {
  const socketRef: RefObject<WebSocket | null> = useRef(null);
  const {
    messages,
    addMessage,
    getAllMessages,
    currentLobby,
    removeMessage,
    getAllMessagesFromLobby,
  } = useMessageStore();
  const { lobbys } = useLobbyStore();
  const { getOtherUser, user, getUser } = useUserStore();
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
    const url = new URL(WS_SERVER_ENDPOINT);
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
      const msg: WsMessage<any> = JSON.parse(event.data);
      if (msg.type == "message") {
        const user = await getOtherUser(msg.data.userId!!);
        if (user) {
          msg.data.user = user;
        }
        addMessage(msg.data);
      } else if (msg.type == "delete") {
        const data = msg.data as MessageDelete;
        console.log(data, "deleting message");
        removeMessage(data.messageId);
      }
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
  }, [currentLobby ? currentLobby.valueOf() : null]);
  const deleteMessage = async (msg: Message) => {
    if (await checkAdminAccess()) {
      const res = await fetch(
        `${SERVER_ENDPOINT}/admin/delete_message/${msg.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const deleteSignal: WsMessage<MessageDelete> = {
        data: { messageId: msg.id },
        lobbyId: currentLobby,
        type: "delete",
      };
      socketRef.current?.send(JSON.stringify(deleteSignal));
    } else {
      setMessageToDelete(msg);
      setShowAdminLogin(true);
    }
  };
  return (
    <>
      <div style={globalStyle.page}>
        <div style={styles.chatLayout}>
          {/* CHAT */}
          <div style={globalStyle.card}>
            <div style={styles.chatHeader}>
              <div>
                <strong>Chat</strong>
                {currentLobby && (
                  <span style={styles.lobbyName}>
                    {" "}
                    · Lobby{" "}
                    {lobbys.find((l) => l.id == currentLobby)?.name ||
                      currentLobby}
                  </span>
                )}
              </div>
              <span
                style={{
                  ...styles.status,
                  color: connected ? "#22c55e" : "#ef4444",
                }}
              >
                {connected ? "● Connected" : "● Disconnected"}
              </span>
            </div>

            <ul style={styles.messages}>
              {messages.map((msg, i) => {
                const mine = msg.userId === user.id;
                console.log(msg.user);

                return (
                  <li
                    key={i}
                    style={{
                      ...styles.messageRow,
                      justifyContent: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    {!mine && (
                      <img
                        src={
                          msg.user?.profilePicId
                            ? `${SERVER_ENDPOINT}/blob/${msg.user.profilePicId}`
                            : "/default-avatar.png"
                        }
                        onClick={() => {
                          navigate("/");
                        }}
                        alt="pfp"
                        style={globalStyle.avatar}
                      />
                    )}

                    <div
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: mine ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          ...styles.message,
                          ...(mine ? styles.myMessage : styles.otherMessage),
                        }}
                      >
                        {!mine && (
                          <div style={styles.username}>
                            {`${msg.user ? msg.user.username : ""} : ${
                              msg.user?.nation
                            }`}
                          </div>
                        )}

                        {msg.text && msg.text.length > 0 && (
                          <div>{msg.text}</div>
                        )}
                        {msg.fileMetaData && <MessageAttachement msg={msg} />}
                      </div>

                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteMessage(msg)}
                        title="Delete message"
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <ChatInput
              ws={socketRef.current}
              lobbyId={currentLobby}
            ></ChatInput>
          </div>

          {/* SIDEBAR */}
          <div style={styles.sidebar}>
            <LobbyList />
          </div>
        </div>
      </div>
      {showAdminLogin && (
        <AdminLogin
          close={async () => {
            setShowAdminLogin(false);
            if ((await checkAdminAccess()) && messageToDelete) {
              deleteMessage(messageToDelete);
            }
          }}
        />
      )}
    </>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  chatLayout: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: 16,
  },

  chatHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },

  lobbyName: {
    color: "#6b7280",
    fontWeight: 400,
  },

  status: {
    fontSize: 12,
    fontWeight: 500,
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
  },

  messages: {
    flex: 1,
    padding: 16,
    margin: 0,
    listStyle: "none",
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },

  message: {
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.4,
  },

  myMessage: {
    background: "#4f46e5",
    color: "white",
    borderBottomRightRadius: 4,
  },

  otherMessage: {
    background: "#e5e7eb",
    color: "#111",
    borderBottomLeftRadius: 4,
  },

  username: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 2,
  },

  inputRow: {
    borderTop: "1px solid #e5e7eb",
    padding: 12,
    display: "flex",
    gap: 8,
  },
  sidebar: {
    background: "white",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    padding: 12,
    height: "80vh",
    overflowY: "auto" as const,
  },
  messageWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  deleteButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    opacity: 0.4,
    padding: 4,
  },
};

export default WebSocketComp;
