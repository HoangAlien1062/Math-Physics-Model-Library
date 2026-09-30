import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { Subject } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') as Subject | undefined;
    const categories = await db.getCategories(subject);
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh mục' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, name, slug, icon, orderIndex } = body;

    if (!subject || !name) {
      return NextResponse.json({ success: false, error: 'Thiếu tên danh mục hoặc môn học' }, { status: 400 });
    }

    const created = await db.addCategory({
      subject,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      icon: icon || 'folder',
      orderIndex: orderIndex || 99,
    });

    return NextResponse.json({ success: true, category: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding category:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tạo danh mục' }, { status: 500 });
  }
}
