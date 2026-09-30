'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { UploadModal } from '../model/UploadModal';
import { useRouter } from 'next/navigation';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Refresh current route to show newly uploaded model
    router.refresh();
  };

  return (
    <>
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
