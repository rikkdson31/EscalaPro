const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupWizard.tsx', 'utf8');

const regex = /const handleFinish = \(e: React\.FormEvent\) => \{[\s\S]*?\}\);\s*\};/;
const newHandleFinish = `const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      empresa,
      cliente,
      tipoEscala,
      turma,
      entrada,
      saida,
      referenceDate,
      referenceCycleDay
    };
    saveConfig(config, {
      nome,
      apelido,
      cargo
    });
    
    if (session) {
      const activeProfile = storageService.getActiveProfile();
      if (activeProfile) {
        await performInitialCloudUpload(session.user.id, activeProfile, config);
      }
    }
  };`;

code = code.replace(regex, newHandleFinish);
fs.writeFileSync('src/pages/SetupWizard.tsx', code);
console.log('Patched SetupWizard.tsx successfully');
