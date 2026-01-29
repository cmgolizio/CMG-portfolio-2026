import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProject, listProjects } from "../services/projects";

export default function AdminProjects() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", "admin"],
    queryFn: () => listProjects({ publishedOnly: false }),
  });

  async function onDelete(id) {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    await qc.invalidateQueries({ queryKey: ["projects"] });
  }

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Error: {String(error.message || error)}</p>;

  return (
    <div>
      <h1>Projects (Admin)</h1>
      <p>
        <Link to='/admin/projects/new'>+ New project</Link>
      </p>

      <table
        border='1'
        cellPadding='8'
        style={{ borderCollapse: "collapse", width: "100%", maxWidth: 980 }}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.slug}</td>
              <td>{p.published ? "Yes" : "No"}</td>
              <td>
                <button
                  onClick={() => navigate(`/admin/projects/${p.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
