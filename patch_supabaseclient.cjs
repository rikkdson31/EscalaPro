const fs = require('fs');
let code = fs.readFileSync('src/cloud/SupabaseClient.ts', 'utf8');

const regex = /export const supabase = createClient\(/;
const replace = `console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY_INICIO:', supabaseAnonKey?.substring(0, 20));
console.log('URL_VALIDA:', supabaseUrl === 'https://placeholder.supabase.co' ? 'PLACEHOLDER' : 'REAL');

export const supabase = createClient(`;

code = code.replace(regex, replace);

fs.writeFileSync('src/cloud/SupabaseClient.ts', code);
console.log('Patched SupabaseClient.ts');
