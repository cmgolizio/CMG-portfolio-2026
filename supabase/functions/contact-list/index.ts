// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  try {
    // Custom secret names (Supabase CLI reserves SUPABASE_*)
    const PROJECT_URL = Deno.env.get("PROJECT_SUPABASE_URL");
    const PROJECT_SECRET = Deno.env.get("PROJECT_SUPABASE_SECRET_KEY");
    const PROJECT_PUB = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");
    const ADMIN_USER_ID = Deno.env.get("ADMIN_USER_ID"); // your auth user UUID

    if (!PROJECT_URL || !PROJECT_SECRET || !PROJECT_PUB || !ADMIN_USER_ID) {
      return new Response(
        JSON.stringify({
          error:
            "Missing secrets. Need PROJECT_SUPABASE_URL, PROJECT_SUPABASE_SECRET_KEY, PROJECT_SUPABASE_PUBLISHABLE_KEY, ADMIN_USER_ID",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const token = getBearerToken(authHeader);

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing Authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Verify caller identity using publishable key + provided JWT
    const authClient = createClient(PROJECT_URL, PROJECT_PUB, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr) {
      return new Response(JSON.stringify({ error: "Invalid auth", detail: userErr.message }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const callerId = userData?.user?.id;
    if (!callerId || callerId !== ADMIN_USER_ID) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Use secret key to read messages (bypasses RLS)
    const adminClient = createClient(PROJECT_URL, PROJECT_SECRET);

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit || 50), 1), 200);
    const offset = Math.max(Number(body?.offset || 0), 0);

    const { data, error } = await adminClient
      .from("contact_messages")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return new Response(JSON.stringify({ items: data || [], limit, offset }), {
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/contact-list' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODUxNjYzMTl9.wwYOZ1gYNr5Gv4h45MzNKLU1IUsU93SgUh-0VlMJ6q-fnfSkciCZZwVi5A99NSbxt3mViAQ5o4sOOElthcErTg' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
