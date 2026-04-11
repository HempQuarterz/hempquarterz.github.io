import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// These values are pulled from environment variables (.env file)
// .trim() guards against whitespace accidentally pasted in Netlify dashboard
const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').replace(/\s/g, '');

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file:\n' +
    '- REACT_APP_SUPABASE_URL\n' +
    '- REACT_APP_SUPABASE_ANON_KEY'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export config for debugging (without exposing keys)
export const supabaseConfig = {
  url: supabaseUrl,
  isConfigured: !!(supabaseUrl && supabaseAnonKey)
};
