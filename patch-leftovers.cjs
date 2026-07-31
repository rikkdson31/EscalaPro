const fs = require('fs');
let s;

s = fs.readFileSync('src/services/EscalaAssistantService.ts', 'utf8');
s = s.replace(/storageService\.saveProfileData/g, 'settingsRepository.saveProfileSetting');
s = s.replace(/storageService\.getProfileData/g, 'settingsRepository.getProfileSetting');
fs.writeFileSync('src/services/EscalaAssistantService.ts', s);

s = fs.readFileSync('src/services/SmartActionEngine.ts', 'utf8');
s = s.replace(/storageService\.getAllProfiles/g, 'profileRepository.getAllProfiles');
fs.writeFileSync('src/services/SmartActionEngine.ts', s);
console.log("Patched leftovers.");
