import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import { LayoutShell } from '@/components/layout/LayoutShell';

export const metadata: Metadata = {
  title: 'Math & Physics Model Library - Thư viện mô hình Toán & Vật lý tương tác',
  description: 'Nền tảng quản lý và chạy trực tiếp các mô hình học tập Toán học và Vật lý dạng HTML/CSS/JavaScript trong môi trường Sandbox an toàn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          <ToastProvider>
            <LayoutShell>{children}</LayoutShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
