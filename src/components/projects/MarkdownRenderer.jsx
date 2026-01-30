// import React from "react";

// // Intentionally dumb for Phase 0. We’ll swap to a real markdown renderer later.
// export default function MarkdownRenderer({ markdown }) {
//   return (
//     <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{markdown}</pre>
//   );
// }
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ markdown }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown || ""}</ReactMarkdown>
  );
}
