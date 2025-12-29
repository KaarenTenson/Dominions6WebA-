import { useEffect, useState } from "react";
import type { Nation, User } from "../../types";
import { useUserStore } from "../user-store";
import { useNavigate } from "react-router-dom";
import { ToLoginButton } from "../components/to-login-button";
import { globalStyle } from "../global-styles";
import { SERVER_ENDPOINT } from "../constants";

export const CreateUserPage = () => {
  const { setNation, setUserName, user, getDom6Nations } = useUserStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kasPass, setKasPass] = useState(true);
  const navigate = useNavigate();
  const [nations, setNations] = useState<Nation[]>([]);
  useEffect(() => {
    const getNations = async () => {
      setNations(await getDom6Nations());
    };
    getNations();
  }, []);

  useEffect(() => {
    const hasCookie = document.cookie.includes("session=");
    if (hasCookie) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  const nationLabel = (n: Nation) => `${n.name} (${n.age})`;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !user.username.trim() ||
      !user.nation.trim() ||
      (!password.trim() && kasPass)
    ) {
      setError("All fields are required");
      return;
    }
    console.log(user.nation);
    if (
     !nations.find((n) => (`${n.name} (${n.age})` === user.nation))
    ) {
      setError("Vale nation");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_ENDPOINT}/${kasPass ? "register" : "register_quest"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // IMPORTANT for cookies
          body: JSON.stringify({
            username: user.username,
            nation: user.nation,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

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
        <h2 style={globalStyle.title}>Create User</h2>

        {error && <div style={globalStyle.error}>{error}</div>}

        <label style={globalStyle.label}>
          Username
          <input
            type="text"
            value={user.username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            style={globalStyle.input}
          />
        </label>

        <label style={globalStyle.label}>
          Nation
          <input
            list="nation-list"
            value={user.nation}
            onChange={(e) => {
              const value = e.target.value;

              // only allow nations that exist

              setNation(value);
            }}
            placeholder="Select or type nation"
            style={globalStyle.input}
          />
          <datalist id="nation-list">
            {nations.map((nation) => (
              <option
                key={nation.id ?? nation.name}
                value={nationLabel(nation)}
              />
            ))}
          </datalist>
        </label>
        <label style={{ color: "black" }}>
          Kass Pass?:
          <input
            type="checkbox"
            name="kas_pass"
            checked={kasPass}
            onChange={() => setKasPass(!kasPass)}
          />
        </label>
        {kasPass && (
          <label style={globalStyle.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={globalStyle.input}
            />
          </label>
        )}

        <button type="submit" style={globalStyle.button} disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
        <ToLoginButton />
      </form>
    </div>
  );
};

