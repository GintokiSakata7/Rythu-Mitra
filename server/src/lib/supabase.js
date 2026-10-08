import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabaseEnabled = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

export const supabase = supabaseEnabled
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;
