import { NextRequest, NextResponse } from 'next/server';
import { getStorageProvider } from '@/lib/storage';
import { db } from '@/lib/database/db';
import { sanitizeRelativePath, isValidEntryFile, MAX_UPLOAD_SIZE, MAX_UNCOMPRESSED_RATIO } from '@/lib/security/sanitize';
import { ModelManifest, Subject } from '@/types';
import JSZip from 'jszip';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const formSubject = formData.get('subject') as Subject | null;
    const formCategory = formData.get('category') as string | null;
    const formTitle = formData.get('title') as string | null;
    const formDescription = formData.get('description') as string | null;
    const formTags = formData.get('tags') as string | null;
    const formEntryFile = formData.get('entryFile') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Chưa chọn file để tải lên' }, { status: 400 });
    }

    // 1. Validate file size
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { success: false, error: `Kích thước file vượt quá giới hạn tối đa (${MAX_UPLOAD_SIZE / (1024 * 1024)}MB)` },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const isZip = fileName.toLowerCase().endsWith('.zip');
    const isHtml = fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm');

    if (!isZip && !isHtml) {
      return NextResponse.json(
        { success: false, error: 'Chỉ chấp nhận file .html hoặc .zip project' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let detectedEntryFile = 'index.html';
    let detectedFileType: 'html' | 'zip' = isZip ? 'zip' : 'html';
    let manifestData: ModelManifest = {};

    // 2. If ZIP: inspect and validate contents
    if (isZip) {
      let zip: JSZip;
      try {
        zip = await JSZip.loadAsync(buffer);
      } catch (zipErr) {
        return NextResponse.json(
          { success: false, error: 'File ZIP không hợp lệ hoặc bị hỏng' },
          { status: 400 }
        );
      }

      let totalUncompressedSize = 0;
      const htmlFiles: string[] = [];

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        // Path traversal defense
        const cleanPath = sanitizeRelativePath(relativePath);
        if (cleanPath !== relativePath.replace(/\\/g, '/').replace(/^\//, '')) {
          return NextResponse.json(
            { success: false, error: `Phát hiện đường dẫn không an toàn trong file ZIP: ${relativePath}` },
            { status: 400 }
          );
        }

        if (!zipEntry.dir) {
          // Zip bomb check
          const uncompressedSize = (zipEntry as any)._data?.uncompressedSize || 0;
          totalUncompressedSize += uncompressedSize;

          if (totalUncompressedSize > file.size * MAX_UNCOMPRESSED_RATIO && totalUncompressedSize > 50 * 1024 * 1024) {
            return NextResponse.json(
              { success: false, error: 'Phát hiện file ZIP có dấu hiệu nén bất thường (Zip bomb)' },
              { status: 400 }
            );
          }

          if (isValidEntryFile(relativePath)) {
            htmlFiles.push(relativePath);
          }
        }
      }

      // Check model.json manifest
      const manifestFile = zip.file('model.json');
      if (manifestFile) {
        try {
          const jsonText = await manifestFile.async('text');
          manifestData = JSON.parse(jsonText);
        } catch (e) {
          console.warn('Could not parse model.json inside zip:', e);
        }
      }

      // Determine entry file
      if (formEntryFile && htmlFiles.includes(formEntryFile)) {
        detectedEntryFile = formEntryFile;
      } else if (manifestData.entry && htmlFiles.includes(manifestData.entry)) {
        detectedEntryFile = manifestData.entry;
      } else if (htmlFiles.includes('index.html')) {
        detectedEntryFile = 'index.html';
      } else if (htmlFiles.includes('index.htm')) {
        detectedEntryFile = 'index.htm';
      } else if (htmlFiles.length > 0) {
        detectedEntryFile = htmlFiles[0];
      } else {
        return NextResponse.json(
          { success: false, error: 'File ZIP không chứa bất kỳ file .html nào' },
          { status: 400 }
        );
      }
    }

    // Merge metadata
    const finalSubject: Subject = (formSubject || manifestData.subject || 'physics') as Subject;
    const finalCategory = formCategory || manifestData.category || 'khac';
    const finalTitle = formTitle || manifestData.title || fileName.replace(/\.[^/.]+$/, '');
    const finalDescription = formDescription || manifestData.description || 'Mô hình học tập tương tác';
    const finalVersion = manifestData.version || '1.0.0';

    let finalTags: string[] = [];
    if (formTags) {
      finalTags = formTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    } else if (manifestData.tags && Array.isArray(manifestData.tags)) {
      finalTags = manifestData.tags;
    }

    const modelId = `model-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 3. Upload to Google Drive Storage / Local fallback
    const storage = getStorageProvider();
    const uploadResult = await storage.uploadModel({
      modelId,
      subject: finalSubject,
      fileName,
      fileBuffer: buffer,
      mimeType: isZip ? 'application/zip' : 'text/html',
    });

    // 4. Save metadata in database
    const modelRecord = await db.createModel({
      title: finalTitle,
      slug: finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50),
      description: finalDescription,
      subject: finalSubject,
      category: finalCategory,
      driveFileId: uploadResult.driveFileId,
      driveFolderId: uploadResult.driveFolderId,
      entryFile: detectedEntryFile,
      fileType: detectedFileType,
      fileSize: uploadResult.fileSize,
      version: finalVersion,
      status: 'ready',
      tags: finalTags,
    });

    return NextResponse.json({
      success: true,
      message: 'Tải lên mô hình thành công vào hệ thống lưu trữ!',
      model: modelRecord,
      storage: {
        provider: uploadResult.provider,
        driveFileId: uploadResult.driveFileId,
      },
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý tải lên mô hình' },
      { status: 500 }
    );
  }
}
