import { useEffect, useState } from "react";
import { AdminLogin } from "../components/admin-login";
import type { Dominions6Cofing, Thrones } from "../../types";
import { SERVER_ENDPOINT } from "../constants";
import { checkAdminAccess } from "../auth";
export function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [config, setConfig] = useState<Dominions6Cofing>({
    port: "6969",
    mapSize: { width: 12, height: 12 },
    age: "MA",
    thrones: { level1: 5, level2: 2, level3: 1 },
    name: "game",
  });
  useEffect(() => {
    checkAdminAccess().then((val) => (setLoggedIn(val)))
  }, [])
  // Placeholder for starting the game
  const startGame = async () => {
        const res = await fetch(`${SERVER_ENDPOINT}/admin/new_game`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // IMPORTANT for cookies
          body: JSON.stringify(config),
        });
  };

  const handleChange = (field: string, value: string | number) => {
    if (field.startsWith("level")) {
      const newThrones = { ...config.thrones, [field]: value };
      setConfig((prev) => ({ ...prev, thrones: newThrones }));
      return;
    }
    if (field === "width" || field === "height") {
      const newMapSize = { ...config.mapSize, [field]: value };
      setConfig((prev) => ({ ...prev, mapSize: newMapSize }));
      return;
    }
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={styles.page}>
      {!loggedIn ? (
        <AdminLogin close={() => setLoggedIn(true)} />
      ) : (
        <div style={styles.card}>
          <h2 style={styles.title}>Dominions 6 - Start Game</h2>

          <div style={styles.field}>
            <label style={styles.label}>Game Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleChange("name", e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Port</label>
            <input
              type="text"
              value={config.port}
              onChange={(e) => handleChange("port", e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.field}>
              <label style={styles.label}>Map width {config.mapSize.width}</label>
              <input
                type="range"
                id="mapWidth"
                name="mapWidth"
                min="5"
                max="100"
                onChange={(e) => handleChange("width", e.target.value)}
              />
              <label style={styles.label}>Map height {config.mapSize.height}</label>
              <input
                type="range"
                id="mapHeight"
                name="mapHeight"
                min="5"
                max="100"
                onChange={(e) => handleChange("height", e.target.value)}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Age</label>
            <select
              value={config.age}
              onChange={(e) => handleChange("age", e.target.value)}
              style={styles.input}
            >
              <option value="EA">EA</option>
              <option value="MA">MA</option>
              <option value="LA">LA</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Throne level1 {config.thrones.level1}</label>
            <input
              type="range"
              id="throne1"
              name="throne1"
              min="0"
              max="20"
              onChange={(e) => handleChange("level1", e.target.value)}
            />
            <label style={styles.label}>Throne level2 {config.thrones.level2}</label>
            <input
              type="range"
              id="throne2"
              name="throne2"
              min="0"
              max="10"
              onChange={(e) => handleChange("level2", e.target.value)}
            />
            <label style={styles.label}>Throne level3 {config.thrones.level3}</label>
            <input
              type="range"
              id="throne2"
              name="throne3"
              min="0"
              max="5"
              onChange={(e) => handleChange("level3", e.target.value)}
            />
          </div>

          <button onClick={startGame} style={styles.button}>
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: 32,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "#f3f4f6",
    minHeight: "100vh",
  },
  label: {
    color: "#000000ff",
  },
  card: {
    maxWidth: 400,
    width: "100%",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  input: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  button: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#4f46e5",
    color: "white",
    cursor: "pointer",
    fontSize: 16,
    marginTop: 12,
  },
};
