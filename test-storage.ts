import { storageService } from './src/services/StorageService';
import { settingsRepository } from './src/repositories/SettingsRepository';
import { profileRepository } from './src/repositories/ProfileRepository';
import { storageProvider } from './src/repositories/providers';

console.log("activeId (repo):", settingsRepository.getActiveProfileId());
console.log("profile (repo):", profileRepository.getProfile(settingsRepository.getActiveProfileId() || ''));
console.log("activeProfile (service):", storageService.getActiveProfile());
console.log("cache:", (storageProvider as any).cache);
