import { useEffect, useState } from "react";
import { useLobbyStore } from "../lobbyStore";
import type { Lobby } from "../../types";
import { globalStyle } from "../global-styles";
import { useMessageStore } from "../messages-store";
import { LobbyPasswordPrompt } from "./lobby-login";

export default function LobbyList() {
  const { lobbys, getAllLobbys, addLobby, checkLobbyAcces, loginToLobby } =
    useLobbyStore();
  const { setLobby } = useMessageStore();
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [passwordPromt, setPasswordPrompt] = useState(false);
  const [lobbyToLogin, setLobbyToLogin] = useState<null | Lobby>(null);

  useEffect(() => {
    getAllLobbys();
  }, [getAllLobbys]);
  const accessLobby = async (lobbyId: string) => {
    const canAccess = await checkLobbyAcces(lobbyId);
    if (canAccess) {
      setLobby(lobbyId);
    } else {
      setPasswordPrompt(true);
      console.log(lobbys);
      const lobby = lobbys.find((l) => l.id == lobbyId);
      console.log(lobby);
      setLobbyToLogin(lobby ? lobby : null);
    }
  };
  const login = async (lobby: Lobby): Promise<boolean> => {
    if (!lobby.password) {
      return false;
    }
    setLobby(lobby.id);
    return await loginToLobby(lobby);
  };
  const handleCreateLobby = async () => {
    if (name.length == 0) {
      alert("nimi ei tohi olla tühi");
      return;
    }
    setCreating(true);

    const lobby: Lobby = {
      id: crypto.randomUUID(),
      name: name,
      password: password || undefined,
      createdAt: Date.now(),
    };

    await addLobby(lobby);

    setPassword("");
    setCreating(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Available Lobbies</h2>

      {/* CREATE LOBBY */}
      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 6,
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />

        <button
          onClick={handleCreateLobby}
          disabled={creating}
          style={{ width: "100%", padding: 8 }}
        >
          {creating ? "Creating..." : "Create Lobby"}
        </button>
      </div>

      {/* LOBBY LIST */}
      {!lobbys.length ? (
        <p>No lobbies available</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          <ul style={styles.list}>
            {lobbys.map((lobby) => (
              <li key={lobby.id}>
                <button
                  onClick={() => accessLobby(lobby.id)}
                  style={styles.lobbyButton}
                >
                  <div style={styles.lobbyMain}>
                    <span style={styles.lobbyName}>{lobby.name}</span>
                    {lobby.password && <span style={styles.lock}>🔒</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </ul>
      )}
      {passwordPromt && lobbyToLogin && (
        <LobbyPasswordPrompt
          lobby={lobbyToLogin}
          onCancel={() => {
            setPasswordPrompt(false);
          }}
          onSubmit={async (lobby: Lobby) => {
            return await login(lobby);
          }}
        />
      )}
    </div>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  lobbyButton: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },

  lobbyMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  lobbyName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
  },

  lock: {
    fontSize: 14,
    opacity: 0.6,
  },
};
