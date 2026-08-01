import { BaseRepository } from './BaseRepository';
export class DevicesRepository extends BaseRepository<any[]> {
  constructor() {
    super('devices');
  }
  public getAllByProfile(profileId: string): any[] {
    return this.get(profileId) || [];
  }
  public save(profileId: string, records: any[]): void {
    this.set(records, profileId);
  }
}
export const devicesRepository = new DevicesRepository();
