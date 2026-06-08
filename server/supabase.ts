import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!supabaseUrl) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL');
}

// Server-side client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public client (uses anon key - respects RLS)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

export { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
