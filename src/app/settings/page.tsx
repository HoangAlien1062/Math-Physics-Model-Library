'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  User,
  Mail,
  Calendar,
  Shield,
  HardDrive,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteAccount = () => {
    logout();
    showToast('Tài khoản đã được đăng xuất và xóa phiên làm việc.', 'info');
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Thông tin hồ sơ, vai trò người dùng và trạng thái hệ thống lưu trữ
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Thông tin cá nhân</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl border-2 border-blue-200 overflow-hidden">
              {user?.displayName?.charAt(0) || 'U'}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">{user?.displayName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {isAdmin ? 'Quản trị viên (Admin)' : 'Người dùng / Học sinh'}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Tham gia từ {new Date(user?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Drive Central Storage info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Hạ tầng lưu trữ Google Drive</span>
            </h2>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Google Drive Admin Trung Tâm</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Toàn bộ các mô hình bạn tải lên được bảo mật và lưu trữ tập trung trên <strong>Google Drive của Quản Trị Viên</strong>. 
            Bạn không cần kết nối tài khoản Google Drive cá nhân hay cấp quyền bảo mật. Dữ liệu mô hình cá nhân của bạn được phân vùng bảo mật riêng và chỉ bạn mới có quyền xem, chỉnh sửa hoặc xóa.
          </p>
        </div>

        {/* Danger Zone: Log out and Delete Account */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Khu vực nhạy cảm</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Đăng xuất khỏi thiết bị này</p>
              <p className="text-xs text-slate-500">Xóa phiên đăng nhập hiện tại trên trình duyệt này.</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-rose-700">Xóa dữ liệu tài khoản</p>
              <p className="text-xs text-slate-500">
                Xóa bỏ toàn bộ dữ liệu cá nhân, danh sách yêu thích và các mô hình đã tải lên.
              </p>
            </div>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Xóa tài khoản</span>
            </button>
          </div>
        </div>

      </div>

      {/* Delete Account Modal Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa tài khoản?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thao tác này sẽ xóa toàn bộ mô hình và lịch sử học tập của bạn. Bạn có chắc chắn muốn tiếp tục?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
