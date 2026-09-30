import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { getAuthenticatedUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: true, favorites: [] });
    }

    const favIds = await db.getFavorites(user.id);
    return NextResponse.json({ success: true, favorites: favIds });
  } catch (error: any) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải mục yêu thích' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { modelId } = body;

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'Thiếu modelId' }, { status: 400 });
    }

    const isFav = await db.toggleFavorite(user.id, modelId);
    return NextResponse.json({ success: true, isFavorite: isFav });
  } catch (error: any) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật yêu thích' }, { status: 500 });
  }
}
