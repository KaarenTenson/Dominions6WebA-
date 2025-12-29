import { Navigate, Outlet } from "react-router-dom";
import { hasValidCookie } from "./auth";
import { useEffect, useState } from "react";


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
