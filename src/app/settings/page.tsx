'use client';

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  CheckCircle2,
  FolderSync,
  Database,
  Layers,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { StorageStatus } from '@/types';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [modelCount, setModelCount] = useState({ total: 0, math: 0, physics: 0 });

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/storage/status');
      const data = await res.json();
      if (data.success) {
        setStorageStatus(data.status);
      }

      const modelsRes = await fetch('/api/models');
      const modelsData = await modelsRes.json();
      if (modelsData.success && modelsData.models) {
        const math = modelsData.models.filter((m: any) => m.subject === 'math').length;
        const physics = modelsData.models.filter((m: any) => m.subject === 'physics').length;
        setModelCount({ total: modelsData.models.length, math, physics });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSyncStorage = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/storage/status', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStorageStatus(data.status);
        showToast('Đã kiểm tra và đồng bộ trạng thái lưu trữ thành công!', 'success');
      } else {
        showToast(data.error || 'Lỗi khi đồng bộ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const isBlob = storageStatus?.provider === 'vercel_blob';
  const isDrive = storageStatus?.provider === 'google_drive';

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt & Hệ thống lưu trữ</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Quản lý kết nối lưu trữ đám mây và số liệu thư viện cá nhân
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Storage Provider Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isBlob
                    ? 'Vercel Blob Cloud Storage'
                    : isDrive
                    ? 'Google Drive Cloud Storage'
                    : 'Lưu trữ cục bộ (Local Storage)'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBlob
                    ? 'Đang kết nối tự động với Vercel Blob Store (1-Click Storage)'
                    : isDrive
                    ? `Đang kết nối: ${storageStatus?.adminEmail || 'Tài khoản Google Drive'}`
                    : 'Đang chạy lưu trữ trên máy chủ / Fallback'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncStorage}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <FolderSync className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Trạng thái kết nối</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Hoạt động bình thường
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Cơ chế lưu trữ</span>
              <span className="font-semibold text-slate-800">
                {isBlob
                  ? 'Vercel Blob Storage (Đám mây tốc độ cao)'
                  : isDrive
                  ? 'Đám mây Google Drive (Vĩnh viễn)'
                  : 'Thư mục cục bộ / Tạm thời'}
              </span>
            </div>
            {storageStatus?.rootFolderId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Root Folder ID</span>
                <span className="font-mono text-slate-700">{storageStatus.rootFolderId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Library Statistics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Thống kê thư viện cá nhân</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-2xl font-black text-slate-900">{modelCount.total}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Tổng số mô hình</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="text-2xl font-black text-emerald-700">{modelCount.math}</div>
              <div className="text-xs text-emerald-600 mt-1 font-medium">Mô hình Toán học</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="text-2xl font-black text-blue-700">{modelCount.physics}</div>
              <div className="text-xs text-blue-600 mt-1 font-medium">Mô hình Vật lý</div>
            </div>
          </div>
        </div>

        {/* Architecture Note */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Cấu trúc lưu trữ mô hình</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thư viện được cấu hình lưu trữ trực tiếp trên Google Drive của bạn dưới cấu trúc thư mục rõ ràng:
          </p>
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono">
            <div>📁 Math Physics Model Library/</div>
            <div className="pl-4">├── 📁 Math/ (Các mô hình Toán học)</div>
            <div className="pl-4">└── 📁 Physics/ (Các mô hình Vật lý)</div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Khi bạn tải lên file HTML hoặc file nén ZIP, hệ thống sẽ tự động phân loại và lưu trữ trực tiếp vào thư mục tương ứng trên Google Drive.
          </p>
        </div>

      </div>

    </div>
  );
}
