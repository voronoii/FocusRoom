import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string | null;
  display_name: string;
  avatar_seed: string;
  is_guest: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  task_name: string;
  duration_minutes: number;
  started_at: string;
  status: 'active' | 'completed' | 'timeout';
  completed_at: string | null;
}

export interface PresenceState {
  user_id: string;
  display_name: string;
  avatar_seed: string;
  task_name: string;
  duration_minutes: number;
  started_at: string;
  is_npc: boolean;
}
