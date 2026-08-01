import { cloudProvider } from './CloudProvider';

/**
 * Encapsulates the Supabase storage buckets structure.
 * No uploads or downloads implemented yet.
 */
export class CloudStorage {
  private readonly BUCKET_BACKUPS = 'backups';
  private readonly BUCKET_AVATARS = 'avatars';

  public getBackupsBucket() {
    return cloudProvider.storage.from(this.BUCKET_BACKUPS);
  }

  public getAvatarsBucket() {
    return cloudProvider.storage.from(this.BUCKET_AVATARS);
  }

  // Example placeholder for future implementation
  public async uploadBackup(userId: string, filename: string, file: Blob) {
    // await this.getBackupsBucket().upload(`${userId}/${filename}`, file);
  }

  public async uploadAvatar(userId: string, file: Blob) {
    // await this.getAvatarsBucket().upload(`${userId}/avatar.png`, file);
  }
}

export const cloudStorage = new CloudStorage();
