import React from "react";

export default function ProjectFilters({
  value,
  onChange,
  tags = [],
  activeTag,
  onTagChange,
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        placeholder='Search projects…'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 8, width: "100%", maxWidth: 420 }}
      />
      {!!tags.length && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => onTagChange("")} style={{ marginRight: 8 }}>
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => onTagChange(t)}
              style={{
                marginRight: 8,
                fontWeight: t === activeTag ? 700 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
