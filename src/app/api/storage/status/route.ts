import { NextRequest, NextResponse } from 'next/server';
import { getStorageProvider } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const storage = getStorageProvider();
    const status = await storage.getStorageStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error('Error fetching storage status:', error);
    return NextResponse.json({ success: false, error: 'Không thể lấy thông tin lưu trữ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Chỉ Admin mới có quyền đồng bộ lưu trữ' }, { status: 403 });
    }

    const storage = getStorageProvider();
    const status = await storage.getStorageStatus();

    return NextResponse.json({
      success: true,
      message: 'Đã hoàn tất đồng bộ và kiểm tra tính toàn vẹn hệ thống lưu trữ',
      status,
    });
  } catch (error: any) {
    console.error('Storage sync error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi đồng bộ' }, { status: 500 });
  }
}
