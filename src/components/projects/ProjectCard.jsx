import React from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>
        <Link to={`/projects/${project.slug}`}>{project.title}</Link>
      </h3>
      <p>{project.summary}</p>
      {project.tags?.length ? (
        <p>
          <small>Tags: {project.tags.join(", ")}</small>
        </p>
      ) : null}
      <p style={{ marginBottom: 0 }}>
        {project.live_url ? (
          <a href={project.live_url} target='_blank' rel='noreferrer'>
            Live
          </a>
        ) : null}
        {project.live_url && project.repo_url ? " · " : null}
        {project.repo_url ? (
          <a href={project.repo_url} target='_blank' rel='noreferrer'>
            Repo
          </a>
        ) : null}
      </p>
    </div>
  );
}
