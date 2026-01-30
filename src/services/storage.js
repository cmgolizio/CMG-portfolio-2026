import { supabase } from "./supabaseClient";

export async function uploadProjectImage(file, { folder = "projects" } = {}) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("project-images")
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("project-images").getPublicUrl(path);
  return data.publicUrl;
}
