'use client';

import React, { useState, useEffect } from 'react';
import { Model, Subject } from '@/types';
import { ModelCard } from '@/components/model/ModelCard';
import {
  FolderOpen,
  Star,
  Clock,
  PlusCircle,
  Sigma,
  Atom,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { UploadModal } from '@/components/model/UploadModal';

export default function MyLibraryPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'my_models' | 'favorites' | 'recent'>('my_models');
  const [subjectFilter, setSubjectFilter] = useState<'all' | Subject>('all');
  const [myModels, setMyModels] = useState<Model[]>([]);
  const [favoriteModels, setFavoriteModels] = useState<Model[]>([]);
  const [recentModels, setRecentModels] = useState<Model[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // Delete Confirm State
  const [deletingModel, setDeletingModel] = useState<Model | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch personal models
      const allRes = await fetch('/api/models');
      const allData = await allRes.json();
      if (allData.success) {
        setMyModels(allData.models);
        const map = new Map<string, Model>(allData.models.map((m: Model) => [m.id, m]));

        // 2. Fetch favorites
        const favRes = await fetch('/api/favorites');
        const favData = await favRes.json();
        if (favData.success) {
          setFavoriteIds(favData.favorites);
          setFavoriteModels(favData.favorites.map((id: string) => map.get(id)).filter(Boolean));
        }
      }

      // 3. Fetch recent models
      const recRes = await fetch('/api/recent');
      const recData = await recRes.json();
      if (recData.success) setRecentModels(recData.recentModels);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const handleDeleteModel = async () => {
    if (!deletingModel) return;

    try {
      const res = await fetch(`/api/models/${deletingModel.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa mô hình và file trên hệ thống lưu trữ', 'success');
        setDeletingModel(null);
        fetchLibraryData();
      } else {
        showToast(data.error || 'Lỗi khi xóa mô hình', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xóa mô hình', 'error');
    }
  };

  const handleUpdateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    try {
      const res = await fetch(`/api/models/${editingModel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          tags: editTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật thông tin mô hình', 'success');
        setEditingModel(null);
        fetchLibraryData();
      } else {
        showToast(data.error || 'Lỗi cập nhật', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật', 'error');
    }
  };

  const openEditModal = (model: Model) => {
    setEditingModel(model);
    setEditTitle(model.title);
    setEditDescription(model.description || '');
    setEditTags(model.tags ? model.tags.join(', ') : '');
  };

  // Filter models by subject
  const filterBySubject = (list: Model[]) => {
    if (subjectFilter === 'all') return list;
    return list.filter((m) => m.subject === subjectFilter);
  };

  const currentList =
    activeTab === 'my_models'
      ? filterBySubject(myModels)
      : activeTab === 'favorites'
      ? filterBySubject(favoriteModels)
      : filterBySubject(recentModels);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thư viện của tôi</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý tất cả mô hình học tập, danh sách yêu thích và lịch sử xem
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm mô hình mới</span>
        </button>
      </div>

      {/* Tabs and Subject Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Main Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my_models')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my_models'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Tất cả mô hình ({myModels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Yêu thích ({favoriteModels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Đã xem gần đây ({recentModels.length})</span>
          </button>
        </div>

        {/* Subject Filter (Toán / Vật lý) */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              subjectFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả môn
          </button>

          <button
            onClick={() => setSubjectFilter('math')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold ${
              subjectFilter === 'math'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sigma className="w-3.5 h-3.5" /> Toán
          </button>

          <button
            onClick={() => setSubjectFilter('physics')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold ${
              subjectFilter === 'physics'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Atom className="w-3.5 h-3.5" /> Vật lý
          </button>
        </div>
      </div>

      {/* Models Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : currentList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((model) => (
            <div key={model.id} className="relative flex flex-col justify-between">
              <ModelCard
                model={model}
                isFavorite={favoriteIds.includes(model.id)}
                onToggleFavorite={fetchLibraryData}
                onDelete={fetchLibraryData}
              />

              {/* Quick Actions */}
              <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-100/90 rounded-lg text-xs">
                <span className="text-slate-500 font-medium truncate max-w-[120px]">
                  v{model.version || '1.0.0'} • {model.fileType}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(model)}
                    className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
                    title="Sửa thông tin"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingModel(model)}
                    className="p-1 text-slate-600 hover:text-rose-600 transition-colors"
                    title="Xóa mô hình"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            {activeTab === 'my_models' ? (
              <FolderOpen className="w-6 h-6" />
            ) : activeTab === 'favorites' ? (
              <Star className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'my_models'
              ? 'Chưa có mô hình nào trong thư viện'
              : activeTab === 'favorites'
              ? 'Bạn chưa lưu mô hình yêu thích nào'
              : 'Chưa có lịch sử xem mô hình'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'my_models'
              ? 'Bấm nút bên dưới để tải lên file .html hoặc .zip đầu tiên.'
              : 'Hãy khám phá các mô hình Toán và Vật lý để đánh dấu hoặc trải nghiệm.'}
          </p>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm mô hình ngay</span>
          </button>
        </div>
      )}

      {/* Edit Model Metadata Modal */}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Sửa thông tin mô hình</h3>
              <button
                onClick={() => setEditingModel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateModel} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên mô hình</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tags (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa mô hình?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thao tác này sẽ xóa vĩnh viễn mô hình <strong>&ldquo;{deletingModel.title}&rdquo;</strong> và tệp tin trên
                hệ thống lưu trữ Google Drive. Không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeletingModel(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteModel}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal integration */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchLibraryData}
      />

    </div>
  );
}
