import { dateService } from './DateService';
import { StorageKeys } from '../constants/StorageKeys';

import { profileRepository } from '../repositories/ProfileRepository';
import { timeRecordRepository } from '../repositories/TimeRecordRepository';
import { pendingRepository } from '../repositories/PendingRepository';
import { settingsRepository } from '../repositories/SettingsRepository';
import { scheduleRepository } from '../repositories/ScheduleRepository';
import { storageProvider } from '../repositories/providers';

export interface BackupData {
  metadata: {
    version: string;
    appVersion: string;
    createdAt: string;
    updatedAt: string;
  };
  profile: any;
  settings: any;
  schedules: any;
  timeRecords: any;
  pendingItems: any;
  timeline: any;
  occurrences: any;
  futureSyncQueue: any;
  _rawV2?: string; 
}

export class BackupService {
  private readonly SUPPORTED_VERSIONS = ['1.0'];

  public async createBackup(): Promise<BackupData> {
    const profiles = profileRepository.getAllProfiles();
    const profilesDict: Record<string, any> = {};
    profiles.forEach(p => profilesDict[p.id] = p);

    const backup: BackupData = {
      metadata: {
        version: "1.0",
        appVersion: "1.0.0",
        createdAt: dateService.now().toISOString(),
        updatedAt: dateService.now().toISOString()
      },
      profile: profilesDict,
      settings: { activeProfileId: settingsRepository.getActiveProfileId() },
      schedules: {}, 
      timeRecords: {}, 
      pendingItems: {},
      timeline: {},
      occurrences: {},
      futureSyncQueue: {}
    };

    for (const profile of profiles) {
      const pid = profile.id;
      backup.timeRecords[pid] = timeRecordRepository.getAllByProfile(pid);
      backup.pendingItems[pid] = pendingRepository.getAllByProfile(pid);
      backup.schedules[pid] = scheduleRepository.getByProfile(pid);
      
      backup.settings[pid] = {
        config: settingsRepository.getProfileSetting(pid, StorageKeys.CONFIG),
        stats: settingsRepository.getProfileSetting(pid, StorageKeys.STATS),
        favorites: settingsRepository.getProfileSetting(pid, StorageKeys.FAVORITES),
        recentMessages: settingsRepository.getProfileSetting(pid, StorageKeys.RECENT_MESSAGES),
        lastShownDate: settingsRepository.getProfileSetting(pid, StorageKeys.LAST_SHOWN_DATE)
      };
    }

    return backup;
  }

  public async restoreBackup(backup: BackupData): Promise<boolean> {
    // 1. Validação estrutural básica
    if (!backup || typeof backup !== 'object') {
      throw new Error("Arquivo de backup inválido ou corrompido.");
    }
    
    // 2. Validação explícita de propriedades
    const requiredKeys = [
      'metadata', 'profile', 'settings', 'schedules', 
      'timeRecords', 'pendingItems', 'timeline', 
      'occurrences', 'futureSyncQueue'
    ];

    for (const key of requiredKeys) {
      if (!(key in backup) || typeof (backup as any)[key] !== 'object') {
        throw new Error(`Estrutura de backup inválida. A propriedade '${key}' está ausente ou mal formatada.`);
      }
    }

    // 3. Validação de versão
    if (!this.SUPPORTED_VERSIONS.includes(backup.metadata.version)) {
      throw new Error(`O backup pertence a uma versão incompatível (${backup.metadata.version}). Versões suportadas: ${this.SUPPORTED_VERSIONS.join(', ')}.`);
    }

    // 4. Snapshot de segurança (Atomicidade / Rollback)
    const snapshot = await this.createBackup();

    try {
      // Clear existing profiles to overwrite cleanly
      profileRepository.remove();

      if (backup.settings && backup.settings.activeProfileId) {
        settingsRepository.setActiveProfileId(backup.settings.activeProfileId);
      } else {
        settingsRepository.remove();
      }

      for (const profileId of Object.keys(backup.profile || {})) {
        profileRepository.saveProfile(backup.profile[profileId]);

        if (backup.timeRecords && backup.timeRecords[profileId]) {
          timeRecordRepository.save(profileId, backup.timeRecords[profileId]);
        }
        if (backup.pendingItems && backup.pendingItems[profileId]) {
          pendingRepository.save(profileId, backup.pendingItems[profileId]);
        }
        if (backup.schedules && backup.schedules[profileId]) {
          scheduleRepository.save(profileId, backup.schedules[profileId]);
        }
        if (backup.settings && backup.settings[profileId]) {
          const s = backup.settings[profileId];
          if (s.config) settingsRepository.saveProfileSetting(profileId, StorageKeys.CONFIG, s.config);
          if (s.stats) settingsRepository.saveProfileSetting(profileId, StorageKeys.STATS, s.stats);
          if (s.favorites) settingsRepository.saveProfileSetting(profileId, StorageKeys.FAVORITES, s.favorites);
          if (s.recentMessages) settingsRepository.saveProfileSetting(profileId, StorageKeys.RECENT_MESSAGES, s.recentMessages);
          if (s.lastShownDate) settingsRepository.saveProfileSetting(profileId, StorageKeys.LAST_SHOWN_DATE, s.lastShownDate);
        }
      }
      return true;
    } catch (e) {
      // Rollback para o Snapshot de Segurança em caso de erro
      console.error("Erro durante a restauração do backup. Revertendo para o snapshot de segurança...", e);
      try {
        await this.restoreSnapshot(snapshot);
      } catch (rollbackErr) {
        console.error("FALHA CRÍTICA NO ROLLBACK", rollbackErr);
      }
      throw new Error("Falha na restauração. Os dados originais foram mantidos intactos.");
    }
  }

  private async restoreSnapshot(snapshot: BackupData): Promise<void> {
    profileRepository.remove();
    if (snapshot.settings && snapshot.settings.activeProfileId) {
      settingsRepository.setActiveProfileId(snapshot.settings.activeProfileId);
    }
    for (const profileId of Object.keys(snapshot.profile || {})) {
      profileRepository.saveProfile(snapshot.profile[profileId]);

      if (snapshot.timeRecords && snapshot.timeRecords[profileId]) {
        timeRecordRepository.save(profileId, snapshot.timeRecords[profileId]);
      }
      if (snapshot.pendingItems && snapshot.pendingItems[profileId]) {
        pendingRepository.save(profileId, snapshot.pendingItems[profileId]);
      }
      if (snapshot.schedules && snapshot.schedules[profileId]) {
        scheduleRepository.save(profileId, snapshot.schedules[profileId]);
      }
      if (snapshot.settings && snapshot.settings[profileId]) {
        const s = snapshot.settings[profileId];
        if (s.config) settingsRepository.saveProfileSetting(profileId, StorageKeys.CONFIG, s.config);
        if (s.stats) settingsRepository.saveProfileSetting(profileId, StorageKeys.STATS, s.stats);
        if (s.favorites) settingsRepository.saveProfileSetting(profileId, StorageKeys.FAVORITES, s.favorites);
        if (s.recentMessages) settingsRepository.saveProfileSetting(profileId, StorageKeys.RECENT_MESSAGES, s.recentMessages);
        if (s.lastShownDate) settingsRepository.saveProfileSetting(profileId, StorageKeys.LAST_SHOWN_DATE, s.lastShownDate);
      }
    }
  }

  public getLastBackupInfo(): any {
    const raw = storageProvider.getRaw('last_backup_info');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  public saveLastBackupInfo(info: any) {
    storageProvider.setRaw('last_backup_info', JSON.stringify(info));
  }
}

export const backupService = new BackupService();
