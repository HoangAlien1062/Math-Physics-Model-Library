export type Subject = 'math' | 'physics';

export interface Category {
  id: string;
  subject: Subject;
  slug: string;
  name: string;
  icon?: string;
  orderIndex: number;
}

export type ModelFileType = 'html' | 'zip';
export type ModelStatus = 'ready' | 'pending' | 'uploading' | 'processing' | 'failed' | 'deleted';

export interface Model {
  id: string;
  title: string;
  slug: string;
  description: string;
  subject: Subject;
  category: string;
  thumbnailUrl?: string;
  driveFileId: string;
  driveFolderId?: string;
  entryFile: string;
  fileType: ModelFileType;
  fileSize?: number;
  version: string;
  status: ModelStatus;
  tags: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  modelId: string;
  createdAt: string;
}

export interface RecentView {
  id: string;
  modelId: string;
  lastOpenedAt: string;
}

export interface StorageStatus {
  provider: 'google_drive' | 'local_fallback';
  connected: boolean;
  adminEmail?: string;
  rootFolderId?: string;
  totalModelsCount: number;
  totalFilesCount: number;
  totalSizeBytes?: number;
  lastSyncAt: string;
}

export interface ModelManifest {
  title?: string;
  subject?: Subject;
  category?: string;
  description?: string;
  entry?: string;
  version?: string;
  tags?: string[];
  author?: string;
}
