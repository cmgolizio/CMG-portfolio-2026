import { supabase } from "./supabaseClient";

export async function listProjects({ publishedOnly = true } = {}) {
  let q = supabase
    .from("projects")
    .select(
      "id, slug, title, summary, tags, stack, featured, hero_image_url, live_url, repo_url, published, created_at",
    )
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (publishedOnly) q = q.eq("published", true);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getProjectBySlug(slug) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertProject(project) {
  const { data, error } = await supabase
    .from("projects")
    .upsert(project, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  return true;
}
