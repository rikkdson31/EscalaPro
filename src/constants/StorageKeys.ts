export const StorageKeys = {
  ACTIVE_PROFILE: 'activeProfile',
  PROFILES: 'profiles',
  APP_STORAGE_V2: 'escalapro_storage_v2', // For backward compatibility / migration if needed
  OLD_CONFIG: 'escalapro_config', // For backward compatibility / migration if needed
  
  // Per-profile keys
  CONFIG: 'config',
  RECENT_MESSAGES: 'assistantRecentMessages',
  LAST_SHOWN_DATE: 'assistantLastShownDate',
  FAVORITES: 'assistantFavorites',
  STATS: 'assistantStats',
  TIME_RECORDS: 'timeRecords',
  PENDING_ITEMS: 'pendingItems',
} as const;
