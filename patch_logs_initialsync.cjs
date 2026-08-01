const fs = require('fs');
let code = fs.readFileSync('src/cloud/InitialSync.ts', 'utf8');

const regex = /console\.log\('2\. Resultado de await supabase\.auth\.getSession\(\):', sessionResponse\);\s*if \(!sessionResponse\.data\.session\) \{/;

const replace = `console.log('2. Resultado de await supabase.auth.getSession():', sessionResponse);
    
    console.log('session recebida como parâmetro (userId):', userId);
    console.log('sessionResponse.data.session:', sessionResponse.data.session);
    console.log('sessionResponse.data.session?.user?.id:', sessionResponse.data.session?.user?.id);

    if (!sessionResponse.data.session) {`;

code = code.replace(regex, replace);

fs.writeFileSync('src/cloud/InitialSync.ts', code);
console.log('Patched InitialSync.ts for requested logs');
