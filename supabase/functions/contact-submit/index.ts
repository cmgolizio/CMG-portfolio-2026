// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/**
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})
  */
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getIp(req: Request) {
  // Supabase edge typically provides x-forwarded-for
  const xff = req.headers.get("x-forwarded-for") || "";
  return (xff.split(",")[0] || "").trim() || "unknown";
}

function nowIso() {
  return new Date().toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL")!;
    const SUPABASE_SECRET_KEY = Deno.env.get("PROJECT_SUPABASE_SECRET_KEY")!;


    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Missing server env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

    const ip = getIp(req);

    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // ---- RATE LIMIT SETTINGS ----
    // 5 requests per 10 minutes per IP
    const limit = 5;
    const windowMs = 10 * 60 * 1000;

    // Use a key per IP per window start
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    const resetAt = new Date(windowStart + windowMs).toISOString();
    const key = `contact:${ip}:${windowStart}`;

    // Atomic-ish increment using upsert + select.
    // (For portfolio traffic, this is plenty strong.)
    const { data: row, error: upsertErr } = await supabase
      .from("rate_limits")
      .upsert(
        { key, count: 1, reset_at: resetAt },
        { onConflict: "key", ignoreDuplicates: false }
      )
      .select("count, reset_at")
      .single();

    if (upsertErr) {
      // If upsert conflicts, we need to increment explicitly
      // We'll do it with a second step update.
      const { data: existing, error: fetchErr } = await supabase
        .from("rate_limits")
        .select("count, reset_at")
        .eq("key", key)
        .single();

      if (fetchErr) throw fetchErr;

      const nextCount = (existing?.count || 0) + 1;

      const { data: updated, error: updateErr } = await supabase
        .from("rate_limits")
        .update({ count: nextCount, reset_at: resetAt })
        .eq("key", key)
        .select("count, reset_at")
        .single();

      if (updateErr) throw updateErr;

      if (updated.count > limit) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", reset_at: updated.reset_at }),
          {
            status: 429,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      }
    } else {
      if ((row?.count || 1) > limit) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", reset_at: row.reset_at }),
          {
            status: 429,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      }
    }

    // Insert message (server-side)
    const { error: insertErr } = await supabase.from("contact_messages").insert([
      {
        name,
        email,
        message,
        created_at: nowIso(),
      },
    ]);

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/contact-submit' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODUwOTMyODZ9.6YPyalELk-2_NiVSiAMGyjQD9SY8aZho7iQ-N6iJQCOCmzhKbmVq2cHjQPpj8AlnC7o6U-ULY6CaB9KDhlRE4A' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
