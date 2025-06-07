import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are properly set
const isConfigured = supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key';

if (!isConfigured) {
  console.warn(
    'Supabase credentials are not properly configured.\n' +
    'Please update the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'You can find these credentials in your Supabase project dashboard under Project Settings > API.'
  );
}

// Create a single supabase client for the entire app with fallback values
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Add a debug function to check connection
export const checkSupabaseConnection = async () => {
  if (!isConfigured) {
    console.warn('Supabase is not configured. Please set up your environment variables.');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection test exception:', err);
    return false;
  }
};

// Export configuration status for components to check
export const isSupabaseConfigured = isConfigured;