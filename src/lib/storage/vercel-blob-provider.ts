import { put, del, list } from '@vercel/blob';
import {
  StorageProvider,
  StorageStatus,
  UploadModelOptions,
  UploadResult,
  StorageFileInfo,
} from './storage-provider';
import { Subject } from '@/types';

export class VercelBlobStorageProvider implements StorageProvider {
  name = 'Vercel Blob Storage';

  isConfigured(): boolean {
    return !!process.env.BLOB_READ_WRITE_TOKEN;
  }

  async getStorageStatus(): Promise<StorageStatus> {
    if (!this.isConfigured()) {
      return {
        provider: 'vercel_blob',
        connected: false,
        totalModelsCount: 0,
        totalFilesCount: 0,
        totalSizeBytes: 0,
        lastSyncAt: new Date().toISOString(),
      };
    }

    try {
      const { blobs } = await list({ prefix: 'models/' });
      const totalSizeBytes = blobs.reduce((acc, b) => acc + b.size, 0);

      return {
        provider: 'vercel_blob',
        connected: true,
        adminEmail: 'Vercel Blob Store',
        rootFolderId: 'models/',
        totalModelsCount: blobs.length,
        totalFilesCount: blobs.length,
        totalSizeBytes,
        lastSyncAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Failed to fetch Vercel Blob status:', error);
      return {
        provider: 'vercel_blob',
        connected: false,
        totalModelsCount: 0,
        totalFilesCount: 0,
        totalSizeBytes: 0,
        lastSyncAt: new Date().toISOString(),
      };
    }
  }

  async getOrCreateSubjectFolder(subject: Subject): Promise<string> {
    return `models/${subject}`;
  }

  async uploadModel(options: UploadModelOptions): Promise<UploadResult> {
    const cleanFileName = options.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `models/${options.subject}/${options.modelId}-${cleanFileName}`;

    const blob = await put(pathname, options.fileBuffer, {
      access: 'public',
      contentType: options.mimeType,
      addRandomSuffix: false,
    });

    return {
      driveFileId: blob.url,
      driveFolderId: `models/${options.subject}`,
      fileName: options.fileName,
      fileSize: options.fileBuffer.length,
      provider: 'vercel_blob',
    };
  }

  async getModelFile(
    driveFileId: string
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string } | null> {
    if (!driveFileId || !driveFileId.startsWith('http')) {
      return null;
    }

    try {
      const response = await fetch(driveFileId);
      if (!response.ok) {
        console.error(`Failed to download blob file: ${response.status} ${response.statusText}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = driveFileId.split('/').pop()?.split('?')[0] || 'model.html';
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';

      return {
        buffer,
        fileName,
        mimeType,
      };
    } catch (error) {
      console.error('Error fetching file from Vercel Blob:', error);
      return null;
    }
  }

  async deleteModel(driveFileId: string, _driveFolderId?: string): Promise<boolean> {
    if (!driveFileId || !driveFileId.startsWith('http')) {
      return false;
    }

    try {
      await del(driveFileId);
      return true;
    } catch (error) {
      console.warn('Failed to delete blob from Vercel Blob:', error);
      return false;
    }
  }

  async listModelFiles(driveFolderId: string): Promise<StorageFileInfo[]> {
    try {
      const { blobs } = await list({ prefix: driveFolderId });
      return blobs.map((b) => ({
        fileId: b.url,
        name: b.pathname.split('/').pop() || b.pathname,
        size: b.size,
        mimeType: 'application/octet-stream',
        createdTime: b.uploadedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error listing files from Vercel Blob:', error);
      return [];
    }
  }
}
