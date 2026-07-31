import Dexie, { Table } from 'dexie';

export class EscalaProDatabase extends Dexie {
  profiles!: Table<any, string>;
  timeRecords!: Table<any, string>;
  schedules!: Table<any, string>;
  pendingItems!: Table<any, string>;
  settings!: Table<any, string>;
  futureSyncQueue!: Table<any, string>;

  constructor() {
    super('EscalaProDB');
    this.version(1).stores({
      profiles: 'id',
      timeRecords: 'id, profileId, date',
      schedules: 'id, profileId',
      pendingItems: 'id, profileId',
      settings: 'id',
      futureSyncQueue: 'id'
    });
  }
}

export const db = new EscalaProDatabase();
