import React from 'react';
import Link from 'next/link';
import { Sigma, Atom, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <span className="text-blue-600 font-bold">M&P</span> Model Library
          </div>
          <span>•</span>
          <p>Thư viện mô hình tương tác Toán học & Vật lý</p>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/math" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Sigma className="w-3.5 h-3.5" /> Toán
          </Link>
          <Link href="/physics" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Atom className="w-3.5 h-3.5" /> Vật lý
          </Link>
          <Link href="/my-library" className="hover:text-blue-600 transition-colors">
            Thư viện của tôi
          </Link>
          <Link href="/settings" className="hover:text-blue-600 transition-colors">
            Cài đặt
          </Link>
        </div>
      </div>
    </footer>
  );
}
