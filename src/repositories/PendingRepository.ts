import { BaseRepository } from './BaseRepository';
import { PendingItem } from '../types';

export class PendingRepository extends BaseRepository<PendingItem[]> {
  constructor() {
    super('pending_items');
  }

  public getAllByProfile(profileId: string): PendingItem[] {
    return this.get(profileId) || [];
  }

  public save(profileId: string, items: PendingItem[]): void {
    this.set(items, profileId);
  }
}

export const pendingRepository = new PendingRepository();
