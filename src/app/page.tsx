'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Model } from '@/types';
import { ModelCard } from '@/components/model/ModelCard';
import {
  Sigma,
  Atom,
  ArrowRight,
  Clock,
  Star,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [recentModels, setRecentModels] = useState<Model[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      if (!isCancelled) setLoading(false);
    }, 4000);

    // 1. Fetch personal models
    fetch('/api/models', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (!isCancelled && data.success && Array.isArray(data.models)) {
          setAllModels(data.models);
        }
      })
      .catch((err) => {
        if (!isCancelled) console.warn('Could not fetch models:', err);
      })
      .finally(() => {
        clearTimeout(timer);
        if (!isCancelled) setLoading(false);
      });

    // 2. Fetch recent and favorites
    fetch('/api/recent')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.recentModels) {
          setRecentModels(data.recentModels);
        }
      })
      .catch(() => {});

    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.favorites) {
          setFavoriteIds(data.favorites);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  const handleDelete = (modelId: string) => {
    setAllModels((prev) => prev.filter((m) => m.id !== modelId));
  };

  const mathModels = allModels.filter((m) => m.subject === 'math').slice(0, 3);
  const physicsModels = allModels.filter((m) => m.subject === 'physics').slice(0, 3);
  const favoriteModels = allModels.filter((m) => favoriteIds.includes(m.id));

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* HERO SECTION: Clean, Modern Scientific, Bright */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thư viện mô hình tương tác HTML5 / JavaScript của bạn</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
          Thư viện mô hình Toán & Vật lý
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Không gian lưu trữ và chạy trực tiếp các mô hình học tập ngay trên trình duyệt mà không cần cài đặt.
          Tương tác trực quan với đồ thị hàm số, con lắc, chuyển động và các định luật vật lý.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/math"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm shadow-emerald-500/10 transition-all text-sm group"
          >
            <Sigma className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Khám phá Toán học</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/physics"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm shadow-blue-500/10 transition-all text-sm group"
          >
            <Atom className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Khám phá Vật lý</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* TIẾP TỤC KHÁM PHÁ (Recent models) */}
      {recentModels.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Mới xem gần đây</h2>
            </div>
            <Link
              href="/my-library"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentModels.slice(0, 3).map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isFavorite={favoriteIds.includes(model.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* YÊU THÍCH (Favorites) */}
      {favoriteModels.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <h2 className="text-lg font-bold text-slate-900">Mô hình yêu thích</h2>
            </div>
            <Link
              href="/my-library"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteModels.slice(0, 3).map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isFavorite={true}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* MÔ HÌNH TOÁN HỌC */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mô hình Toán học</h2>
              <p className="text-xs text-slate-500">Đại số, hình học, hàm số và trực quan hóa dữ liệu</p>
            </div>
          </div>
          <Link
            href="/math"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Toàn bộ môn Toán <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : mathModels.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-sm">
            Chưa có mô hình Toán học nào. Hãy bấm &quot;Thêm mô hình&quot; để tải lên.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mathModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isFavorite={favoriteIds.includes(model.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* MÔ HÌNH VẬT LÝ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Atom className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mô hình Vật lý</h2>
              <p className="text-xs text-slate-500">Cơ học, dao động, nhiệt động lực học và mô phỏng thí nghiệm</p>
            </div>
          </div>
          <Link
            href="/physics"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            Toàn bộ môn Vật lý <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : physicsModels.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-sm">
            Chưa có mô hình Vật lý nào. Hãy bấm &quot;Thêm mô hình&quot; để tải lên.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {physicsModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isFavorite={favoriteIds.includes(model.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
