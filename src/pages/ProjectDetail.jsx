import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "../services/projects";
import MarkdownRenderer from "../components/projects/MarkdownRenderer";

export default function ProjectDetail() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Error: {String(error.message || error)}</p>;
  if (!data || !data.published) return <p>Project not found.</p>;

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.summary}</p>
      <p>
        {data.live_url ? (
          <a href={data.live_url} target='_blank' rel='noreferrer'>
            Live
          </a>
        ) : null}
        {data.live_url && data.repo_url ? " · " : null}
        {data.repo_url ? (
          <a href={data.repo_url} target='_blank' rel='noreferrer'>
            Repo
          </a>
        ) : null}
      </p>
      <hr />
      <MarkdownRenderer markdown={data.description_md || ""} />
    </div>
  );
}
