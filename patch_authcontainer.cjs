const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/AuthContainer.tsx', 'utf8');

const regex = /return \(\s*<div className="flex h-screen items-center justify-center bg-slate-50 p-4">/;
const replace = `  const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      <div className="bg-yellow-100 p-2 text-xs text-yellow-800 font-mono text-center border-b border-yellow-200 z-50 shrink-0">
        <div>SUPABASE_URL: {supabaseUrl || 'undefined'}</div>
        <div>SUPABASE_KEY_INICIO: {supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined'}</div>
        <div>URL_VALIDA: {supabaseUrl === 'https://placeholder.supabase.co' || !supabaseUrl ? 'PLACEHOLDER' : 'REAL'}</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">`;

code = code.replace(regex, replace);

// also need to close the div
const endRegex = /<\/motion\.div>\s*<\/div>\s*\);\s*}/;
const endReplace = `</motion.div>\n      </div>\n    </div>\n  );\n}`;

code = code.replace(endRegex, endReplace);

fs.writeFileSync('src/pages/auth/AuthContainer.tsx', code);
console.log('Patched AuthContainer.tsx');
