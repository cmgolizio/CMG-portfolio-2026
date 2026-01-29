import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectById, upsertProject } from "../services/projects";

const empty = {
  title: "",
  slug: "",
  summary: "",
  description_md: "",
  tags: [],
  stack: [],
  repo_url: "",
  live_url: "",
  featured: false,
  published: false,
  hero_image_url: "",
  gallery_image_urls: [],
};

function csvToArray(s) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function arrayToCsv(arr) {
  return (arr || []).join(", ");
}

export default function AdminProjectEdit({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isEdit = mode === "edit";

  const { data, isLoading } = useQuery({
    queryKey: ["project", "byId", id],
    queryFn: () => getProjectById(id),
    enabled: isEdit && !!id,
  });

  const [form, setForm] = React.useState(empty);
  const [status, setStatus] = React.useState({ state: "idle", message: "" });

  React.useEffect(() => {
    if (isEdit && data) setForm({ ...empty, ...data });
  }, [isEdit, data]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      const payload = {
        ...(isEdit ? { id: form.id } : {}),
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        description_md: form.description_md,
        tags: form.tags,
        stack: form.stack,
        repo_url: form.repo_url || null,
        live_url: form.live_url || null,
        featured: !!form.featured,
        published: !!form.published,
        hero_image_url: form.hero_image_url || null,
        gallery_image_urls: form.gallery_image_urls || [],
      };

      await upsertProject(payload);
      await qc.invalidateQueries({ queryKey: ["projects"] });
      setStatus({ state: "success", message: "Saved." });
      navigate("/admin/projects");
    } catch (err) {
      setStatus({ state: "error", message: err?.message || "Save failed." });
    }
  }

  if (isEdit && isLoading) return <p>Loading…</p>;

  return (
    <div>
      <h1>{isEdit ? "Edit project" : "New project"}</h1>

      <form
        onSubmit={onSave}
        style={{ display: "grid", gap: 10, maxWidth: 720 }}
      >
        <input
          placeholder='Title'
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          required
        />
        <input
          placeholder='Slug (unique)'
          value={form.slug}
          onChange={(e) => setField("slug", e.target.value)}
          required
        />
        <textarea
          placeholder='Summary'
          rows={3}
          value={form.summary}
          onChange={(e) => setField("summary", e.target.value)}
        />

        <label>
          Tags (comma-separated)
          <input
            value={arrayToCsv(form.tags)}
            onChange={(e) => setField("tags", csvToArray(e.target.value))}
          />
        </label>

        <label>
          Stack (comma-separated)
          <input
            value={arrayToCsv(form.stack)}
            onChange={(e) => setField("stack", csvToArray(e.target.value))}
          />
        </label>

        <input
          placeholder='Repo URL'
          value={form.repo_url || ""}
          onChange={(e) => setField("repo_url", e.target.value)}
        />
        <input
          placeholder='Live URL'
          value={form.live_url || ""}
          onChange={(e) => setField("live_url", e.target.value)}
        />

        <label>
          Hero image URL
          <input
            value={form.hero_image_url || ""}
            onChange={(e) => setField("hero_image_url", e.target.value)}
          />
        </label>

        <label>
          Gallery image URLs (comma-separated)
          <input
            value={arrayToCsv(form.gallery_image_urls)}
            onChange={(e) =>
              setField("gallery_image_urls", csvToArray(e.target.value))
            }
          />
        </label>

        <label>
          Markdown description
          <textarea
            rows={10}
            value={form.description_md || ""}
            onChange={(e) => setField("description_md", e.target.value)}
          />
        </label>

        <label>
          <input
            type='checkbox'
            checked={!!form.featured}
            onChange={(e) => setField("featured", e.target.checked)}
          />{" "}
          Featured
        </label>

        <label>
          <input
            type='checkbox'
            checked={!!form.published}
            onChange={(e) => setField("published", e.target.checked)}
          />{" "}
          Published
        </label>

        <button disabled={status.state === "loading"} type='submit'>
          {status.state === "loading" ? "Saving…" : "Save"}
        </button>
      </form>

      {status.state !== "idle" && <p>{status.message}</p>}
    </div>
  );
}
