import { StorageProvider } from './providers/StorageProvider';
import { storageProvider } from './providers';

export abstract class BaseRepository<T> {
  protected provider: StorageProvider;
  protected collectionName: string;

  constructor(collectionName: string, provider: StorageProvider = storageProvider) {
    this.provider = provider;
    this.collectionName = collectionName;
  }
  
  protected getKey(profileId?: string): string {
    return profileId ? `${this.collectionName}_${profileId}` : this.collectionName;
  }
  
  public get(profileId?: string): T | null {
    return this.provider.get<T>(this.getKey(profileId));
  }
  
  public set(data: T, profileId?: string): void {
    this.provider.set(this.getKey(profileId), data);
  }
  
  public remove(profileId?: string): void {
    this.provider.remove(this.getKey(profileId));
  }
}
