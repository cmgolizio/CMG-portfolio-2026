import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading…</p>;

  if (!user) {
    const next = location.pathname + (location.search || "");
    return (
      <Navigate to={`/admin/login?next=${encodeURIComponent(next)}`} replace />
    );
  }

  return children;
}
