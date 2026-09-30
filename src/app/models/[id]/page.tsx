'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Model } from '@/types';
import { ModelViewer } from '@/components/model/ModelViewer';
import {
  ArrowLeft,
  Star,
  Calendar,
  Lock,
  Globe,
  Tag,
  Share2,
  FileCode,
  HardDrive,
  Layers,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const modelId = params.id as string;
  const [model, setModel] = useState<Model | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) return;

    fetch(`/api/models/${modelId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Không thể tải mô hình');
        }
        setModel(data.model);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));

    if (user) {
      fetch('/api/favorites')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.favorites) {
            setIsFavorite(data.favorites.includes(modelId));
          }
        })
        .catch(() => {});
    }
  }, [modelId, user]);

  const handleFavoriteToggle = async () => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.isFavorite);
        showToast(
          data.isFavorite ? 'Đã thêm vào mô hình yêu thích' : 'Đã bỏ khỏi yêu thích',
          'info'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết vào bộ nhớ tạm', 'info');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold">Đang chuẩn bị mô hình...</p>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không thể truy cập mô hình</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'Mô hình không tồn tại hoặc đã bị xóa.'}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  const isMath = model.subject === 'math';

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isMath
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isMath ? 'Toán học' : 'Vật lý'}
            </span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              • {model.category}
            </span>
          </div>
        </div>

        {/* Favorite & Share Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              isFavorite
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>{isFavorite ? 'Đã lưu yêu thích' : 'Lưu yêu thích'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Model Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {model.title}
        </h1>
      </div>

      {/* 10. MODEL VIEWER: An expansive sandboxed interactive runner */}
      <section className="w-full">
        <ModelViewer model={model} />
      </section>

      {/* Model Information & Metadata Card */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" /> Mô tả mô hình
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {model.description || 'Chưa có mô tả chi tiết cho mô hình này.'}
          </p>
        </div>

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thẻ liên quan</h3>
            <div className="flex flex-wrap gap-1.5">
              {model.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>#{tag}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specifications grid */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Phiên bản</span>
            <span className="font-semibold text-slate-800">v{model.version || '1.0.0'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Quyền riêng tư</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              {model.visibility === 'public' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-600" /> Công khai
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-600" /> Riêng tư (Admin Drive)
                </>
              )}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Định dạng file</span>
            <span className="font-semibold text-slate-800 uppercase flex items-center gap-1 mt-0.5">
              <FileCode className="w-3.5 h-3.5 text-slate-500" /> {model.fileType} ({model.entryFile})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Ngày cập nhật</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(model.updatedAt || model.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
