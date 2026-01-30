// supabase/functions/contact-submit/index.ts
// Public contact submit endpoint with CORS + atomic Postgres rate limiting + server-side insert.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getIp(req: Request) {
  // Supabase Edge typically provides x-forwarded-for
  const xff = req.headers.get("x-forwarded-for") || "";
  const ip = (xff.split(",")[0] || "").trim();
  return ip || "unknown";
}

function nowIso() {
  return new Date().toISOString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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
    // IMPORTANT: Supabase CLI reserves names starting with SUPABASE_
    // So we store secrets under custom names.
    const PROJECT_URL = Deno.env.get("PROJECT_SUPABASE_URL");
    const PROJECT_SECRET = Deno.env.get("PROJECT_SUPABASE_SECRET_KEY");

    if (!PROJECT_URL || !PROJECT_SECRET) {
      return new Response(
        JSON.stringify({
          error:
            "Missing PROJECT_SUPABASE_URL / PROJECT_SUPABASE_SECRET_KEY (set via `supabase secrets set ...`)",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    // Server-side client using secret key (bypasses RLS)
    const supabase = createClient(PROJECT_URL, PROJECT_SECRET);

    // Parse body
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Basic input sanity (not fancy; just avoids junk)
    if (name.length > 200 || email.length > 320 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // ---- RATE LIMIT (atomic via Postgres RPC) ----
    // 5 requests per 10 minutes per IP per window bucket
    const limit = 5;
    const windowSeconds = 10 * 60;

    const ip = getIp(req);
    const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const key = `contact:${ip}:${windowBucket}`;

    const { data: rl, error: rlErr } = await supabase
      .rpc("rate_limit_check", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      })
      .single();

    if (rlErr) throw rlErr;

    if (!rl?.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          count: rl?.count ?? null,
          reset_at: rl?.reset_at ?? null,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
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
