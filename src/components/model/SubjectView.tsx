'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Model, Category, Subject } from '@/types';
import { ModelCard } from './ModelCard';
import {
  Search,
  Sigma,
  Atom,
  ArrowUpDown,
  X,
  FileQuestion,
} from 'lucide-react';

interface SubjectViewProps {
  subject: Subject;
  title: string;
  description: string;
}

export function SubjectView({ subject, title, description }: SubjectViewProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortOption, setSortOption] = useState<'updated' | 'newest' | 'name-asc' | 'name-desc'>('updated');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    fetch(`/api/categories?subject=${subject}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error(err));
  }, [subject]);

  // Fetch favorites
  useEffect(() => {
    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.favorites) {
          setFavoriteIds(data.favorites);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch models with filters
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const loadModels = () => {
      const params = new URLSearchParams();
      params.set('subject', subject);
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }
      params.set('sort', sortOption);

      fetch(`/api/models?${params.toString()}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then((data) => {
          if (!isCancelled && data.success && Array.isArray(data.models)) {
            setModels(data.models);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.warn('Could not load models from API, keeping current state:', err);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    };

    loadModels();

    const handleModelUpdate = () => loadModels();
    window.addEventListener('model-updated', handleModelUpdate);

    return () => {
      isCancelled = true;
      window.removeEventListener('model-updated', handleModelUpdate);
    };
  }, [subject, selectedCategory, debouncedSearch, sortOption]);

  const isMath = subject === 'math';

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
              isMath ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {isMath ? <Sigma className="w-6 h-6" /> : <Atom className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">Mới cập nhật</option>
            <option value="newest">Mới thêm</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar (with debounce) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder={`Tìm kiếm mô hình ${isMath ? 'Toán học (đại số, giải tích, vector...)' : 'Vật lý (con lắc, nhiệt học, sóng...)'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm bg-white pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedCategory === 'all'
              ? isMath
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat.slug
                ? isMath
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : models.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isFavorite={favoriteIds.includes(model.id)}
              onDelete={(id) => setModels((prev) => prev.filter((m) => m.id !== id))}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy mô hình phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">
            {debouncedSearch
              ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử từ khóa khác hoặc xóa bộ lọc.`
              : 'Chưa có mô hình nào trong chủ đề này.'}
          </p>
          {(debouncedSearch || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      )}

    </div>
  );
}
