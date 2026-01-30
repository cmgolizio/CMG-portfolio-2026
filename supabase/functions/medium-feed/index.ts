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

import { XMLParser } from "https://esm.sh/fast-xml-parser@4.4.1";
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- tiny in-memory cache (per edge instance) ---
let cache = {
  handle: "",
  ts: 0,
  payload: null as null | { handle: string; items: any[] },
};

function normalizeHandle(handle: string) {
  const h = (handle || "").trim();
  if (!h) return "@cmgolizio";
  return h.startsWith("@") ? h : `@${h}`;
}

Deno.serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { handle } = await req.json().catch(() => ({ handle: "@cmgolizio" }));
    const h = normalizeHandle(handle);

    // 10-minute cache
    const now = Date.now();
    if (cache.payload && cache.handle === h && now - cache.ts < 10 * 60 * 1000) {
      return new Response(JSON.stringify(cache.payload), {
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 200,
      });
    }

    const rssUrl = `https://medium.com/feed/${h}`;
    const resp = await fetch(rssUrl, {
      headers: { "user-agent": "portfolio-site/1.0" },
    });

    if (!resp.ok) {
      const payload = { handle: h, items: [], error: `Medium RSS fetch failed (${resp.status})` };
      return new Response(JSON.stringify(payload), {
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 200,
      });
    }

    const xml = await resp.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);

    const items = (parsed?.rss?.channel?.item || []).map((it: any) => ({
      title: it.title ?? "",
      link: it.link ?? "",
      pubDate: it.pubDate ?? "",
      guid: typeof it.guid === "string" ? it.guid : it.guid?.["#text"] ?? "",
    }));

    const payload = { handle: h, items };
    cache = { handle: h, ts: now, payload };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "content-type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const payload = { handle: "@cmgolizio", items: [], error: String(e?.message || e) };
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "content-type": "application/json" },
      status: 200,
    });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/medium-feed' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODUwOTExMTZ9.g_ybV1xjDQQpYDtXm7w52wV2-QxsI-wsQggb7rDQZjFtBPUrK0gwQGDJjI8qULZ07nWI0iUjd7KRSx-uqeF2uw' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
