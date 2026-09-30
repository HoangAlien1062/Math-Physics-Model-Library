import { StorageStatus, Subject } from '@/types';

export type { StorageStatus };

export interface StorageFileInfo {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface UploadModelOptions {
  modelId: string;
  subject: Subject;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}

export interface UploadResult {
  driveFileId: string;
  driveFolderId?: string;
  fileName: string;
  fileSize: number;
  provider: 'google_drive' | 'local_fallback';
}

export interface StorageProvider {
  name: string;
  isConfigured(): boolean;
  getStorageStatus(): Promise<StorageStatus>;
  getOrCreateSubjectFolder(subject: Subject): Promise<string>;
  uploadModel(options: UploadModelOptions): Promise<UploadResult>;
  getModelFile(driveFileId: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string } | null>;
  deleteModel(driveFileId: string, driveFolderId?: string): Promise<boolean>;
  listModelFiles(driveFolderId: string): Promise<StorageFileInfo[]>;
}
