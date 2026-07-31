const fs = require('fs');

const content = `import { StorageProvider } from './StorageProvider';
import { db } from './EscalaProDB';
import { localStorageProvider } from './LocalStorageProvider';

export class IndexedDBProvider implements StorageProvider {
  private cache: Record<string, string> = {};
  private isReady = false;
  private dbFailed = false;

  constructor() {
    for (const key of localStorageProvider.keys()) {
      const val = localStorageProvider.getRaw(key);
      if (val) {
        this.cache[key] = val;
      }
    }
    this.initAsync();
  }

  private async initAsync() {
    try {
      await db.open();
      this.isReady = true;
    } catch (e) {
      console.warn("IndexedDB initialization failed. Falling back to LocalStorage.", e);
      this.dbFailed = true;
    }
  }

  public get<T>(key: string): T | null {
    const val = this.getRaw(key);
    if (!val) return null;
    try { return JSON.parse(val) as T; } catch { return null; }
  }

  public getRaw(key: string): string | null {
    if (this.dbFailed) {
      return localStorageProvider.getRaw(key);
    }
    return this.cache[key] || null;
  }

  public set<T>(key: string, value: T): void {
    const toSave = typeof value === 'string' ? value : JSON.stringify(value);
    this.setRaw(key, toSave);
  }

  public setRaw(key: string, value: string): void {
    this.cache[key] = value;
    localStorageProvider.setRaw(key, value);
    if (!this.dbFailed) {
      this.saveToDB(key, value).catch(e => {
        console.warn("IndexedDB write failed.", e);
        this.dbFailed = true;
      });
    }
  }

  private async saveToDB(key: string, value: string) {
    await db.settings.put({ id: key, value });
  }

  public remove(key: string): void {
    delete this.cache[key];
    localStorageProvider.remove(key);
    if (!this.dbFailed) {
      db.settings.delete(key).catch(() => { this.dbFailed = true; });
    }
  }

  public clear(): void {
    this.cache = {};
    localStorageProvider.clear();
    if (!this.dbFailed) {
      db.profiles.clear().catch(() => {});
      db.timeRecords.clear().catch(() => {});
      db.schedules.clear().catch(() => {});
      db.pendingItems.clear().catch(() => {});
      db.settings.clear().catch(() => {});
      db.futureSyncQueue.clear().catch(() => {});
    }
  }

  public exists(key: string): boolean {
    if (this.dbFailed) {
       return localStorageProvider.exists(key);
    }
    return this.cache[key] !== undefined;
  }

  public keys(): string[] {
    if (this.dbFailed) {
       return localStorageProvider.keys();
    }
    return Object.keys(this.cache);
  }
}

export const indexedDBProvider = new IndexedDBProvider();
`;

fs.writeFileSync('src/repositories/providers/IndexedDBProvider.ts', content);
console.log('Patched IndexedDBProvider.');
