import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { getAuthenticatedUser, canAccessModel, canModifyModel } from '@/lib/auth/session';
import { getStorageProvider } from '@/lib/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const user = getAuthenticatedUser(req);
    const model = await db.getModelById(resolvedParams.id);

    if (!model) {
      return NextResponse.json({ success: false, error: 'Mô hình không tồn tại' }, { status: 404 });
    }

    // IDOR Protection: Private models can only be viewed by owner or admin
    if (!canAccessModel(model, user)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền truy cập mô hình này' },
        { status: 403 }
      );
    }

    // Record recent view
    if (user) {
      await db.recordRecentView(user.id, model.id);
    }

    return NextResponse.json({ success: true, model });
  } catch (error: any) {
    console.error('Error getting model:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải chi tiết mô hình' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const user = getAuthenticatedUser(req);
    const model = await db.getModelById(resolvedParams.id);

    if (!model) {
      return NextResponse.json({ success: false, error: 'Mô hình không tồn tại' }, { status: 404 });
    }

    // IDOR Protection: Only owner or admin can update
    if (!canModifyModel(model, user)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền chỉnh sửa mô hình này' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const allowedUpdates: any = {};

    if (body.title) allowedUpdates.title = body.title;
    if (body.description !== undefined) allowedUpdates.description = body.description;
    if (body.category) allowedUpdates.category = body.category;
    if (Array.isArray(body.tags)) allowedUpdates.tags = body.tags;
    if (body.version) allowedUpdates.version = body.version;

    // Only admin can toggle visibility to public
    if (body.visibility) {
      if (user.role === 'admin') {
        allowedUpdates.visibility = body.visibility;
      } else if (body.visibility === 'private') {
        allowedUpdates.visibility = 'private';
      }
    }

    const updated = await db.updateModel(model.id, allowedUpdates);
    return NextResponse.json({ success: true, model: updated });
  } catch (error: any) {
    console.error('Error updating model:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật mô hình' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const user = getAuthenticatedUser(req);
    const model = await db.getModelById(resolvedParams.id);

    if (!model) {
      return NextResponse.json({ success: false, error: 'Mô hình không tồn tại' }, { status: 404 });
    }

    // IDOR Protection: Only owner or admin can delete
    if (!canModifyModel(model, user)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền xóa mô hình này' },
        { status: 403 }
      );
    }

    // Delete file from Admin Google Drive / Storage Provider
    const storage = getStorageProvider();
    if (model.driveFileId) {
      try {
        await storage.deleteModel(model.driveFileId, model.driveFolderId);
      } catch (fileErr) {
        console.warn('Storage file deletion warning:', fileErr);
      }
    }

    // Delete metadata from DB
    await db.deleteModel(model.id);

    return NextResponse.json({ success: true, message: 'Đã xóa mô hình thành công' });
  } catch (error: any) {
    console.error('Error deleting model:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi xóa mô hình' }, { status: 500 });
  }
}
