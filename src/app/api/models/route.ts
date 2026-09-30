import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { Subject } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const subject = searchParams.get('subject') as Subject | undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const sort = (searchParams.get('sort') as any) || 'updated';

    const models = await db.getModels({
      subject,
      category,
      search,
      tag,
      sort,
    });

    return NextResponse.json({
      success: true,
      count: models.length,
      models,
    });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách mô hình' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, subject, category, tags, entryFile, fileType, driveFileId, driveFolderId, version } = body;

    if (!title || !subject || !category) {
      return NextResponse.json({ success: false, error: 'Thiếu các trường bắt buộc' }, { status: 400 });
    }

    const newModel = await db.createModel({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description || '',
      subject,
      category,
      driveFileId: driveFileId || 'pending',
      driveFolderId,
      entryFile: entryFile || 'index.html',
      fileType: fileType || 'html',
      version: version || '1.0.0',
      status: 'ready',
      tags: Array.isArray(tags) ? tags : [],
    });

    return NextResponse.json({ success: true, model: newModel }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating model:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tạo mô hình' }, { status: 500 });
  }
}
