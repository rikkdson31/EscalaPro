export * from './StorageProvider';
export * from './LocalStorageProvider';
export * from './EscalaProDB';
export * from './IndexedDBProvider';

import { indexedDBProvider } from './IndexedDBProvider';

// Export indexedDBProvider as the default storageProvider instance for the application
export const storageProvider = indexedDBProvider;
