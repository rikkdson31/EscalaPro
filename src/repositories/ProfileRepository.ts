import { BaseRepository } from './BaseRepository';
import { UserProfile } from '../types';

export class ProfileRepository extends BaseRepository<Record<string, UserProfile>> {
  constructor() {
    super('profiles');
  }

  public getAllProfiles(): UserProfile[] {
    const profilesDict = this.get() || {};
    return Object.values(profilesDict);
  }

  public getProfile(id: string): UserProfile | null {
    const profilesDict = this.get() || {};
    return profilesDict[id] || null;
  }

  public saveProfile(profile: UserProfile): void {
    const profilesDict = this.get() || {};
    profilesDict[profile.id] = profile;
    this.set(profilesDict);
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): void {
    const profilesDict = this.get() || {};
    if (profilesDict[id]) {
      profilesDict[id] = { ...profilesDict[id], ...updates };
      this.set(profilesDict);
    }
  }

  public deleteProfile(id: string): void {
    const profilesDict = this.get() || {};
    if (profilesDict[id]) {
      delete profilesDict[id];
      this.set(profilesDict);
    }
  }
}

export const profileRepository = new ProfileRepository();
