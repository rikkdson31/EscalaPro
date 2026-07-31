import { BaseRepository } from './BaseRepository';
import { ScheduleConfig } from '../engine/types';

export class ScheduleRepository extends BaseRepository<ScheduleConfig> {
  constructor() {
    super('schedules');
  }

  public getByProfile(profileId: string): ScheduleConfig | null {
    return this.get(profileId);
  }

  public save(profileId: string, config: ScheduleConfig): void {
    this.set(config, profileId);
  }
}

export const scheduleRepository = new ScheduleRepository();
