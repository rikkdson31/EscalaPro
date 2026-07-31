import { StorageProvider } from './providers/StorageProvider';
import { localStorageProvider } from './providers/LocalStorageProvider';

export abstract class BaseRepository<T> {
  protected provider: StorageProvider;
  protected collectionName: string;

  constructor(collectionName: string, provider: StorageProvider = localStorageProvider) {
    this.provider = provider;
    this.collectionName = collectionName;
  }

  // Future common methods (getById, save, etc.) would go here
  // Right now, this just establishes the architectural base.
}
