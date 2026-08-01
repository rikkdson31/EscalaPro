const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "import { storageService } from '../services/StorageService';",
  "import { storageService } from '../services/StorageService';\nimport { settingsRepository } from '../repositories/SettingsRepository';"
);

// We need to modify signOut and the session change listener
const signOutStr = `const signOut = async () => {
    await supabase.auth.signOut();
    settingsRepository.setActiveProfileId(''); // Clear active profile
    setBootstrapped(false);
  };`;

code = code.replace(
  /const signOut = async \(\) => \{[\s\S]*?\};\s*useEffect/,
  signOutStr + '\n\n  useEffect'
);

const sessionChangeStr = `if (session) {
        setOfflineMode(false);
        cloudSyncEngine.start();
      } else {
        cloudSyncEngine.stop();
        settingsRepository.setActiveProfileId('');
        setBootstrapped(false);
      }`;

code = code.replace(
  /if \(session\) \{\s*setOfflineMode\(false\);\s*cloudSyncEngine\.start\(\);\s*\} else \{\s*cloudSyncEngine\.stop\(\);\s*setBootstrapped\(false\);\s*\}/,
  sessionChangeStr
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
console.log('Patched AuthContext.tsx');
