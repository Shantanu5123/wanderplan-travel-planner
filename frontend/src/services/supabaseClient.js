import { createClient } from '@supabase/supabase-js';

// Clean Supabase URL in case /rest/v1 was appended
let rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phntsbgqtjoodbppzfuc.supabase.co';
if (rawUrl.includes('/rest/v1')) {
  rawUrl = rawUrl.split('/rest/v1')[0];
}
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_i4N7EG-vVe2ltNKgVbiPIQ_kFzBkybk';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your_supabase_anon_key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
