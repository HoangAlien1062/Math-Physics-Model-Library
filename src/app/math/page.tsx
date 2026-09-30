'use client';

import React, { Suspense } from 'react';
import { SubjectView } from '@/components/model/SubjectView';

export default function MathPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Đang tải mô hình Toán học...</div>}>
      <SubjectView
        subject="math"
        title="Thư viện Mô hình Toán học"
        description="Khám phá các mô phỏng trực quan: Đại số, Giải tích, Hình học, Hàm số, Vector và Không gian Oxyz."
      />
    </Suspense>
  );
}
