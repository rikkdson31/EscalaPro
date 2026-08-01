const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupWizard.tsx', 'utf8');

if (!code.includes("useAuth")) {
  code = code.replace("import { ChevronRight", "import { useAuth } from '../contexts/AuthContext';\nimport { storageService } from '../services/StorageService';\nimport { performInitialCloudUpload } from '../cloud/InitialSync';\nimport { ChevronRight");
}

code = code.replace("const { saveConfig } = useSchedule();", "const { saveConfig } = useSchedule();\n  const { session } = useAuth();");

const oldHandleFinish = `const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig({
      empresa,
      cliente,
      tipoEscala,
      turma,
      entrada,
      saida,
      referenceDate,
      referenceCycleDay
    }, {
      nome,
      apelido,
      cargo
    });
  };`;

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

code = code.replace(oldHandleFinish, newHandleFinish);
fs.writeFileSync('src/pages/SetupWizard.tsx', code);
console.log('Patched SetupWizard.tsx');
