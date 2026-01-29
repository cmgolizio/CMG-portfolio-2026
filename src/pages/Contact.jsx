import React from "react";
import { submitContactMessage } from "../services/contact";

export default function Contact() {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [status, setStatus] = React.useState({ state: "idle", message: "" });

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      await submitContactMessage(form);
      setStatus({ state: "success", message: "Message sent." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ state: "error", message: err?.message || "Failed to send." });
    }
  }

  return (
    <div>
      <h1>Contact</h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 10, maxWidth: 480 }}
      >
        <input
          placeholder='Name'
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />
        <input
          placeholder='Email'
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          required
        />
        <textarea
          placeholder='Message'
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          rows={6}
          required
        />
        <button disabled={status.state === "loading"} type='submit'>
          {status.state === "loading" ? "Sending…" : "Send"}
        </button>
      </form>

      {status.state !== "idle" && <p>{status.message}</p>}
    </div>
  );
}
