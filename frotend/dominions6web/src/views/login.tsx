import { useState } from "react";
import { useUserStore } from "../user-store";
import { useNavigate } from "react-router-dom";
import { globalStyle } from "../global-styles";
import { SERVER_ENDPOINT } from "../constants";
export const LoginPage = () => {
  const { setUserName, } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${SERVER_ENDPOINT}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // needed for HttpOnly cookie
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Update Zustand if needed
      setUserName(username);

      // Redirect to messages page
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={globalStyle.page}>
      <form onSubmit={handleSubmit} style={globalStyle.card}>
        <h2 style={globalStyle.title}>Login</h2>

        {error && <div style={globalStyle.error}>{error}</div>}

        <label style={globalStyle.label}>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            style={globalStyle.input}
          />
        </label>
    

       <label style={globalStyle.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={globalStyle.input}
          />
        </label>

        <button type="submit" style={globalStyle.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
