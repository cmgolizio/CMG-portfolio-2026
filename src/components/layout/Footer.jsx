import React from "react";

export default function Footer() {
  return (
    <footer style={{ padding: 16, borderTop: "1px solid #ddd" }}>
      <small>© {new Date().getFullYear()} Christopher Golizio</small>
    </footer>
  );
}
