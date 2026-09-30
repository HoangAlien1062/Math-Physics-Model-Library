import { StorageProvider } from './storage-provider';
import { GoogleDriveStorageProvider } from './google-drive-provider';
import { LocalFallbackStorageProvider } from './local-fallback-provider';

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const hasGoogleCreds = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );

  if (hasGoogleCreds) {
    try {
      const gdrive = new GoogleDriveStorageProvider();
      if (gdrive.isConfigured()) {
        console.log('[Storage] Using Google Drive Admin Storage Provider');
        cachedProvider = gdrive;
        return gdrive;
      }
    } catch (err) {
      console.warn('[Storage] Google Drive init failed, falling back to local storage provider:', err);
    }
  }

  console.log('[Storage] Using Local Fallback Storage Provider (.data/storage)');
  cachedProvider = new LocalFallbackStorageProvider();
  return cachedProvider;
}

export * from './storage-provider';
