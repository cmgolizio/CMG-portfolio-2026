import { supabase } from "./supabaseClient";

export async function listContactMessages({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase.functions.invoke("contact-list", {
    body: { limit, offset },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data; // { items, limit, offset }
}
