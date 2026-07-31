export interface StorageProvider {
  get<T>(key: string): T | null;
  getRaw(key: string): string | null;
  set<T>(key: string, value: T): void;
  setRaw(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
  exists(key: string): boolean;
  keys(): string[];
}
