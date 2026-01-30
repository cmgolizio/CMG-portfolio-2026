import { createClient } from "@supabase/supabase-js";
import { assertEnv, env } from "../lib/env";

assertEnv();

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
