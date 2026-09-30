import fs from 'fs';
import path from 'path';
import { Category, Favorite, Model, RecentView, Subject, User } from '@/types';

// Default seeded categories according to specifications
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

// Seeded real interactive models (built-in public models for live demonstration)
export const DEFAULT_MODELS: Model[] = [
  {
    id: 'demo-math-quad',
    title: 'Khảo sát hàm số bậc hai y = ax² + bx + c',
    slug: 'khao-sat-ham-so-bac-hai',
    description: 'Mô hình trực quan hóa đồ thị Parabol, đỉnh Parabol, trục đối xứng và tìm nghiệm với thanh trượt tương tác thời gian thực.',
    subject: 'math',
    category: 'ham-so',
    visibility: 'public',
    ownerUserId: 'admin-001',
    ownerName: 'Admin Hệ Thống',
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
    visibility: 'public',
    ownerUserId: 'admin-001',
    ownerName: 'Admin Hệ Thống',
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
    visibility: 'public',
    ownerUserId: 'admin-001',
    ownerName: 'Admin Hệ Thống',
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
  favorites: Favorite[];
  recentViews: RecentView[];
}

import os from 'os';

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
    this.data = this.loadData();
  }

  private loadData(): DataStore {
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
          models: parsed.models?.length ? parsed.models : DEFAULT_MODELS,
          favorites: parsed.favorites || [],
          recentViews: parsed.recentViews || [],
        };
      } catch (err) {
        console.error('Failed to read db.json, using defaults:', err);
      }
    }
    const initial: DataStore = {
      categories: DEFAULT_CATEGORIES,
      models: DEFAULT_MODELS,
      favorites: [
        { id: 'fav-1', userId: 'user-001', modelId: 'demo-phys-pendulum', createdAt: '2026-03-29T00:00:00Z' },
      ],
      recentViews: [
        { id: 'rec-1', userId: 'user-001', modelId: 'demo-math-quad', lastOpenedAt: '2026-03-30T10:00:00Z' },
        { id: 'rec-2', userId: 'user-001', modelId: 'demo-phys-pendulum', lastOpenedAt: '2026-03-30T11:30:00Z' },
      ],
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DataStore) {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // In-memory data is still fully kept for current request
      console.warn('Filesystem save note (in-memory preserved):', err);
    }
  }

  // Categories
  async getCategories(subject?: Subject): Promise<Category[]> {
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
    this.data.categories.push(newCat);
    this.saveData(this.data);
    return newCat;
  }

  // Models
  async getModels(params?: {
    subject?: Subject;
    category?: string;
    search?: string;
    tag?: string;
    visibility?: 'public' | 'private' | 'all';
    ownerUserId?: string;
    sort?: 'newest' | 'name-asc' | 'name-desc' | 'updated';
  }): Promise<Model[]> {
    let result = [...this.data.models].filter((m) => m.status !== 'deleted');

    if (params?.subject) {
      result = result.filter((m) => m.subject === params.subject);
    }

    if (params?.category && params.category !== 'all') {
      result = result.filter((m) => m.category === params.category);
    }

    if (params?.tag) {
      result = result.filter((m) => m.tags.includes(params.tag!));
    }

    if (params?.visibility === 'public') {
      result = result.filter((m) => m.visibility === 'public');
    } else if (params?.visibility === 'private' && params.ownerUserId) {
      result = result.filter((m) => m.visibility === 'private' && m.ownerUserId === params.ownerUserId);
    }

    if (params?.ownerUserId && !params.visibility) {
      result = result.filter((m) => m.ownerUserId === params.ownerUserId);
    }

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

    // Sort
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
    this.data.models.unshift(newModel);
    this.saveData(this.data);
    return newModel;
  }

  async updateModel(id: string, updates: Partial<Model>): Promise<Model | null> {
    const idx = this.data.models.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    this.data.models[idx] = {
      ...this.data.models[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.models[idx];
  }

  async deleteModel(id: string): Promise<boolean> {
    const idx = this.data.models.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.data.models[idx].status = 'deleted';
    this.saveData(this.data);
    return true;
  }

  // Favorites
  async getFavorites(userId: string): Promise<string[]> {
    return this.data.favorites.filter((f) => f.userId === userId).map((f) => f.modelId);
  }

  async toggleFavorite(userId: string, modelId: string): Promise<boolean> {
    const idx = this.data.favorites.findIndex((f) => f.userId === userId && f.modelId === modelId);
    if (idx >= 0) {
      this.data.favorites.splice(idx, 1);
      this.saveData(this.data);
      return false; // unfavorited
    } else {
      this.data.favorites.push({
        id: `fav-${Date.now()}`,
        userId,
        modelId,
        createdAt: new Date().toISOString(),
      });
      this.saveData(this.data);
      return true; // favorited
    }
  }

  // Recent Views
  async getRecentViews(userId: string, limit: number = 20): Promise<RecentView[]> {
    return this.data.recentViews
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
      .slice(0, limit);
  }

  async recordRecentView(userId: string, modelId: string): Promise<void> {
    const idx = this.data.recentViews.findIndex((r) => r.userId === userId && r.modelId === modelId);
    if (idx >= 0) {
      this.data.recentViews[idx].lastOpenedAt = new Date().toISOString();
    } else {
      this.data.recentViews.unshift({
        id: `rec-${Date.now()}`,
        userId,
        modelId,
        lastOpenedAt: new Date().toISOString(),
      });
    }
    // Trim to 50
    this.data.recentViews = this.data.recentViews.slice(0, 50);
    this.saveData(this.data);
  }
}

export const db = new DatabaseManager();
