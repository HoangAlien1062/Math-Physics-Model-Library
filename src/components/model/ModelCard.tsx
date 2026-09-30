'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Model } from '@/types';
import {
  Sigma,
  Atom,
  Star,
  Play,
  Calendar,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ModelCardProps {
  model: Model;
  isFavorite?: boolean;
  onToggleFavorite?: (modelId: string) => void;
  showOwnerBadge?: boolean;
}

export function ModelCard({
  model,
  isFavorite = false,
  onToggleFavorite,
  showOwnerBadge = false,
}: ModelCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [loadingFav, setLoadingFav] = useState(false);
  const { showToast } = useToast();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingFav(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: model.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFavorite(data.isFavorite);
        showToast(
          data.isFavorite ? 'Đã thêm vào mô hình yêu thích' : 'Đã bỏ khỏi yêu thích',
          'info'
        );
        if (onToggleFavorite) onToggleFavorite(model.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFav(false);
    }
  };

  const isMath = model.subject === 'math';

  // Format date
  const updatedDate = new Date(model.updatedAt || model.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      
      {/* Thumbnail / Header Visual */}
      <Link href={`/models/${model.id}`} className="relative h-44 w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {model.thumbnailUrl ? (
          <img
            src={model.thumbnailUrl}
            alt={model.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center p-6 text-center transition-transform duration-300 group-hover:scale-102 ${
              isMath ? 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50' : 'bg-gradient-to-br from-blue-50 via-sky-50/50 to-indigo-50'
            }`}
          >
            {isMath ? (
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-100 mb-2">
                <Sigma className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 mb-2">
                <Atom className="w-8 h-8" />
              </div>
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isMath ? 'Toán học' : 'Vật lý'} • {model.category}
            </span>
          </div>
        )}

        {/* Favorite Button on Card Top Right */}
        <button
          onClick={handleFavoriteClick}
          disabled={loadingFav}
          aria-label={favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-sm transition-all ${
            favorite
              ? 'bg-amber-50 text-amber-500 border border-amber-200'
              : 'bg-white/80 text-slate-400 hover:text-amber-500 hover:bg-white border border-slate-200/60'
          }`}
        >
          <Star className={`w-4 h-4 ${favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>

        {/* Visibility / Type Pill on Card Top Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {model.visibility === 'private' ? (
            <span className="flex items-center gap-1 bg-slate-900/75 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
              <Lock className="w-3 h-3" /> Cá nhân
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-blue-600/90 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
              <Globe className="w-3 h-3" /> Công khai
            </span>
          )}
          <span className="bg-white/90 backdrop-blur text-slate-700 text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded-md border border-slate-200">
            {model.fileType}
          </span>
        </div>
      </Link>

      {/* Content Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Subject & Category badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isMath
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-blue-50 text-blue-700 border border-blue-200/60'
              }`}
            >
              {isMath ? 'Toán học' : 'Vật lý'}
            </span>
            <span className="text-xs text-slate-500 font-medium capitalize">
              • {model.category}
            </span>
          </div>

          {/* Title */}
          <Link href={`/models/${model.id}`}>
            <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
              {model.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {model.description || 'Mô hình học tập trực quan tương tác trên trình duyệt.'}
          </p>

          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {model.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{updatedDate}</span>
          </div>

          <Link
            href={`/models/${model.id}`}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Mở mô hình</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
