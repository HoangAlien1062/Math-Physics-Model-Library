import fs from 'fs';
import path from 'path';
import os from 'os';
import { Category, Favorite, Model, RecentView, Subject } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';

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

// Seeded initial interactive models
export const DEFAULT_MODELS: Model[] = [
  {
    id: 'demo-math-quad',
    title: 'Khảo sát hàm số bậc hai y = ax² + bx + c',
    slug: 'khao-sat-ham-so-bac-hai',
    description: 'Mô hình trực quan hóa đồ thị Parabol, đỉnh Parabol, trục đối xứng và tìm nghiệm với thanh trượt tương tác thời gian thực.',
    subject: 'math',
    category: 'ham-so',
    driveFileId: 'demo_quadratic_function.html',
    entryFile: 'index.html',
    fileType: 'html',
    version: '1.2.0',
    status: 'ready',
    tags: ['hàm số', 'đại số', 'parabol', 'toán 10', 'tương tác'],
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-03-25T10:30:00Z',
  },
  {
    id: 'demo-phys-pendulum',
    title: 'Mô phỏng con lắc đơn & Dao động điều hòa',
    slug: 'mo-phong-con-lac-don-dao-dong-dieu-hoa',
    description: 'Thí nghiệm ảo khảo sát chu kỳ dao động con lắc đơn theo chiều dài dây, gia tốc trọng trường g và hệ số ma sát cản không khí. Kéo thả vật nặng để thả góc ban đầu.',
    subject: 'physics',
    category: 'dao-dong',
    driveFileId: 'demo_harmonic_pendulum.html',
    entryFile: 'index.html',
    fileType: 'html',
    version: '1.3.1',
    status: 'ready',
    tags: ['dao động', 'cơ học', 'vật lý 12', 'con lắc', 'chu kỳ'],
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-28T14:15:00Z',
  },
  {
    id: 'demo-phys-gas',
    title: 'Mô phỏng khí lý tưởng & Định luật nhiệt động học',
    slug: 'mo-phong-khi-ly-tuong-nhiet-dong-hoc',
    description: 'Mô hình chuyển động hỗn loạn của các phân tử chất khí trong xi lanh có piston di động. Kiểm chứng định luật Boyle-Mariotte (PV = const) và Gay-Lussac với áp kế và nhiệt kế.',
    subject: 'physics',
    category: 'nhiet-hoc',
    driveFileId: 'demo_ideal_gas.html',
    entryFile: 'index.html',
    fileType: 'html',
    version: '1.1.0',
    status: 'ready',
    tags: ['nhiệt học', 'áp suất', 'thể tích', 'khí lý tưởng', 'piston'],
    createdAt: '2026-03-20T11:00:00Z',
    updatedAt: '2026-03-29T16:45:00Z',
  },
];

interface DataStore {
  categories: Category[];
  models: Model[];
  favorites: string[];
  recentViews: RecentView[];
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

