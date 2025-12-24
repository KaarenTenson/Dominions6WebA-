import { useEffect, useState } from "react";
import type { Lobby } from "../../types";

type Props = {
  lobby: Lobby;
  onSubmit: (lobby: Lobby) => Promise<boolean>;
  onCancel: () => void;
};

export function LobbyPasswordPrompt({
  lobby,
  onSubmit,
  onCancel,
}: Props) {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<boolean| null>(null);
  useEffect(() => {
    setSuccess(true);
  }, [lobby.id.valueOf()])
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Enter password</h3>
        <p style={{ opacity: 0.9, color:"black" }}>
          Lobby: <strong>{lobby.name}</strong>
        </p>
        {!success && <p style={{ opacity: 0.9, color:"red" }}>
          <strong>Ei õnnestnud sul sisse logida.</strong>
        </p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoFocus
        />

        <div style={buttonRow}>
          <button onClick={onCancel} style={cancelButton}>
            Cancel
          </button>
          <button
            onClick={async() => {
                lobby.password = password;
                const success =await onSubmit(lobby);
                if (success) {
                    onCancel();
                    setSuccess(true);
                } {
                  setSuccess(false);
                }

            }}
            disabled={!password}
            style={confirmButton}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  width: 320,
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};

const inputStyle = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const buttonRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
};

const cancelButton = {
  padding: "6px 12px",
};

const confirmButton = {
  padding: "6px 12px",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: 6,
};
