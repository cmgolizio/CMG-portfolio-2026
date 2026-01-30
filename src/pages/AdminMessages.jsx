import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listContactMessages } from "../services/messages";

export default function AdminMessages() {
  const [offset, setOffset] = React.useState(0);
  const limit = 50;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "messages", offset, limit],
    queryFn: () => listContactMessages({ offset, limit }),
  });

  const items = data?.items || [];

  return (
    <div>
      <h1>Messages</h1>
      <p>
        Showing {items.length} (offset {offset}){" "}
        <button onClick={() => refetch()} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          disabled={offset === 0}
          onClick={() => setOffset((o) => Math.max(o - limit, 0))}
        >
          Prev
        </button>
        <button
          disabled={items.length < limit}
          onClick={() => setOffset((o) => o + limit)}
        >
          Next
        </button>
      </div>

      {isLoading ? <p>Loading…</p> : null}
      {error ? <p>Error: {String(error.message || error)}</p> : null}

      {!isLoading && !items.length ? <p>No messages yet.</p> : null}

      <div style={{ display: "grid", gap: 10, maxWidth: 900 }}>
        {items.map((m) => (
          <div
            key={m.id}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <strong>{m.name}</strong> —{" "}
                <a href={`mailto:${m.email}`}>{m.email}</a>
              </div>
              <small>
                {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
              </small>
            </div>
            <p style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
              {m.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
