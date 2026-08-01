import { supabase } from './SupabaseClient';

/**
 * Encapsulates Supabase SDK logic.
 * Contains auth, upload, download, db, storage, realtime.
 * No business logic.
 */
export class CloudProvider {
  // Database
  public get from() {
    return supabase.from.bind(supabase);
  }

  // Auth
  public get auth() {
    return supabase.auth;
  }

  // Storage
  public get storage() {
    return supabase.storage;
  }

  // Realtime / Channels
  public get channel() {
    return supabase.channel.bind(supabase);
  }
}

export const cloudProvider = new CloudProvider();
