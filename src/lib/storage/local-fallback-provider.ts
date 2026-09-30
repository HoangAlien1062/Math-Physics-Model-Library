import fs from 'fs';
import path from 'path';
import { StorageProvider, StorageStatus, StorageFileInfo, UploadModelOptions, UploadResult } from './storage-provider';
import { Subject } from '@/types';

export class LocalFallbackStorageProvider implements StorageProvider {
  name = 'Local Dev Storage Provider';
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), '.data', 'storage');
    this.ensureDirs();
  }

  private ensureDirs() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  isConfigured(): boolean {
    return true;
  }

  async getOrCreatePublicFolder(subject: Subject): Promise<string> {
    const dir = path.join(this.baseDir, 'Public Models', subject === 'math' ? 'Math' : 'Physics');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async getOrCreateUserFolder(userId: string, subject: Subject): Promise<string> {
    const dir = path.join(this.baseDir, 'User Uploads', `user_${userId}`, subject === 'math' ? 'Math' : 'Physics');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async uploadModel(options: UploadModelOptions): Promise<UploadResult> {
    const targetFolder = options.isPublic
      ? await this.getOrCreatePublicFolder(options.subject)
      : await this.getOrCreateUserFolder(options.userId, options.subject);

    const safeFileName = `${options.modelId}_${options.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(targetFolder, safeFileName);

    await fs.promises.writeFile(filePath, options.fileBuffer);

    // Save a small metadata descriptor beside it
    const metaPath = `${filePath}.meta.json`;
    await fs.promises.writeFile(
      metaPath,
      JSON.stringify(
        {
          modelId: options.modelId,
          userId: options.userId,
          subject: options.subject,
          fileName: options.fileName,
          mimeType: options.mimeType,
          uploadedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    return {
      driveFileId: safeFileName,
      driveFolderId: targetFolder,
      fileName: options.fileName,
      fileSize: options.fileBuffer.length,
      provider: 'local_fallback',
    };
  }

  async getModelFile(driveFileId: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string } | null> {
    // Search recursively in baseDir
    const findFile = (dir: string): string | null => {
      if (!fs.existsSync(dir)) return null;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const found = findFile(fullPath);
          if (found) return found;
        } else if (entry.name === driveFileId) {
          return fullPath;
        }
      }
      return null;
    };

    const filePath = findFile(this.baseDir);
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }

    const buffer = await fs.promises.readFile(filePath);
    let mimeType = 'application/octet-stream';
    if (driveFileId.endsWith('.html') || driveFileId.endsWith('.htm')) {
      mimeType = 'text/html';
    } else if (driveFileId.endsWith('.zip')) {
      mimeType = 'application/zip';
    }

    return {
      buffer,
      fileName: driveFileId,
      mimeType,
    };
  }

  async deleteModel(driveFileId: string): Promise<boolean> {
    const findAndUnlink = (dir: string): boolean => {
      if (!fs.existsSync(dir)) return false;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (findAndUnlink(fullPath)) return true;
        } else if (entry.name === driveFileId) {
          fs.unlinkSync(fullPath);
          if (fs.existsSync(`${fullPath}.meta.json`)) {
            fs.unlinkSync(`${fullPath}.meta.json`);
          }
          return true;
        }
      }
      return false;
    };

    return findAndUnlink(this.baseDir);
  }

  async listModelFiles(driveFolderId: string): Promise<StorageFileInfo[]> {
    if (!fs.existsSync(driveFolderId)) return [];

    const entries = fs.readdirSync(driveFolderId, { withFileTypes: true });
    const result: StorageFileInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.name.endsWith('.meta.json')) {
        const fullPath = path.join(driveFolderId, entry.name);
        const stat = fs.statSync(fullPath);
        result.push({
          fileId: entry.name,
          name: entry.name,
          size: stat.size,
          mimeType: entry.name.endsWith('.zip') ? 'application/zip' : 'text/html',
          createdTime: stat.birthtime.toISOString(),
          modifiedTime: stat.mtime.toISOString(),
        });
      }
    }
    return result;
  }

  async getStorageStatus(): Promise<StorageStatus> {
    let totalFiles = 0;
    let totalBytes = 0;

    const countDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) countDir(p);
        else if (!e.name.endsWith('.meta.json')) {
          totalFiles++;
          totalBytes += fs.statSync(p).size;
        }
      }
    };

    countDir(this.baseDir);

    return {
      provider: 'local_fallback',
      connected: true,
      adminEmail: 'local-admin-storage@math-physics.library',
      rootFolderId: 'local_root_data_storage',
      publicModelsCount: 5,
      userModelsCount: totalFiles,
      totalFilesCount: totalFiles + 5,
      totalSizeBytes: totalBytes,
      lastSyncAt: new Date().toISOString(),
    };
  }
}
