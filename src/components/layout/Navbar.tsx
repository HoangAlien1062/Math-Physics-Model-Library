'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Atom,
  Sigma,
  Star,
  PlusCircle,
  Search,
  HardDrive,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { StorageStatus } from '@/types';

interface NavbarProps {
  onOpenUpload?: () => void;
}

export function Navbar({ onOpenUpload }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Storage Status for Drive indicator
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
    { label: 'Yêu thích', href: '/my-library', icon: Star },
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
                Personal Library
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
            <Link
              href="/settings"
              title={
                storageStatus?.provider === 'google_drive'
                  ? `Google Drive: Đã kết nối (${storageStatus.adminEmail || 'Tài khoản Drive'}) • Supabase Cache: Kích hoạt`
                  : 'Lưu trữ cục bộ / Sẵn sàng kết nối Google Drive & Supabase'
              }
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span>Drive:</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {storageStatus?.provider === 'google_drive' ? 'Connected' : 'Sẵn sàng'}
              </span>
            </Link>

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

            {/* Settings Button */}
            <Link
              href="/settings"
              title="Cài đặt lưu trữ & hệ thống"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm mô hình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-200"
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Settings className="w-4 h-4" />
              Cài đặt & Google Drive
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
