const fs = require('fs');
let code = fs.readFileSync('src/cloud/InitialSync.ts', 'utf8');

const regex = /export async function uploadInitialProfile.*?\}\s*\} catch \(err\) \{\s*console\.error\('Exception in uploadInitialProfile:', err\);\s*\}/s;

const replace = `export async function uploadInitialProfile(userId: string, profile: UserProfile) {
  const payload = {
    id: profile.id,
    user_id: userId,
    nome: profile.nome,
    apelido: profile.apelido,
    matricula: profile.matricula,
    cargo: profile.cargo,
    foto_url: profile.foto,
    created_at: profile.dataCriacao || new Date().toISOString(),
    updated_at: profile.ultimaAtualizacao || new Date().toISOString()
  };
  
  const { error } = await supabase.from('profiles').upsert(payload).select();
  
  if (error) {
    throw new Error(
      JSON.stringify(error, null, 2)
    );
  }
}`;

if (regex.test(code)) {
  code = code.replace(regex, replace);
} else {
  console.log("Could not find uploadInitialProfile using regex");
}

fs.writeFileSync('src/cloud/InitialSync.ts', code);
console.log('Patched uploadInitialProfile');
