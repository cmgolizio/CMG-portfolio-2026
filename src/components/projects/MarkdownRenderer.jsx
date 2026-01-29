import React from "react";

// Intentionally dumb for Phase 0. We’ll swap to a real markdown renderer later.
export default function MarkdownRenderer({ markdown }) {
  return (
    <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{markdown}</pre>
  );
}
