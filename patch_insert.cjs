const fs = require('fs');
let code = fs.readFileSync('src/cloud/InitialSync.ts', 'utf8');

const regex = /const \{ error \} = await supabase\.from\('profiles'\)\.upsert\(payload\)\.select\(\);\s*if \(error\) \{\s*throw new Error\(\s*JSON\.stringify\(error, null, 2\)\s*\);\s*\}/s;

const replace = `const { data, error, status, statusText } = await supabase.from('profiles').insert(payload).select();
  
  console.log('Insert profile response:', { data, error, status, statusText });

  if (error) {
    throw new Error(
      JSON.stringify({
        message: 'Insert profiles failed',
        data,
        error,
        status,
        statusText
      }, null, 2)
    );
  }`;

if (regex.test(code)) {
  code = code.replace(regex, replace);
  fs.writeFileSync('src/cloud/InitialSync.ts', code);
  console.log('Patched uploadInitialProfile for insert');
} else {
  console.log('Could not find pattern');
}
