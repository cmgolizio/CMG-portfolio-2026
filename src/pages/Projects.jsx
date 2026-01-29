import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listProjects } from "../services/projects";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectFilters from "../components/projects/ProjectFilters";

function uniqueTags(projects) {
  const set = new Set();
  for (const p of projects) (p.tags || []).forEach((t) => set.add(t));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function Projects() {
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState("");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", "published"],
    queryFn: () => listProjects({ publishedOnly: true }),
  });

  const tags = React.useMemo(() => uniqueTags(data), [data]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return data.filter((p) => {
      const matchesQ =
        !qq ||
        p.title?.toLowerCase().includes(qq) ||
        p.summary?.toLowerCase().includes(qq) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(qq));
      const matchesTag = !tag || (p.tags || []).includes(tag);
      return matchesQ && matchesTag;
    });
  }, [data, q, tag]);

  if (isLoading) return <p>Loading projects…</p>;
  if (error)
    return <p>Failed to load projects: {String(error.message || error)}</p>;

  return (
    <div>
      <h1>Projects</h1>
      <ProjectFilters
        value={q}
        onChange={setQ}
        tags={tags}
        activeTag={tag}
        onTagChange={setTag}
      />
      <ProjectGrid projects={filtered} />
    </div>
  );
}
