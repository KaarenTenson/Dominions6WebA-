import { Link, useNavigate } from "react-router-dom";
import { SERVER_ENDPOINT } from "../constants";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async() => {
    // example: clear auth cookie / call logout endpoint
    await fetch(`${SERVER_ENDPOINT}/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.left}>
          <Link to="/" style={styles.logo}>
            MyApp
          </Link>
        </div>

        <div style={styles.right}>
          <Link to="/" style={styles.link}>
            Messages
          </Link>
          <Link to="/profile" style={styles.link}>
            Profile
          </Link>
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    width: "100%",
    backgroundColor: "#1c2147",
    padding: "12px 20px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    color: "#FFD700",
    fontSize: "18px",
    fontWeight: "bold",
    textDecoration: "none",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
  },
  button: {
    background: "#FFD700",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
