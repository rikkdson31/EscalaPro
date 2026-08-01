import { BaseRepository } from './BaseRepository';
export class OccurrencesRepository extends BaseRepository<any[]> {
  constructor() {
    super('occurrences');
  }
  public getAllByProfile(profileId: string): any[] {
    return this.get(profileId) || [];
  }
  public save(profileId: string, records: any[]): void {
    this.set(records, profileId);
  }
}
export const occurrencesRepository = new OccurrencesRepository();
