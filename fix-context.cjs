const fs = require('fs');

const path = 'src/contexts/ScheduleContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update interface
content = content.replace(
  /saveConfig: \(config: ScheduleConfig\) => void;/,
  'saveConfig: (config: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => void;'
);

// Update implementation
content = content.replace(
  /const saveConfig = \(newConfig: ScheduleConfig\) => \{/,
  'const saveConfig = (newConfig: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => {'
);

const beforeUpdates1 = `        exibirMensagensAssistente: newConfig.exibirMensagensAssistente,
        ultimaAtualizacao: now,
      };`;
const afterUpdates1 = `        exibirMensagensAssistente: newConfig.exibirMensagensAssistente,
        ultimaAtualizacao: now,
        ...(profileUpdates || {})
      };`;
content = content.replace(beforeUpdates1, afterUpdates1);

const beforeUpdates2 = `        dataCriacao: now,
        ultimaAtualizacao: now,
      };`;
const afterUpdates2 = `        dataCriacao: now,
        ultimaAtualizacao: now,
        ...(profileUpdates || {})
      };`;
content = content.replace(beforeUpdates2, afterUpdates2);

fs.writeFileSync(path, content);
