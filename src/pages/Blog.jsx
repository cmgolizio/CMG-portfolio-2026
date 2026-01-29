import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMediumPosts } from "../services/blog";

export default function Blog() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medium-posts"],
    queryFn: fetchMediumPosts,
  });

  if (isLoading) return <p>Loading Medium posts…</p>;
  if (error)
    return <p>Failed to load blog: {String(error.message || error)}</p>;

  const items = data?.items || [];

  return (
    <div>
      <h1>Blog</h1>
      <p>These are pulled from Medium ({data?.handle}).</p>

      {!items.length ? (
        <p>No posts found.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {items.map((it) => (
            <li key={it.link} style={{ marginBottom: 10 }}>
              <a href={it.link} target='_blank' rel='noreferrer'>
                {it.title}
              </a>
              <br />
              <small>
                {it.pubDate ? new Date(it.pubDate).toLocaleDateString() : ""}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
