import { BaseRepository } from './BaseRepository';
import { TimeRecord } from '../types';

export class TimeRecordRepository extends BaseRepository<TimeRecord[]> {
  constructor() {
    super('time_records');
  }

  public getAllByProfile(profileId: string): TimeRecord[] {
    return this.get(profileId) || [];
  }

  public getByDate(profileId: string, dateStr: string): TimeRecord[] {
    const all = this.getAllByProfile(profileId);
    return all.filter(r => r.date === dateStr);
  }

  public save(profileId: string, records: TimeRecord[]): void {
    this.set(records, profileId);
  }

  public add(profileId: string, record: TimeRecord): void {
    const all = this.getAllByProfile(profileId);
    all.push(record);
    this.save(profileId, all);
  }
}

export const timeRecordRepository = new TimeRecordRepository();
