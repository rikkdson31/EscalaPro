const fs = require('fs');
const path = 'src/services/StorageService.ts';

const newContent = `import { storageProvider } from '../repositories/providers';
import { UserProfile } from '../types';
import { StorageKeys } from '../constants/StorageKeys';
import { ThemeConstants } from '../constants/ThemeConstants';
import { dateService } from './DateService';

import { profileRepository } from '../repositories/ProfileRepository';
import { timeRecordRepository } from '../repositories/TimeRecordRepository';
import { pendingRepository } from '../repositories/PendingRepository';
import { settingsRepository } from '../repositories/SettingsRepository';

class StorageService {
  constructor() {
    this.migrateV1();
    this.migrateV2ToRepositories();
  }

  private migrateV1() {
    const oldConfig = storageProvider.getRaw(StorageKeys.OLD_CONFIG);
    if (oldConfig && !settingsRepository.getActiveProfileId()) {
      try {
        const config = JSON.parse(oldConfig);
        const newProfile: UserProfile = {
          id: 'default-profile-1',
          nome: 'Meu Perfil',
          empresa: config.empresa || '',
          cliente: config.cliente || '',
          tipoEscala: config.tipoEscala || '3x3',
          turma: config.turma || '',
          entrada: config.entrada || '07:00',
          saida: config.saida || '19:00',
          dataConfiguracaoInicial: config.referenceDate || '',
          posicaoInicialCiclo: config.referenceCycleDay || 0,
          temaPreferido: ThemeConstants.LIGHT,
          exibirMensagensAssistente: config.exibirMensagensAssistente !== undefined ? config.exibirMensagensAssistente : true,
          dataCriacao: dateService.toISODate(dateService.now()),
          ultimaAtualizacao: dateService.toISODate(dateService.now()),
        };
        profileRepository.saveProfile(newProfile);
        settingsRepository.setActiveProfileId(newProfile.id);
        storageProvider.remove(StorageKeys.OLD_CONFIG);
      } catch (e) {
        console.error('Migration failed', e);
      }
    }
  }

  private migrateV2ToRepositories() {
    const v2Raw = storageProvider.getRaw(StorageKeys.APP_STORAGE_V2);
    if (v2Raw) {
      try {
        const parsed = JSON.parse(v2Raw);
        
        // Profiles
        if (parsed.profiles) {
          Object.values(parsed.profiles).forEach((p: any) => profileRepository.saveProfile(p));
        }
        
        // Active Profile
        if (parsed.activeProfileId) {
          settingsRepository.setActiveProfileId(parsed.activeProfileId);
        }
        
        // Profile Data
        if (parsed.profileData) {
          for (const profileId of Object.keys(parsed.profileData)) {
            const data = parsed.profileData[profileId];
            for (const key of Object.keys(data)) {
              if (key === StorageKeys.TIME_RECORDS) {
                timeRecordRepository.save(profileId, data[key]);
              } else if (key === StorageKeys.PENDING_ITEMS) {
                pendingRepository.save(profileId, data[key]);
              } else {
                settingsRepository.saveProfileSetting(profileId, key, data[key]);
              }
            }
          }
        }
        
        // Remove V2 after migration so we don't migrate again
        storageProvider.remove(StorageKeys.APP_STORAGE_V2);
        console.log('Migrated APP_STORAGE_V2 to independent repositories.');
      } catch (e) {
        console.error('V2 Migration failed', e);
      }
    }
  }

  public getActiveProfile(): UserProfile | null {
    const activeId = settingsRepository.getActiveProfileId();
    if (!activeId) return null;
    return profileRepository.getProfile(activeId);
  }

  public saveProfile(profile: UserProfile) {
    profileRepository.saveProfile(profile);
    const activeId = settingsRepository.getActiveProfileId();
    if (!activeId) {
      settingsRepository.setActiveProfileId(profile.id);
    }
  }

  public updateProfile(profileId: string, updates: Partial<UserProfile>) {
    const profile = profileRepository.getProfile(profileId);
    if (profile) {
      profileRepository.updateProfile(profileId, {
        ...updates,
        ultimaAtualizacao: dateService.toISODate(dateService.now())
      });
    }
  }

  public setActiveProfileId(id: string) {
    if (profileRepository.getProfile(id)) {
      settingsRepository.setActiveProfileId(id);
    }
  }

  public getAllProfiles(): UserProfile[] {
    return profileRepository.getAllProfiles();
  }

  public getProfileData<T>(profileId: string, key: string): T | null {
    if (key === StorageKeys.TIME_RECORDS) return timeRecordRepository.getAllByProfile(profileId) as any;
    if (key === StorageKeys.PENDING_ITEMS) return pendingRepository.getAllByProfile(profileId) as any;
    return settingsRepository.getProfileSetting<T>(profileId, key);
  }

  public saveProfileData<T>(profileId: string, key: string, data: T) {
    if (key === StorageKeys.TIME_RECORDS) timeRecordRepository.save(profileId, data as any);
    else if (key === StorageKeys.PENDING_ITEMS) pendingRepository.save(profileId, data as any);
    else settingsRepository.saveProfileSetting(profileId, key, data);
  }

  public clearAll() {
    // Clear everything from storageProvider? Or clear repositories individually?
    // We should probably just clear storageProvider entirely as we did before
    storageProvider.clear();
  }
}

export const storageService = new StorageService();
`;

fs.writeFileSync(path, newContent);
console.log("Success patching StorageService.ts");
