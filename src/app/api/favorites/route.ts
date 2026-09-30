import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';

export async function GET() {
  try {
    const favIds = await db.getFavorites();
    return NextResponse.json({ success: true, favorites: favIds });
  } catch (error: any) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải mục yêu thích' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelId } = body;

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'Thiếu modelId' }, { status: 400 });
    }

    const isFav = await db.toggleFavorite(modelId);
    return NextResponse.json({ success: true, isFavorite: isFav });
  } catch (error: any) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật yêu thích' }, { status: 500 });
  }
}
