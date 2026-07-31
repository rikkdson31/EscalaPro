const fs = require('fs');

function patch(filePath, replaceMap) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [from, to] of Object.entries(replaceMap)) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content);
}

// 1. PendingCenterService
patch('src/services/PendingCenterService.ts', {
  "import { storageService } from './StorageService';": "import { pendingRepository } from '../repositories/PendingRepository';",
  "const data = storageService.getProfileData<PendingItem[]>(profileId, StorageKeys.PENDING_ITEMS);": "const data = pendingRepository.getAllByProfile(profileId);",
  "storageService.saveProfileData(profileId, StorageKeys.PENDING_ITEMS, items);": "pendingRepository.save(profileId, items);"
});

// 2. SmartActionEngine
patch('src/services/SmartActionEngine.ts', {
  "import { storageService } from './StorageService';": "import { profileRepository } from '../repositories/ProfileRepository';",
  "const profile = storageService.getAllProfiles().find(p => p.id === profileId);": "const profile = profileRepository.getProfile(profileId);",
  "const profile = storageService.getAllProfiles().find(p => p.id === profileId);": "const profile = profileRepository.getProfile(profileId);"
});

// 3. EscalaAssistantService
patch('src/services/EscalaAssistantService.ts', {
  "import { storageService } from './StorageService';": "import { settingsRepository } from '../repositories/SettingsRepository';",
  "storageService.getProfileData<string[]>(profileId, StorageKeys.RECENT_MESSAGES)": "settingsRepository.getProfileSetting<string[]>(profileId, StorageKeys.RECENT_MESSAGES)",
  "storageService.saveProfileData(profileId, StorageKeys.RECENT_MESSAGES, recent)": "settingsRepository.saveProfileSetting(profileId, StorageKeys.RECENT_MESSAGES, recent)",
  "storageService.getProfileData<string>(profileId, StorageKeys.LAST_SHOWN_DATE)": "settingsRepository.getProfileSetting<string>(profileId, StorageKeys.LAST_SHOWN_DATE)",
  "storageService.saveProfileData(profileId, StorageKeys.LAST_SHOWN_DATE, dateStr)": "settingsRepository.saveProfileSetting(profileId, StorageKeys.LAST_SHOWN_DATE, dateStr)",
  "storageService.getProfileData<AssistantStats>(profileId, StorageKeys.STATS)": "settingsRepository.getProfileSetting<AssistantStats>(profileId, StorageKeys.STATS)",
  "storageService.saveProfileData(profileId, StorageKeys.STATS, stats)": "settingsRepository.saveProfileSetting(profileId, StorageKeys.STATS, stats)",
  "storageService.saveProfileData(profileId, StorageKeys.FAVORITES, favorites)": "settingsRepository.saveProfileSetting(profileId, StorageKeys.FAVORITES, favorites)",
  "storageService.getProfileData<string[]>(profileId, StorageKeys.FAVORITES)": "settingsRepository.getProfileSetting<string[]>(profileId, StorageKeys.FAVORITES)"
});

// 4. TimeRecordService
patch('src/services/TimeRecordService.ts', {
  "import { storageService } from './StorageService';": "import { timeRecordRepository } from '../repositories/TimeRecordRepository';",
  "const data = storageService.getProfileData<TimeRecord[]>(profileId, StorageKeys.TIME_RECORDS);": "const data = timeRecordRepository.getAllByProfile(profileId);",
  "storageService.saveProfileData(profileId, StorageKeys.TIME_RECORDS, records);": "timeRecordRepository.save(profileId, records);"
});

console.log('Patched services.');
