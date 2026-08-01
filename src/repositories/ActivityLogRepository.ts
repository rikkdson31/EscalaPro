import { BaseRepository } from './BaseRepository';
export class ActivityLogRepository extends BaseRepository<any[]> {
  constructor() {
    super('activity_log');
  }
  public getAllByProfile(profileId: string): any[] {
    return this.get(profileId) || [];
  }
  public save(profileId: string, records: any[]): void {
    this.set(records, profileId);
  }
}
export const activityLogRepository = new ActivityLogRepository();
