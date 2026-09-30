import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { getAuthenticatedUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: true, recentModels: [] });
    }

    const recentViews = await db.getRecentViews(user.id);
    const modelIds = recentViews.map((r) => r.modelId);

    const allModels = await db.getModels();
    const map = new Map(allModels.map((m) => [m.id, m]));

    const recentModels = modelIds
      .map((id) => map.get(id))
      .filter(Boolean);

    return NextResponse.json({ success: true, recentModels });
  } catch (error: any) {
    console.error('Recent models GET error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải lịch sử' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const { modelId } = body;

    if (modelId) {
      await db.recordRecentView(user.id, modelId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Recent models POST error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi ghi nhận lịch sử' }, { status: 500 });
  }
}
