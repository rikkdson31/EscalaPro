import { StorageProvider } from './providers/StorageProvider';
import { storageProvider } from './providers';
import { syncDispatcher, SyncOperation } from '../cloud/SyncDispatcher';

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
    
    // Dispatch sync event
    syncDispatcher.dispatch(
      this.collectionName, 
      SyncOperation.UPSERT, 
      profileId || 'global',
      data
    );
  }
  
  public remove(profileId?: string): void {
    this.provider.remove(this.getKey(profileId));
    
    // Dispatch sync event
    syncDispatcher.dispatch(
      this.collectionName, 
      SyncOperation.DELETE, 
      profileId || 'global'
    );
  }
}
