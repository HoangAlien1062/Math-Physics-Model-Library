import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { getAuthenticatedUser, canAccessModel } from '@/lib/auth/session';
import { getStorageProvider } from '@/lib/storage';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const user = getAuthenticatedUser(req);
    const model = await db.getModelById(resolvedParams.id);

    if (!model) {
      return new NextResponse('<h1>404 - Mô hình không tồn tại</h1>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // IDOR Protection: Private models accessible only to owner or admin
    if (!canAccessModel(model, user)) {
      return new NextResponse('<h1>403 - Bạn không có quyền truy cập mô hình này</h1>', {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const { searchParams } = new URL(req.url);
    const assetPath = searchParams.get('file');

    // 1. Check if model is a demo model in public/demo-models
    if (model.driveFileId.startsWith('demo_')) {
      const demoFilePath = path.join(process.cwd(), 'public', 'demo-models', model.driveFileId);
      if (fs.existsSync(demoFilePath)) {
        const content = fs.readFileSync(demoFilePath, 'utf-8');
        return new NextResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-Content-Type-Options': 'nosniff',
            // Isolated sandbox CSP allows scripts and styles, but prevents navigation escape
            'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors 'self'",
          },
        });
      }
    }

    // 2. Fetch model file from Google Drive Admin Storage or fallback provider
    const storage = getStorageProvider();
    const stored = await storage.getModelFile(model.driveFileId);

    if (!stored) {
      return new NextResponse('<h1>404 - File mô hình không tìm thấy trên hệ thống lưu trữ</h1>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 3. If model is a single HTML file
    if (model.fileType === 'html' || stored.fileName.endsWith('.html') || stored.fileName.endsWith('.htm')) {
      return new NextResponse(stored.buffer.toString('utf-8'), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors 'self'",
        },
      });
    }

    // 4. If model is a ZIP project
    if (model.fileType === 'zip' || stored.fileName.endsWith('.zip')) {
      const zip = await JSZip.loadAsync(stored.buffer);

      // Determine which file inside zip to serve
      const targetFileInZip = assetPath || model.entryFile || 'index.html';
      const fileEntry = zip.file(targetFileInZip);

      if (!fileEntry) {
        // Fallback: look for index.html or first html
        const indexHtml = zip.file('index.html') || zip.file('index.htm');
        if (indexHtml) {
          const content = await indexHtml.async('nodebuffer');
          return new NextResponse(new Uint8Array(content), {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Frame-Options': 'SAMEORIGIN',
              'X-Content-Type-Options': 'nosniff',
              'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors 'self'",
            },
          });
        }

        return new NextResponse(`<h1>404 - Không tìm thấy file '${targetFileInZip}' trong project ZIP</h1>`, {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Determine content-type based on file extension
      const lower = targetFileInZip.toLowerCase();
      let contentType = 'application/octet-stream';
      if (lower.endsWith('.html') || lower.endsWith('.htm')) contentType = 'text/html; charset=utf-8';
      else if (lower.endsWith('.css')) contentType = 'text/css';
      else if (lower.endsWith('.js')) contentType = 'application/javascript';
      else if (lower.endsWith('.json')) contentType = 'application/json';
      else if (lower.endsWith('.png')) contentType = 'image/png';
      else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (lower.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (lower.endsWith('.mp3')) contentType = 'audio/mpeg';

      const fileBuffer = await fileEntry.async('nodebuffer');
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    return new NextResponse('<h1>500 - Định dạng file mô hình không hợp lệ</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error in secure model runner:', error);
    return new NextResponse(`<h1>500 - Không thể khởi chạy mô hình</h1><p>${error.message}</p>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
