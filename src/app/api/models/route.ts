import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { Subject } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);

    const subject = searchParams.get('subject') as Subject | undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const sort = (searchParams.get('sort') as any) || 'updated';
    const visibility = searchParams.get('visibility') as 'public' | 'private' | 'all' | undefined;
    const mineOnly = searchParams.get('mine') === 'true';

    let models = await db.getModels({
      subject,
      category,
      search,
      tag,
      sort,
      visibility: mineOnly ? 'private' : visibility || 'all',
      ownerUserId: mineOnly ? user.id : undefined,
    });

    // IDOR / Visibility filtering:
    // If not admin, hide other users' private models
    if (user.role !== 'admin') {
      models = models.filter((m) => m.visibility === 'public' || m.ownerUserId === user.id);
    }

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
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, subject, category, tags, visibility, entryFile, fileType, driveFileId, driveFolderId, version } = body;

    if (!title || !subject || !category) {
      return NextResponse.json({ success: false, error: 'Thiếu các trường bắt buộc' }, { status: 400 });
    }

    // Default visibility is PRIVATE for user uploads according to specs!
    const effectiveVisibility = user.role === 'admin' && visibility === 'public' ? 'public' : 'private';

    const newModel = await db.createModel({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description || '',
      subject,
      category,
      visibility: effectiveVisibility,
      ownerUserId: user.id,
      ownerName: user.displayName,
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
