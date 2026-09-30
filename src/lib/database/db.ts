import fs from 'fs';
import path from 'path';
import os from 'os';
import { Category, Favorite, Model, RecentView, Subject } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getStorageProvider } from '@/lib/storage';
import { GoogleDriveStorageProvider } from '@/lib/storage/google-drive-provider';

// Helper to prevent any external cloud query from blocking the serverless function
async function withTimeout<T = any>(promiseOrThenable: any, timeoutMs = 2500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Cloud DB query timed out')), timeoutMs);
  });
  try {
    return await Promise.race([Promise.resolve(promiseOrThenable), timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// Seeded categories for Math and Physics
export const DEFAULT_CATEGORIES: Category[] = [
  // Math
  { id: 'cat-math-1', subject: 'math', slug: 'dai-so', name: 'Đại số', orderIndex: 1 },
  { id: 'cat-math-2', subject: 'math', slug: 'giai-tich', name: 'Giải tích', orderIndex: 2 },
  { id: 'cat-math-3', subject: 'math', slug: 'hinh-hoc', name: 'Hình học', orderIndex: 3 },
  { id: 'cat-math-4', subject: 'math', slug: 'hinh-hoc-khong-gian', name: 'Hình học không gian', orderIndex: 4 },
  { id: 'cat-math-5', subject: 'math', slug: 'xac-suat', name: 'Xác suất', orderIndex: 5 },
  { id: 'cat-math-6', subject: 'math', slug: 'thong-ke', name: 'Thống kê', orderIndex: 6 },
  { id: 'cat-math-7', subject: 'math', slug: 'ham-so', name: 'Hàm số', orderIndex: 7 },
  { id: 'cat-math-8', subject: 'math', slug: 'vector', name: 'Vector', orderIndex: 8 },
  { id: 'cat-math-9', subject: 'math', slug: 'oxyz', name: 'Oxyz', orderIndex: 9 },
  { id: 'cat-math-10', subject: 'math', slug: 'mo-hinh-truc-quan', name: 'Mô hình trực quan', orderIndex: 10 },
  { id: 'cat-math-11', subject: 'math', slug: 'khac', name: 'Khác', orderIndex: 11 },

  // Physics
  { id: 'cat-phy-1', subject: 'physics', slug: 'co-hoc', name: 'Cơ học', orderIndex: 1 },
  { id: 'cat-phy-2', subject: 'physics', slug: 'nhiet-hoc', name: 'Nhiệt học', orderIndex: 2 },
  { id: 'cat-phy-3', subject: 'physics', slug: 'dien-hoc', name: 'Điện học', orderIndex: 3 },
  { id: 'cat-phy-4', subject: 'physics', slug: 'dien-xoay-chieu', name: 'Điện xoay chiều', orderIndex: 4 },
  { id: 'cat-phy-5', subject: 'physics', slug: 'dao-dong', name: 'Dao động', orderIndex: 5 },
  { id: 'cat-phy-6', subject: 'physics', slug: 'song', name: 'Sóng', orderIndex: 6 },
  { id: 'cat-phy-7', subject: 'physics', slug: 'quang-hoc', name: 'Quang học', orderIndex: 7 },
  { id: 'cat-phy-8', subject: 'physics', slug: 'vat-ly-hien-dai', name: 'Vật lý hiện đại', orderIndex: 8 },
  { id: 'cat-phy-9', subject: 'physics', slug: 'mo-phong-thi-nghiem', name: 'Mô phỏng thí nghiệm', orderIndex: 9 },
  { id: 'cat-phy-10', subject: 'physics', slug: 'mo-hinh-truc-quan', name: 'Mô hình trực quan', orderIndex: 10 },
  { id: 'cat-phy-11', subject: 'physics', slug: 'khac', name: 'Khác', orderIndex: 11 },
];

// Library models (Clean personal library, no hardcoded demos)
export const DEFAULT_MODELS: Model[] = [];

interface DataStore {
  categories: Category[];
  models: Model[];
  favorites: string[];
  recentViews: RecentView[];
  deletedIds: string[];
}

function mapDbRowToModel(row: any): Model {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    subject: row.subject,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    driveFileId: row.drive_file_id,
    driveFolderId: row.drive_folder_id,
    cachePath: row.cache_path,
    entryFile: row.entry_file || 'index.html',
    fileType: row.file_type || 'html',
    fileSize: row.file_size,
    version: row.version || '1.0.0',
    status: row.status || 'ready',
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: row.featured,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

class DatabaseManager {
  private dataFilePath: string;
  private data: DataStore;

  constructor() {
    let dataDir: string;
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      dataDir = path.join(os.tmpdir(), 'math-physics-data');
    } else {
      try {
        const local = path.join(process.cwd(), '.data');
        if (!fs.existsSync(local)) {
          fs.mkdirSync(local, { recursive: true });
        }
        dataDir = local;
      } catch {
        dataDir = path.join(os.tmpdir(), 'math-physics-data');
      }
    }

    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Could not create data directory:', e);
    }

    this.dataFilePath = path.join(dataDir, 'db.json');
    this.data = this.loadLocalData();
  }

  private sanitizeModels(models: any[]): Model[] {
    if (!Array.isArray(models)) return [];
    return models.filter((m) => {
      if (!m || typeof m !== 'object') return false;
      const id = String(m.id || '');
      const driveFileId = String(m.driveFileId || '');
      if (id.startsWith('demo-') || driveFileId.startsWith('demo_')) return false;
      return true;
    });
  }

  private loadLocalData(): DataStore {
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
          models: this.sanitizeModels(parsed.models),
          favorites: Array.isArray(parsed.favorites)
            ? parsed.favorites.filter((fid: string) => !fid.startsWith('demo-'))
            : [],
          recentViews: Array.isArray(parsed.recentViews)
            ? parsed.recentViews.filter((r: any) => !r.modelId?.startsWith('demo-'))
            : [],
          deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
        };
      } catch (err) {
        console.error('Failed to read db.json, using defaults:', err);
      }
    }

    return {
      categories: DEFAULT_CATEGORIES,
      models: [],
      favorites: [],
      recentViews: [],
      deletedIds: [],
    };
  }

  private cloudSynced = false;

  async syncFromCloudStorage(): Promise<void> {
    if (this.cloudSynced) return;

    // 1. Fast Layer: Supabase Storage (Global CDN - takes ~50ms, super smooth & fast)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase.storage.from('models-cache').download('metadata/db.json'),
          1500
        );

        if (!error && data) {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.models)) {
              this.data.models = this.sanitizeModels(parsed.models);
            }
            if (Array.isArray(parsed.deletedIds)) {
              this.data.deletedIds = parsed.deletedIds;
            }
            if (Array.isArray(parsed.favorites)) {
              this.data.favorites = parsed.favorites.filter((fid: string) => !fid.startsWith('demo-'));
            }
            if (Array.isArray(parsed.recentViews)) {
              this.data.recentViews = parsed.recentViews.filter((r: any) => !r.modelId?.startsWith('demo-'));
            }
            this.saveLocalData(this.data, false);
            this.cloudSynced = true;
            return;
          }
        }
      } catch (e) {
        // Fallback to Google Drive if Supabase cache miss
      }
    }

    // 2. Master Backup Layer: Google Drive (Permanent source of truth)
    try {
      const storage = getStorageProvider();
      if (storage instanceof GoogleDriveStorageProvider && storage.isConfigured()) {
        const driveJson = await withTimeout(storage.getDbJson(), 4000);
        if (driveJson) {
          const parsed = JSON.parse(driveJson);
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.models)) {
              this.data.models = this.sanitizeModels(parsed.models);
            }
            if (Array.isArray(parsed.deletedIds)) {
              this.data.deletedIds = parsed.deletedIds;
            }
            if (Array.isArray(parsed.favorites)) {
              this.data.favorites = parsed.favorites.filter((fid: string) => !fid.startsWith('demo-'));
            }
            if (Array.isArray(parsed.recentViews)) {
              this.data.recentViews = parsed.recentViews.filter((r: any) => !r.modelId?.startsWith('demo-'));
            }
            this.saveLocalData(this.data, false);
            this.cloudSynced = true;
            return;
          }
        } else {
          // If no db.json yet, scan Google Drive Math and Physics folders for user uploaded files
          const driveModels = await withTimeout(storage.scanDriveModels(), 5000);
          if (driveModels && driveModels.length > 0) {
            this.data.models = this.sanitizeModels(driveModels);
            this.saveLocalData(this.data, true);
            this.cloudSynced = true;
            return;
          }
        }
      }
    } catch (driveErr) {
      console.warn('[DB] Google Drive sync note:', driveErr);
    }

    this.cloudSynced = true;
  }

  private saveLocalData(data: DataStore, syncToCloud = true) {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Filesystem save note:', err);
    }

    if (syncToCloud) {
      this.saveToCloudStorage(data).catch(() => {});
    }
  }

  private async saveToCloudStorage(data: DataStore): Promise<void> {
    const jsonStr = JSON.stringify(data, null, 2);

    // 1. Google Drive (Always syncs between Vercel lambdas)
    try {
      const storage = getStorageProvider();
      if (storage instanceof GoogleDriveStorageProvider && storage.isConfigured()) {
        storage.saveDbJson(jsonStr).catch((e) =>
          console.warn('[DB] Google Drive saveDbJson error:', e)
        );
      }
    } catch (e) {}

    // 2. Supabase Storage
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.some((b) => b.name === 'models-cache');
        if (!exists) {
          await supabase.storage.createBucket('models-cache', { public: true });
        }

        const jsonBuffer = Buffer.from(jsonStr, 'utf-8');
        await withTimeout(
          supabase.storage
            .from('models-cache')
            .upload('metadata/db.json', jsonBuffer, {
              contentType: 'application/json',
              upsert: true,
            }),
          3000
        );
      } catch (err) {}
    }
  }

  // Categories
  async getCategories(subject?: Subject): Promise<Category[]> {
    await this.syncFromCloudStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let q = supabase.from('categories').select('*').order('order_index', { ascending: true });
        if (subject) q = q.eq('subject', subject);
        
        const { data, error } = await withTimeout(q, 2000);
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            subject: c.subject,
            slug: c.slug,
            name: c.name,
            icon: c.icon,
            orderIndex: c.order_index,
          }));
        }
      } catch (e) {
        // Fallback to local
      }
    }

    if (subject) {
      return this.data.categories
        .filter((c) => c.subject === subject)
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return [...this.data.categories].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    await this.syncFromCloudStorage();
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await withTimeout(
          supabase.from('categories').insert({
            id: newCat.id,
            subject: newCat.subject,
            slug: newCat.slug,
            name: newCat.name,
            icon: newCat.icon,
            order_index: newCat.orderIndex,
          }),
          2000
        );
      } catch (e) {}
    }

    this.data.categories.push(newCat);
    this.saveLocalData(this.data, true);
    return newCat;
  }

  async getDeletedModelIds(): Promise<string[]> {
    await this.syncFromCloudStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await withTimeout(
          supabase.from('models').select('id').eq('status', 'deleted'),
          2000
        );
        if (data && Array.isArray(data)) {
          const ids = data.map((d: any) => d.id);
          this.data.deletedIds = Array.from(new Set([...(this.data.deletedIds || []), ...ids]));
        }
      } catch (e) {}
    }
    return this.data.deletedIds || [];
  }

  // Models
  async getModels(params?: {
    subject?: Subject;
    category?: string;
    search?: string;
    tag?: string;
    sort?: 'newest' | 'name-asc' | 'name-desc' | 'updated';
  }): Promise<Model[]> {
    await this.syncFromCloudStorage();
    const deletedIds = await this.getDeletedModelIds();
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        let query = supabase.from('models').select('*').neq('status', 'deleted');

        if (params?.subject) {
          query = query.eq('subject', params.subject);
        }
        if (params?.category && params.category !== 'all') {
          query = query.eq('category', params.category);
        }

        const sort = params?.sort || 'updated';
        if (sort === 'name-asc') query = query.order('title', { ascending: true });
        else if (sort === 'name-desc') query = query.order('title', { ascending: false });
        else if (sort === 'newest') query = query.order('created_at', { ascending: false });
        else query = query.order('updated_at', { ascending: false });

        // Query with safe 2.5s timeout
        const { data, error } = await withTimeout(query, 2500);

        if (!error && Array.isArray(data) && data.length > 0) {
          const pgModels = data
            .map(mapDbRowToModel)
            .filter((m: Model) => m.status !== 'deleted' && !deletedIds.includes(m.id));

          // Merge PostgreSQL models into our cloud cache map
          const map = new Map<string, Model>();
          this.sanitizeModels(this.data.models).forEach((m) => {
            if (m.status !== 'deleted' && !deletedIds.includes(m.id)) {
              map.set(m.id, m);
            }
          });
          this.sanitizeModels(pgModels).forEach((m: Model) => map.set(m.id, m));

          let models = Array.from(map.values());

          if (params?.subject) {
            models = models.filter((m) => m.subject === params.subject);
          }
          if (params?.category && params.category !== 'all') {
            models = models.filter((m) => m.category === params.category);
          }
          if (params?.tag) {
            models = models.filter((m: Model) => m.tags.includes(params.tag!));
          }
          if (params?.search) {
            const q = params.search.toLowerCase().trim();
            models = models.filter(
              (m: Model) =>
                m.title.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                m.tags.some((t: string) => t.toLowerCase().includes(q)) ||
                m.category.toLowerCase().includes(q)
            );
          }
          return models;
        }
      } catch (e) {
        console.warn('[DB] Supabase getModels note (using cloud storage cache):', e);
      }
    }

    // Cloud Storage / Local Fallback (Guaranteed to retain user uploads & deletions)
    let result = this.sanitizeModels(this.data.models).filter(
      (m) => m.status !== 'deleted' && !deletedIds.includes(m.id)
    );
    if (params?.subject) result = result.filter((m) => m.subject === params.subject);
    if (params?.category && params.category !== 'all') result = result.filter((m) => m.category === params.category);
    if (params?.tag) result = result.filter((m) => m.tags.includes(params.tag!));
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (m: Model) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t: string) => t.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q)
      );
    }
    const sort = params?.sort || 'updated';
    result.sort((a, b) => {
      if (sort === 'name-asc') return a.title.localeCompare(b.title, 'vi');
      if (sort === 'name-desc') return b.title.localeCompare(a.title, 'vi');
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }

  async getModelById(id: string): Promise<Model | null> {
    await this.syncFromCloudStorage();

    if ((this.data.deletedIds || []).includes(id)) {
      return null;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const query = supabase
          .from('models')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id}`)
          .neq('status', 'deleted')
          .maybeSingle();

        const { data, error } = await withTimeout(query, 2000);

        if (!error && data && data.status !== 'deleted' && !(this.data.deletedIds || []).includes(data.id)) {
          // Update last accessed timestamp in background
          supabase
            .from('models')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('id', data.id)
            .then(() => {});

          return mapDbRowToModel(data);
        }
      } catch (e) {}
    }

    const found = this.data.models.find(
      (m) =>
        (m.id === id || m.slug === id) &&
        m.status !== 'deleted' &&
        !(this.data.deletedIds || []).includes(m.id)
    );
    return found || null;
  }

  async createModel(model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>): Promise<Model> {
    await this.syncFromCloudStorage();

    const newModel: Model = {
      ...model,
      id: `model-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately store in local memory and persist to Supabase Storage metadata/db.json
    this.data.models.unshift(newModel);
    this.saveLocalData(this.data, true);

    // 2. Also try inserting into Supabase PostgreSQL if table exists
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await withTimeout(
          supabase
            .from('models')
            .insert({
              id: newModel.id,
              title: newModel.title,
              slug: newModel.slug,
              description: newModel.description,
              subject: newModel.subject,
              category: newModel.category,
              thumbnail_url: newModel.thumbnailUrl,
              drive_file_id: newModel.driveFileId,
              drive_folder_id: newModel.driveFolderId,
              cache_path: newModel.cachePath,
              entry_file: newModel.entryFile,
              file_type: newModel.fileType,
              file_size: newModel.fileSize,
              version: newModel.version,
              status: newModel.status,
              tags: newModel.tags,
              featured: newModel.featured,
              last_accessed_at: new Date().toISOString(),
            }),
          3000
        );
      } catch (e) {
        console.warn('[DB] Supabase PG insert notice (saved to Supabase Storage):', e);
      }
    }

    return newModel;
  }

  async updateModel(id: string, updates: Partial<Model>): Promise<Model | null> {
    await this.syncFromCloudStorage();

    const idx = this.data.models.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.data.models[idx] = {
        ...this.data.models[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveLocalData(this.data, true);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.tags) dbUpdates.tags = updates.tags;
        if (updates.version) dbUpdates.version = updates.version;
        if (updates.cachePath) dbUpdates.cache_path = updates.cachePath;

        await withTimeout(
          supabase
            .from('models')
            .update(dbUpdates)
            .eq('id', id),
          2000
        );
      } catch (e) {}
    }

    return idx !== -1 ? this.data.models[idx] : null;
  }

  async deleteModel(id: string): Promise<boolean> {
    await this.syncFromCloudStorage();

    if (!this.data.deletedIds) {
      this.data.deletedIds = [];
    }
    if (!this.data.deletedIds.includes(id)) {
      this.data.deletedIds.push(id);
    }

    // Remove from in-memory arrays and immediately upload to Supabase Storage metadata/db.json
    this.data.models = this.data.models.filter((m) => m.id !== id);
    this.data.favorites = this.data.favorites.filter((fid) => fid !== id);
    this.data.recentViews = this.data.recentViews.filter((r) => r.modelId !== id);
    this.saveLocalData(this.data, true);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Record as deleted in Supabase PostgreSQL
        await withTimeout(
          supabase.from('models').upsert({
            id: id,
            title: 'deleted',
            slug: id,
            subject: 'math',
            category: 'khac',
            drive_file_id: 'deleted',
            file_type: 'html',
            status: 'deleted',
            updated_at: new Date().toISOString(),
          }),
          2000
        );

        supabase.from('favorites').delete().eq('model_id', id).then(() => {});
        supabase.from('recent_views').delete().eq('model_id', id).then(() => {});
      } catch (e) {
        console.warn('[DB] Supabase deleteModel error:', e);
      }
    }

    return true;
  }

  // Favorites
  async getFavorites(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase.from('favorites').select('model_id'),
          2000
        );
        if (!error && data) {
          return data.map((f: any) => f.model_id);
        }
      } catch (e) {}
    }
    return [...this.data.favorites];
  }

  async toggleFavorite(modelId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await withTimeout(
          supabase.from('favorites').select('id').eq('model_id', modelId).maybeSingle(),
          2000
        );
        if (data) {
          await supabase.from('favorites').delete().eq('model_id', modelId);
          return false;
        } else {
          await supabase.from('favorites').insert({ id: `fav-${Date.now()}`, model_id: modelId });
          return true;
        }
      } catch (e) {}
    }

    const idx = this.data.favorites.indexOf(modelId);
    if (idx >= 0) {
      this.data.favorites.splice(idx, 1);
      this.saveLocalData(this.data, true);
      return false;
    } else {
      this.data.favorites.push(modelId);
      this.saveLocalData(this.data, true);
      return true;
    }
  }

  // Recent Views
  async getRecentViews(limit: number = 20): Promise<RecentView[]> {
    await this.syncFromCloudStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('recent_views')
            .select('*')
            .order('last_opened_at', { ascending: false })
            .limit(limit),
          2000
        );

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            modelId: r.model_id,
            lastOpenedAt: r.last_opened_at,
          }));
        }
      } catch (e) {}
    }

    return this.data.recentViews
      .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
      .slice(0, limit);
  }

  async recordRecentView(modelId: string): Promise<void> {
    await this.syncFromCloudStorage();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await withTimeout(
          supabase.from('recent_views').select('id').eq('model_id', modelId).maybeSingle(),
          2000
        );
        if (data) {
          await supabase.from('recent_views').update({ last_opened_at: new Date().toISOString() }).eq('model_id', modelId);
        } else {
          await supabase.from('recent_views').insert({
            id: `rec-${Date.now()}`,
            model_id: modelId,
            last_opened_at: new Date().toISOString(),
          });
        }
      } catch (e) {}
    }

    const idx = this.data.recentViews.findIndex((r) => r.modelId === modelId);
    if (idx >= 0) {
      this.data.recentViews[idx].lastOpenedAt = new Date().toISOString();
    } else {
      this.data.recentViews.unshift({
        id: `rec-${Date.now()}`,
        modelId,
        lastOpenedAt: new Date().toISOString(),
      });
    }
    this.data.recentViews = this.data.recentViews.slice(0, 50);
    this.saveLocalData(this.data, true);
  }
}

export const db = new DatabaseManager();
