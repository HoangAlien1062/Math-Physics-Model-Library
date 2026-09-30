'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Model, Category, StorageStatus, Subject } from '@/types';
import {
  Shield,
  HardDrive,
  RefreshCw,
  FolderTree,
  FileCode,
  Globe,
  Lock,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { UploadModal } from '@/components/model/UploadModal';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'storage' | 'models' | 'categories'>('storage');
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // New Category Form
  const [newCatSubject, setNewCatSubject] = useState<Subject>('math');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const loadData = async () => {
    // 1. Storage status
    try {
      const res = await fetch('/api/storage/status');
      const data = await res.json();
      if (data.success) setStorageStatus(data.status);
    } catch (e) {}

    // 2. All models
    try {
      const res = await fetch('/api/models?visibility=all');
      const data = await res.json();
      if (data.success) setAllModels(data.models);
    } catch (e) {}

    // 3. Categories
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (e) {}
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Strict Role Protection
  if (!isAdmin) {
    return (
      <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">403 Forbidden - Truy cập bị từ chối</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Chỉ Quản trị viên (Admin) mới có quyền truy cập trang quản lý hệ thống.
        </p>
      </div>
    );
  }

  const handleSyncStorage = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/storage/status', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStorageStatus(data.status);
        showToast('Đã hoàn tất đồng bộ với Google Drive Admin!', 'success');
      } else {
        showToast('Lỗi khi đồng bộ', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối đồng bộ', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePublish = async (model: Model) => {
    const nextVisibility = model.visibility === 'public' ? 'private' : 'public';
    try {
      const res = await fetch(`/api/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: nextVisibility }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          nextVisibility === 'public'
            ? 'Đã công khai mô hình lên thư viện chung'
            : 'Đã chuyển mô hình về chế độ riêng tư',
          'info'
        );
        loadData();
      }
    } catch (e) {
      showToast('Lỗi khi thay đổi trạng thái', 'error');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mô hình này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/models/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa mô hình thành công', 'success');
        loadData();
      }
    } catch (e) {
      showToast('Lỗi khi xóa', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newCatSubject,
          name: newCatName.trim(),
          slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Đã thêm chủ đề mới thành công', 'success');
        setNewCatName('');
        setNewCatSlug('');
        loadData();
      } else {
        showToast(data.error || 'Lỗi thêm chủ đề', 'error');
      }
    } catch (err) {
      showToast('Lỗi gửi yêu cầu', 'error');
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bảng Điều Khiển Admin</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Quản lý Google Drive Storage trung tâm, kiểm duyệt mô hình và cấu hình danh mục
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Model Công khai</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'storage' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive Storage ({storageStatus?.provider === 'google_drive' ? 'Drive' : 'Local'})</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'models' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Toàn bộ mô hình ({allModels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'categories' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Quản lý danh mục ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: STORAGE DASHBOARD */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Google Drive Storage của Admin</h2>
                  <p className="text-xs text-slate-500">
                    Kho lưu trữ tập trung duy nhất cho toàn bộ website
                  </p>
                </div>
              </div>

              <button
                onClick={handleSyncStorage}
                disabled={syncing}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Đồng bộ kiểm tra</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Trạng thái kết nối</span>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{storageStatus?.connected ? 'Đang hoạt động' : 'Chưa cấu hình'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Storage Provider</span>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {storageStatus?.provider === 'google_drive' ? 'Google Drive v3' : 'Local Fallback (.data)'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Tài khoản Admin Drive</span>
                <p className="mt-1 text-sm font-bold text-slate-800 truncate">
                  {storageStatus?.adminEmail || 'admin@model-library.vn'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Tổng tệp tin đã lưu trữ</span>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {allModels.length} mô hình
                </p>
              </div>
            </div>

            {/* Folder structure representation */}
            <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
              <p className="text-emerald-400 font-bold mb-2">// Cấu trúc cây thư mục Google Drive Admin:</p>
              <p className="text-blue-300">Math Physics Model Library/ (Root Folder)</p>
              <p className="pl-4">├── Public Models/</p>
              <p className="pl-8">├── Math/ (Mô hình Toán công khai)</p>
              <p className="pl-8">└── Physics/ (Mô hình Vật lý công khai)</p>
              <p className="pl-4">└── User Uploads/</p>
              <p className="pl-8">├── user_001/</p>
              <p className="pl-12">├── Math/</p>
              <p className="pl-12">└── Physics/</p>
              <p className="pl-8">└── ...</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL MODELS MANAGEMENT */}
      {activeTab === 'models' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tên mô hình</th>
                  <th className="py-3 px-4">Môn & Chủ đề</th>
                  <th className="py-3 px-4">Người sở hữu</th>
                  <th className="py-3 px-4">Định dạng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allModels.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {model.title}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          model.subject === 'math'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {model.subject === 'math' ? 'Toán' : 'Vật lý'}
                      </span>
                      <span className="text-slate-500 ml-1.5 capitalize">{model.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {model.ownerName || model.ownerUserId}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-slate-500">
                      {model.fileType}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(model)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          model.visibility === 'public'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {model.visibility === 'public' ? (
                          <>
                            <Globe className="w-3 h-3" /> Công khai
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" /> Riêng tư
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa mô hình"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Thêm chủ đề mới</h2>
            <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Môn học</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatSubject('math')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold ${
                      newCatSubject === 'math'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Toán học
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatSubject('physics')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold ${
                      newCatSubject === 'physics'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Vật lý
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên chủ đề</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lượng giác, Từ trường..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Slug URL (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="luong-giac"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
              >
                Lưu chủ đề
              </button>
            </form>
          </div>

          {/* List Categories */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Danh mục hiện tại</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        c.subject === 'math' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{c.slug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload modal for admin public uploads */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={loadData}
      />

    </div>
  );
}
