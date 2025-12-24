import { Navigate, Outlet } from "react-router-dom";
import { hasValidCookie } from "./auth";
import { useEffect, useState } from "react";

export const AuthRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    hasValidCookie()
      .then((ok) => {
        if (!mounted) return;
        setAuthed(ok);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Auth check failed:", err);
        setError("Unable to verify session. Please try again.");
        setAuthed(false);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);
  if (loading)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 20 }}>
        Loading...
      </div>
    );
  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 20 }}>
        {error}
      </div>
    );
  }
  return authed ? <Outlet /> : <Navigate to="/create_user" replace />;
};

export const RequireAuth = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    hasValidCookie()
      .then((ok) => {
        if (!mounted) return;
        setAuthed(ok);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthed(false);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return authed ? <Outlet /> : <Navigate to="/create_user" replace />;
};
