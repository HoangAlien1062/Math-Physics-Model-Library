import { StorageProvider } from './storage-provider';
import { VercelBlobStorageProvider } from './vercel-blob-provider';
import { GoogleDriveStorageProvider } from './google-drive-provider';
import { LocalFallbackStorageProvider } from './local-fallback-provider';

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  // 1. Priority 1: Vercel Blob (1-click on Vercel Dashboard, zero config needed)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobProvider = new VercelBlobStorageProvider();
      if (blobProvider.isConfigured()) {
        console.log('[Storage] Using Vercel Blob Storage Provider');
        cachedProvider = blobProvider;
        return blobProvider;
      }
    } catch (err) {
      console.warn('[Storage] Vercel Blob init error, falling back:', err);
    }
  }

  // 2. Priority 2: Google Drive
  const hasGoogleCreds = !!(
    (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) ||
    (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
  );

  if (hasGoogleCreds) {
    try {
      const gdrive = new GoogleDriveStorageProvider();
      if (gdrive.isConfigured()) {
        console.log('[Storage] Using Google Drive Storage Provider');
        cachedProvider = gdrive;
        return gdrive;
      }
    } catch (err) {
      console.warn('[Storage] Google Drive init failed, falling back to local storage provider:', err);
    }
  }

  // 3. Fallback: Local / Temp filesystem
  console.log('[Storage] Using Local Fallback Storage Provider');
  cachedProvider = new LocalFallbackStorageProvider();
  return cachedProvider;
}

export * from './storage-provider';
