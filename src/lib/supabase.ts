import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!url && !!anonKey;

// null until .env.local has real credentials — every caller must handle that.
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
