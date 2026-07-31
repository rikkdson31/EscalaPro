import { BaseRepository } from './BaseRepository';

export class SettingsRepository extends BaseRepository<any> {
  constructor() {
    super('settings');
  }

  public getActiveProfileId(): string | null {
    return this.provider.get<string>('activeProfileId');
  }

  public setActiveProfileId(id: string): void {
    this.provider.set('activeProfileId', id);
  }
  
  public getProfileSetting<T>(profileId: string, key: string): T | null {
    const settings = this.get(profileId) || {};
    return settings[key] as T || null;
  }

  public saveProfileSetting<T>(profileId: string, key: string, value: T): void {
    const settings = this.get(profileId) || {};
    settings[key] = value;
    this.set(settings, profileId);
  }
}

export const settingsRepository = new SettingsRepository();
