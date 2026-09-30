'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Atom,
  Sigma,
  BookOpen,
  PlusCircle,
  Search,
  HardDrive,
  CheckCircle2,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Shield,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { StorageStatus } from '@/types';

interface NavbarProps {
  onOpenUpload?: () => void;
}

export function Navbar({ onOpenUpload }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loginAs, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Storage Status for admin status indicator
  useEffect(() => {
    fetch('/api/storage/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStorageStatus(data.status);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/math?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Trang chủ', href: '/', icon: Compass },
    { label: 'Toán học', href: '/math', icon: Sigma },
    { label: 'Vật lý', href: '/physics', icon: Atom },
    { label: 'Thư viện của tôi', href: '/my-library', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg tracking-tight">M&P</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 text-base leading-tight block">
                Math & Physics
              </span>
              <span className="text-xs text-blue-600 font-medium tracking-wide">
                Model Library
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm mô hình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 pl-9 pr-4 py-1.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Storage Status Pill */}
            <div
              title={
                storageStatus?.provider === 'google_drive'
                  ? `Google Drive Admin Storage: Đã kết nối (${storageStatus.adminEmail || 'admin'})`
                  : 'Lưu trữ cục bộ cho môi trường Dev (Sẵn sàng đồng bộ Google Drive)'
              }
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-700"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span>Drive:</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {storageStatus?.provider === 'google_drive' ? 'Connected' : 'Admin Sẵn sàng'}
              </span>
            </div>

            {/* Add Model Button */}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Thêm mô hình</span>
              </button>
            )}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs border border-blue-200 overflow-hidden">
                  {user?.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">
                    {user?.displayName || 'Khách'}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {isAdmin ? 'Quản trị viên' : 'Học sinh / GV'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Đang đăng nhập với tư cách</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>

                  {/* Switch Account Quick Toggle for Testing */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chuyển đổi vai trò test
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          loginAs('user-001');
                          setUserDropdownOpen(false);
                        }}
                        className={`flex-1 text-xs py-1 px-2 rounded font-medium transition-colors ${
                          user?.id === 'user-001'
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        User
                      </button>
                      <button
                        onClick={() => {
                          loginAs('admin-001');
                          setUserDropdownOpen(false);
                        }}
                        className={`flex-1 text-xs py-1 px-2 rounded font-medium transition-colors ${
                          user?.id === 'admin-001'
                            ? 'bg-purple-100 text-purple-700 font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      Trang Quản Trị (Admin)
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Cài đặt tài khoản
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="mb-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm mô hình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-700 bg-purple-50"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              Bảng điều khiển Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
