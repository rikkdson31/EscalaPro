import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
// @ts-ignore
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY_INICIO:', supabaseAnonKey?.substring(0, 20));
console.log('URL_VALIDA:', supabaseUrl === 'https://placeholder.supabase.co' ? 'PLACEHOLDER' : 'REAL');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
