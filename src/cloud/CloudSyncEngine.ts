import { SyncEvent } from './SyncDispatcher';
import { db } from '../repositories/providers/EscalaProDB';
import { localStorageProvider } from '../repositories/providers/LocalStorageProvider';
import { supabase } from './SupabaseClient';

/**
 * CloudSyncEngine handles the background synchronization queue.
 */
class CloudSyncEngine {
  private isRunning = false;
  private intervalId: any = null;
  private isProcessing = false;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Listen to network events
    window.addEventListener('online', () => this.processQueue());
    
    this.intervalId = setInterval(() => this.processQueue(), 10000);
    this.processQueue();
  }

  public stop() {
    this.isRunning = false;
    window.removeEventListener('online', () => this.processQueue());
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async enqueue(event: SyncEvent) {
    try {
      if (db.isOpen()) {
        await db.futureSyncQueue.put(event);
      } else {
        this.fallbackEnqueue(event);
      }
    } catch (e) {
      console.warn('Failed to enqueue to IndexedDB, falling back to LocalStorage', e);
      this.fallbackEnqueue(event);
    }

    if (this.isRunning && navigator.onLine) {
      this.processQueue();
    }
  }

  private fallbackEnqueue(event: SyncEvent) {
    try {
      const raw = localStorageProvider.getRaw('futureSyncQueue') || '[]';
      const queue = JSON.parse(raw);
      queue.push(event);
      localStorageProvider.setRaw('futureSyncQueue', JSON.stringify(queue));
    } catch(e) {
      console.error('Failed to fallback enqueue', e);
    }
  }

  public async processQueue() {
    if (this.isProcessing || !navigator.onLine) return;
    
    // Check authentication
    const { data } = await supabase.auth.getSession();
    if (!data.session) return; // Cannot sync without user_id due to RLS

    const userId = data.session.user.id;
    this.isProcessing = true;

    try {
      let events: SyncEvent[] = [];
      if (db.isOpen()) {
        events = await db.futureSyncQueue.toArray();
      } else {
        const raw = localStorageProvider.getRaw('futureSyncQueue') || '[]';
        events = JSON.parse(raw);
      }

      for (const event of events) {
        let success = false;
        try {
          success = await this.syncEvent(event, userId);
        } catch (err) {
          console.error('Error syncing event', event, err);
          // Stop processing further events to maintain order, or retry later
          break; 
        }

        if (success) {
          await this.removeEvent(event.id);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async syncEvent(event: SyncEvent, userId: string): Promise<boolean> {
    const tableName = this.mapCollectionToTable(event.entityName);
    if (!tableName) return true; // Ignore unknown collections (e.g. activeProfile)

    if (event.operation === 'DELETE') {
      const { error } = await supabase.from(tableName).delete().eq('id', event.entityId);
      if (error) throw error;
      return true;
    }

    if (event.operation === 'UPSERT') {
      const remotePayload = this.mapPayloadToRemote(event.entityName, event.payload, userId, event.entityId);
      const { error } = await supabase.from(tableName).upsert(remotePayload);
      if (error) throw error;
      return true;
    }

    return true;
  }

  private async removeEvent(eventId: string) {
    if (db.isOpen()) {
      await db.futureSyncQueue.delete(eventId);
    } else {
      const raw = localStorageProvider.getRaw('futureSyncQueue') || '[]';
      const queue = JSON.parse(raw).filter((e: any) => e.id !== eventId);
      localStorageProvider.setRaw('futureSyncQueue', JSON.stringify(queue));
    }
  }

  private mapCollectionToTable(collection: string): string | null {
    const mapping: Record<string, string> = {
      'profiles': 'profiles',
      'config': 'settings',
      'schedules': 'schedules',
      'timeRecords': 'time_records',
      'pendingItems': 'pending_items'
    };
    return mapping[collection] || null;
  }

  private mapPayloadToRemote(collection: string, payload: any, userId: string, entityId: string): any {
    // Determine profile_id (usually the payload has it, or entityId has it)
    // Local keys are often "{collectionName}_{profileId}" for things like config/timeRecords
    // However, the payload itself often doesn't have profileId for settings
    let profileId = payload.profileId || payload.id;
    if (collection === 'config' || collection === 'timeRecords' || collection === 'pendingItems') {
      if (entityId.includes('_')) {
         profileId = entityId.split('_')[1];
      }
    }

    if (collection === 'profiles') {
      return {
        id: payload.id,
        user_id: userId,
        nome: payload.nome,
        apelido: payload.apelido,
        matricula: payload.matricula,
        cargo: payload.cargo,
        foto_url: payload.foto,
        created_at: payload.dataCriacao || new Date().toISOString(),
        updated_at: payload.ultimaAtualizacao || new Date().toISOString()
      };
    }
    
    if (collection === 'schedules') {
      return {
        id: payload.id || entityId,
        user_id: userId,
        profile_id: profileId,
        empresa: payload.empresa,
        cliente: payload.cliente,
        tipo_escala: payload.tipoEscala,
        turma: payload.turma,
        entrada: payload.entrada,
        saida: payload.saida,
        reference_date: payload.referenceDate,
        reference_cycle_day: payload.referenceCycleDay,
        updated_at: new Date().toISOString()
      };
    }

    if (collection === 'config') {
      // In local storage, settings are saved under `config_${profileId}` and it's a map of keys
      // Actually settings repository saves each key individually or all at once?
      // Wait, let's just dump it into config_value
      return {
        id: entityId,
        user_id: userId,
        profile_id: profileId,
        config_key: 'general',
        config_value: payload,
        updated_at: new Date().toISOString()
      };
    }

    if (collection === 'timeRecords') {
      return {
        id: payload.id,
        user_id: userId,
        profile_id: profileId,
        date: payload.date,
        status: payload.status,
        observations: payload.observations,
        entries: payload.entries || [],
        justificativa: payload.justificativa,
        created_at: payload.createdAt || new Date().toISOString(),
        updated_at: payload.updatedAt || new Date().toISOString()
      };
    }

    if (collection === 'pendingItems') {
      return {
        id: payload.id,
        user_id: userId,
        profile_id: profileId,
        time_record_id: payload.timeRecordId,
        type: payload.type,
        status: payload.status,
        priority: payload.priority,
        title: payload.title,
        description: payload.description,
        recommendation: payload.recommendation,
        notes: payload.notes,
        resolved_at: payload.resolvedAt,
        due_date: payload.dueDate,
        created_at: payload.createdAt || new Date().toISOString(),
        updated_at: payload.updatedAt || new Date().toISOString()
      };
    }

    return { ...payload, user_id: userId };
  }

  public async retry() {
    this.processQueue();
  }
}

export const cloudSyncEngine = new CloudSyncEngine();
