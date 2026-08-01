const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/AuthContainer.tsx', 'utf8');

const oldCode = `        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome }
          }
        });
        if (error) throw error;`;

const newCode = `        console.log('1. email enviado:', email);
        const response = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome }
          }
        });
        console.log('2. resposta completa:', response);
        console.log('3. data:', response.data);
        console.log('4. error:', response.error);
        console.log('5. status:', response?.error?.status || (response as any).status);
        const { error } = response;
        if (error) throw error;`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/pages/auth/AuthContainer.tsx', code);
console.log('Patched AuthContainer.tsx for signUp logs');