  private loadLocalData(): DataStore {
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
          models: parsed.models?.length ? parsed.models : DEFAULT_MODELS,
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : ['demo-phys-pendulum'],
          recentViews: parsed.recentViews || [],
        };
      } catch (err) {
        console.error('Failed to read db.json, using defaults:', err);
      }
    }

    return {
      categories: DEFAULT_CATEGORIES,
      models: DEFAULT_MODELS,
      favorites: ['demo-phys-pendulum'],
      recentViews: [
        { id: 'rec-1', modelId: 'demo-math-quad', lastOpenedAt: '2026-03-30T10:00:00Z' },
        { id: 'rec-2', modelId: 'demo-phys-pendulum', lastOpenedAt: '2026-03-30T11:30:00Z' },
      ],
    };
  }

  private saveLocalData(data: DataStore) {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Filesystem save note:', err);
    }
  }

  // Categories
  async getCategories(subject?: Subject): Promise<Category[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let q = supabase.from('categories').select('*').order('order_index', { ascending: true });
        if (subject) q = q.eq('subject', subject);
        const { data, error } = await q;
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
        console.warn('[DB] Supabase getCategories error, using default:', e);
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
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('categories').insert({
          id: newCat.id,
          subject: newCat.subject,
          slug: newCat.slug,
          name: newCat.name,
          icon: newCat.icon,
          order_index: newCat.orderIndex,
        });
      } catch (e) {
        console.warn('[DB] Supabase addCategory error:', e);
      }
    }

    this.data.categories.push(newCat);
    this.saveLocalData(this.data);
    return newCat;
  }

  // Models
  async getModels(params?: {
    subject?: Subject;
    category?: string;
    search?: string;
    tag?: string;
    sort?: 'newest' | 'name-asc' | 'name-desc' | 'updated';
  }): Promise<Model[]> {
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

        const { data, error } = await query;
        if (!error && data) {
          let models = data.map(mapDbRowToModel);

          // Handle client-side search & tag filter for Vietnamese fuzzy match
          if (params?.tag) {
            models = models.filter((m) => m.tags.includes(params.tag!));
          }
          if (params?.search) {
            const q = params.search.toLowerCase().trim();
            models = models.filter(
              (m) =>
                m.title.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                m.tags.some((t) => t.toLowerCase().includes(q)) ||
                m.category.toLowerCase().includes(q)
            );
          }

          // If database is empty, seed defaults
          if (models.length === 0 && !params?.search && !params?.tag && !params?.category) {
            for (const d of DEFAULT_MODELS) {
              await this.createModel(d);
            }
            return DEFAULT_MODELS;
          }

          return models;
        }
      } catch (e) {
        console.warn('[DB] Supabase getModels error, fallback to local:', e);
      }
    }

    // Local fallback
    let result = [...this.data.models].filter((m) => m.status !== 'deleted');
    if (params?.subject) result = result.filter((m) => m.subject === params.subject);
    if (params?.category && params.category !== 'all') result = result.filter((m) => m.category === params.category);
    if (params?.tag) result = result.filter((m) => m.tags.includes(params.tag!));
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)) ||
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
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('models')
          .select('*')
          .or(`id.eq.${id},slug.eq.${id}`)
          .neq('status', 'deleted')
          .maybeSingle();

        if (!error && data) {
          // Update last accessed timestamp
          supabase
            .from('models')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('id', data.id)
            .then(() => {});

          return mapDbRowToModel(data);
        }
      } catch (e) {
        console.warn('[DB] Supabase getModelById error:', e);
      }
    }

    const found = this.data.models.find((m) => (m.id === id || m.slug === id) && m.status !== 'deleted');
    return found || null;
  }

  async createModel(model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>): Promise<Model> {
    const newModel: Model = {
      ...model,
      id: `model-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
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
          })
          .select()
          .single();

        if (!error && data) {
          return mapDbRowToModel(data);
        }
        if (error) {
          console.warn('[DB] Supabase insert warning:', error);
        }
      } catch (e) {
        console.warn('[DB] Supabase createModel error:', e);
      }
    }

    this.data.models.unshift(newModel);
    this.saveLocalData(this.data);
    return newModel;
  }

  async updateModel(id: string, updates: Partial<Model>): Promise<Model | null> {
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

        const { data, error } = await supabase
          .from('models')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return mapDbRowToModel(data);
        }
      } catch (e) {
        console.warn('[DB] Supabase updateModel error:', e);
      }
    }

    const idx = this.data.models.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    this.data.models[idx] = {
      ...this.data.models[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveLocalData(this.data);
    return this.data.models[idx];
  }

  async deleteModel(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('models').update({ status: 'deleted' }).eq('id', id);
      } catch (e) {
        console.warn('[DB] Supabase deleteModel error:', e);
      }
    }

    const idx = this.data.models.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.data.models[idx].status = 'deleted';
      this.saveLocalData(this.data);
    }
    return true;
  }

  // Favorites
  async getFavorites(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('favorites').select('model_id');
        if (!error && data) {
          return data.map((f: any) => f.model_id);
        }
      } catch (e) {
        console.warn('[DB] Supabase getFavorites error:', e);
      }
    }
    return [...this.data.favorites];
  }

  async toggleFavorite(modelId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.from('favorites').select('id').eq('model_id', modelId).maybeSingle();
        if (data) {
          await supabase.from('favorites').delete().eq('model_id', modelId);
          return false;
        } else {
          await supabase.from('favorites').insert({ id: `fav-${Date.now()}`, model_id: modelId });
          return true;
        }
      } catch (e) {
        console.warn('[DB] Supabase toggleFavorite error:', e);
      }
    }

    const idx = this.data.favorites.indexOf(modelId);
    if (idx >= 0) {
      this.data.favorites.splice(idx, 1);
      this.saveLocalData(this.data);
      return false;
    } else {
      this.data.favorites.push(modelId);
      this.saveLocalData(this.data);
      return true;
    }
  }

  // Recent Views
  async getRecentViews(limit: number = 20): Promise<RecentView[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('recent_views')
          .select('*')
          .order('last_opened_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            modelId: r.model_id,
            lastOpenedAt: r.last_opened_at,
          }));
        }
      } catch (e) {
        console.warn('[DB] Supabase getRecentViews error:', e);
      }
    }

    return this.data.recentViews
      .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
      .slice(0, limit);
  }

  async recordRecentView(modelId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.from('recent_views').select('id').eq('model_id', modelId).maybeSingle();
        if (data) {
          await supabase.from('recent_views').update({ last_opened_at: new Date().toISOString() }).eq('model_id', modelId);
        } else {
          await supabase.from('recent_views').insert({
            id: `rec-${Date.now()}`,
            model_id: modelId,
            last_opened_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('[DB] Supabase recordRecentView error:', e);
      }
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
    this.saveLocalData(this.data);
  }
}

export const db = new DatabaseManager();
