import { createClient } from '@supabase/supabase-js';

// Read Supabase configuration from environment variables (supporting Vite and Node runtimes)
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

// Fallback dummy URL to prevent createClient from throwing an error during initialization if env vars are missing
const DEFAULT_SUPABASE_URL = 'https://placeholder.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'placeholder-key';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== DEFAULT_SUPABASE_URL &&
    supabaseAnonKey !== DEFAULT_SUPABASE_ANON_KEY
  );
};

// Initialize a single reusable Supabase client
export const supabase = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
