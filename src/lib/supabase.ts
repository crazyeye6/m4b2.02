import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://peuwvmctzmlhbtgplyth.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldXd2bWN0em1saGJ0Z3BseXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzgwMDIsImV4cCI6MjA5MjAxNDAwMn0.nCxMGSJcFACnTdPzb2pNENViQvmrqeLrjF0sE-KVXNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
