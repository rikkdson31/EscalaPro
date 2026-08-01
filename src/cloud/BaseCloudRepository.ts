import { cloudProvider } from './CloudProvider';

/**
 * BaseCloudRepository handles generic CRUD operations to Supabase
 * and conversion between local and remote entities.
 * Does not know about UI, components, or specific domain logic.
 */
export abstract class BaseCloudRepository<LocalT, RemoteT> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected abstract toRemote(local: LocalT): RemoteT;
  protected abstract toLocal(remote: RemoteT): LocalT;

  public async fetchAll(userId: string): Promise<LocalT[]> {
    const { data, error } = await cloudProvider.from(this.tableName)
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    if (!data) return [];

    return data.map(item => this.toLocal(item as unknown as RemoteT));
  }

  public async upsert(item: LocalT): Promise<void> {
    const remoteData = this.toRemote(item);
    const { error } = await cloudProvider.from(this.tableName).upsert(remoteData);
    if (error) throw error;
  }

  public async delete(id: string): Promise<void> {
    const { error } = await cloudProvider.from(this.tableName).delete().eq('id', id);
    if (error) throw error;
  }
}
