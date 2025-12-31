export const globalStyle: { [key: string]: React.CSSProperties }  = {
  page: {
    minHeight: "100vh",
    flex: 5,
    background: "#f5f7fa",
    padding: "64px 24px",
    maxWidth: 960,
    minWidth: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 800, // login form should be narrow
    padding: 32,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },

  title: {
    textAlign: "center" as const,
    fontSize: 22,
    marginBottom: 12,
  },

  label: {
    display: "flex",
    flexDirection: "column" as const,
    fontSize: 14,
    fontWeight: 500,
    gap: 6,
  },

  input: {
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  button: {
    marginTop: 16,
    padding: 14,
    fontSize: 16,
    fontWeight: 600,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },

  successCard: {
    width: "100%",
    maxWidth: 520,
    padding: 24,
    background: "#ecfeff",
    borderRadius: 12,
    border: "1px solid #67e8f9",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
};
