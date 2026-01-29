export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  MEDIUM_HANDLE: import.meta.env.VITE_MEDIUM_HANDLE || "@cmgolizio",
};

export function assertEnv() {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local",
    );
  }
}
