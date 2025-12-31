import { useState } from "react";
import { SERVER_ENDPOINT } from "../constants";
type AdminLoginProps = {
  close: () => void;
};
export function AdminLogin({ close }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const login = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${SERVER_ENDPOINT}/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      close();
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Admin Login</h3>
        <button onClick={close} style={styles.closeButton}>
          ✕
        </button>
      </div>

      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={login}
        disabled={loading || password.length === 0}
        style={{
          ...styles.button,
          ...(loading ? styles.disabled : {}),
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  card: {
    maxWidth: 320,
    margin: "40px auto",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #000000ff",
    background: "black",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    lineHeight: 1,
    opacity: 0.6,
  },

  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
  },

  input: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },

  button: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
  },

  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  error: {
    color: "#ef4444",
    fontSize: 13,
  },

  success: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: 500,
  },
};
