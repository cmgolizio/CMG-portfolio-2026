import { supabase } from "./supabaseClient";

export async function submitContactMessage({ name, email, message }) {
  const { data, error } = await supabase
    .from("contact_messages")
    .insert([{ name, email, message }])
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
