import { getSupabaseClient } from '@/lib/supabase/client';
import { getStorageProvider } from './index';

const CACHE_BUCKET = 'models-cache';
const MAX_CACHE_SIZE_BYTES = 750 * 1024 * 1024; // 750 MB (safe headroom under 1GB free tier)

export class StorageCacheManager {
  private bucketInitialized = false;

  private async ensureBucket(): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    if (this.bucketInitialized) return true;

    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === CACHE_BUCKET);

      if (!exists) {
        await supabase.storage.createBucket(CACHE_BUCKET, {
          public: true,
          fileSizeLimit: 100 * 1024 * 1024, // 100MB per model
        });
      }
      this.bucketInitialized = true;
      return true;
    } catch (err) {
      console.warn('[Cache] Could not verify/create bucket:', err);
      return false;
    }
  }

  async getFile(
    cachePath?: string,
    driveFileId?: string
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string } | null> {
    const supabase = getSupabaseClient();

    // 1. Try reading from fast Supabase Cache
    if (supabase && cachePath) {
      try {
        const { data, error } = await supabase.storage
          .from(CACHE_BUCKET)
          .download(cachePath);

        if (!error && data) {
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileName = cachePath.split('/').pop() || 'model.html';
          const mimeType = data.type || (fileName.endsWith('.zip') ? 'application/zip' : 'text/html');

          return { buffer, fileName, mimeType };
        }
      } catch (cacheErr) {
        console.warn('[Cache] Cache miss or error reading from Supabase Storage:', cacheErr);
      }
    }

    // 2. Cache miss or evicted -> Pull from Master Google Drive
    if (driveFileId) {
      const storage = getStorageProvider();
      const stored = await storage.getModelFile(driveFileId);

      if (stored) {
        // Asynchronously re-cache into Supabase Storage for fast future opens
        if (supabase && cachePath) {
          this.putFile(cachePath, stored.buffer, stored.mimeType).catch((e) =>
            console.warn('[Cache] Re-cache error:', e)
          );
        }
        return stored;
      }
    }

    return null;
  }

  async putFile(
    cachePath: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      await this.ensureBucket();

      // Check cache size and evict oldest if getting full (> 750MB)
      await this.evictOldCacheIfNeeded(fileBuffer.length);

      const { data, error } = await supabase.storage
        .from(CACHE_BUCKET)
        .upload(cachePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.warn('[Cache] Error uploading to Supabase Storage:', error);
        return null;
      }

      return data?.path || cachePath;
    } catch (err) {
      console.warn('[Cache] Upload error:', err);
      return null;
    }
  }

  async deleteFile(cachePath: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase || !cachePath) return false;

    try {
      await supabase.storage.from(CACHE_BUCKET).remove([cachePath]);
      return true;
    } catch {
      return false;
    }
  }

  // LRU Eviction: Removes oldest files from cache if approaching 750MB
  private async evictOldCacheIfNeeded(incomingBytes: number): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: files } = await supabase.storage.from(CACHE_BUCKET).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'asc' }, // Oldest first
      });

      if (!files || files.length === 0) return;

      let totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);

      if (totalSize + incomingBytes > MAX_CACHE_SIZE_BYTES) {
        console.log(`[Cache] Storage high (${Math.round(totalSize / (1024 * 1024))}MB). Evicting oldest files...`);
        const filesToDelete: string[] = [];

        for (const file of files) {
          if (totalSize + incomingBytes <= MAX_CACHE_SIZE_BYTES * 0.8) break; // Free up to 80%
          filesToDelete.push(file.name);
          totalSize -= file.metadata?.size || 0;
        }

        if (filesToDelete.length > 0) {
          await supabase.storage.from(CACHE_BUCKET).remove(filesToDelete);
          console.log(`[Cache] Evicted ${filesToDelete.length} files from Supabase cache.`);
        }
      }
    } catch (e) {
      console.warn('[Cache] Eviction check failed:', e);
    }
  }
}

export const cacheManager = new StorageCacheManager();
