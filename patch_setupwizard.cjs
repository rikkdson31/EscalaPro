const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupWizard.tsx', 'utf8');

const regex = /saveConfig\(config, \{[\s\S]*?cargo\s*\}\);\s*if \(session\) \{[\s\S]*?const activeProfile = storageService\.getActiveProfile\(\);[\s\S]*?if \(activeProfile\) \{[\s\S]*?await performInitialCloudUpload\(session\.user\.id, activeProfile, config\);[\s\S]*?\}[\s\S]*?\}/;

const newBlock = `const profile = saveConfig(config, {
      nome,
      apelido,
      cargo
    });
    
    if (session && profile) {
      await performInitialCloudUpload(
        session.user.id,
        profile,
        config
      );
    }`;

code = code.replace(regex, newBlock);

fs.writeFileSync('src/pages/SetupWizard.tsx', code);
console.log('Patched SetupWizard.tsx');
