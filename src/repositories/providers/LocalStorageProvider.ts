import { StorageProvider } from './StorageProvider';

export class LocalStorageProvider implements StorageProvider {
  public get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch (e) {
        return item as unknown as T;
      }
    } catch (e) {
      console.warn(`Failed to parse key ${key} from localStorage`, e);
      return null;
    }
  }

  public getRaw(key: string): string | null {
    return localStorage.getItem(key);
  }

  public set<T>(key: string, value: T): void {
    try {
      const toSave = JSON.stringify(value);
      localStorage.setItem(key, toSave);
    } catch (e) {
      console.error(`Error saving ${key} to localStorage`, e);
    }
  }

  public setRaw(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  public clear(): void {
    localStorage.clear();
  }

  public exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  public keys(): string[] {
    return Object.keys(localStorage);
  }
}

export const localStorageProvider = new LocalStorageProvider();
