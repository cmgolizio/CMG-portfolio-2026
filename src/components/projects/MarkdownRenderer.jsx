import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // later you can swap styles

export default function MarkdownRenderer({ markdown }) {
  return (
    <div style={{ lineHeight: 1.55 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {markdown || ""}
      </ReactMarkdown>
    </div>
  );
}
