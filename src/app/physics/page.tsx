'use client';

import React, { Suspense } from 'react';
import { SubjectView } from '@/components/model/SubjectView';

export default function PhysicsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Đang tải mô hình Vật lý...</div>}>
      <SubjectView
        subject="physics"
        title="Thư viện Mô hình Vật lý"
        description="Khảo sát thế giới vật lý tương tác: Cơ học, Nhiệt học, Dao động, Sóng, Điện từ và Thí nghiệm ảo."
      />
    </Suspense>
  );
}
