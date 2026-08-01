import { cloudSyncEngine } from './CloudSyncEngine';

export enum SyncOperation {
  UPSERT = 'UPSERT',
  DELETE = 'DELETE'
}

export interface SyncEvent {
  id: string;
  entityName: string;
  operation: SyncOperation;
  entityId: string;
  payload?: any;
  timestamp: string;
}

/**
 * SyncDispatcher receives events from Repositories, registers mutations, 
 * and feeds the FutureSyncQueue.
 */
class SyncDispatcher {
  
  public dispatch(entityName: string, operation: SyncOperation, entityId: string, payload?: any) {
    const event: SyncEvent = {
      id: this.generateId(),
      entityName,
      operation,
      entityId,
      payload,
      timestamp: new Date().toISOString()
    };

    // Feeds the FutureSyncQueue
    cloudSyncEngine.enqueue(event);
  }

  private generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const syncDispatcher = new SyncDispatcher();
