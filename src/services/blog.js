import { supabase } from "./supabaseClient";
import { env } from "../lib/env";

export async function fetchMediumPosts() {
  // This calls a Supabase Edge Function named "medium-feed"
  // which fetches RSS and returns JSON (avoids browser CORS).
  const { data, error } = await supabase.functions.invoke("medium-feed", {
    body: { handle: env.MEDIUM_HANDLE },
  });

  if (error) throw error;
  return data; // { handle, items: [...] }
}
