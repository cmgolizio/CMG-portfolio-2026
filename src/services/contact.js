import { supabase } from "./supabaseClient";

export async function submitContactMessage({ name, email, message }) {
  const { data, error } = await supabase.functions.invoke("contact-submit", {
    body: { name, email, message },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
