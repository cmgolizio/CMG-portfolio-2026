import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signInWithMagicLink } from "../services/auth";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState({ state: "idle", message: "" });
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading && user) {
      const from = location.state?.from || "/admin";
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location.state]);

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
      <h1>Login</h1>
      <p>Admin access via magic link.</p>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 10, maxWidth: 420 }}
      >
        <input
          type='email'
          placeholder='you@email.com'
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
