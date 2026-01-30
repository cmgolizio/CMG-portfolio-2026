import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signInWithMagicLink } from "../services/auth";

function getNextFromQuery(search) {
  const params = new URLSearchParams(search || "");
  return params.get("next") || "/admin";
}

export default function AdminLogin() {
  const { user, isLoading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState({ state: "idle", message: "" });

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading && user) {
      navigate(getNextFromQuery(location.search), { replace: true });
    }
  }, [user, isLoading, navigate, location.search]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      await signInWithMagicLink(email);
      setStatus({
        state: "success",
        message: "Magic link sent. Check your email.",
      });
    } catch (err) {
      setStatus({
        state: "error",
        message: err?.message || "Failed to send magic link.",
      });
    }
  }

  return (
    <div>
      <h1>Admin access</h1>
      <p>
        This is for site administration only. <Link to='/'>Back to site</Link>
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 10, maxWidth: 420 }}
      >
        <input
          type='email'
          placeholder='Admin email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button disabled={status.state === "loading"} type='submit'>
          {status.state === "loading" ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {status.state !== "idle" && <p>{status.message}</p>}
    </div>
  );
}
