import path from 'path';

/**
 * Sanitizes a relative file path to prevent Directory Traversal attacks (e.g. ../../etc/passwd)
 */
export function sanitizeRelativePath(unsafePath: string): string {
  // Normalize and remove null bytes
  const clean = unsafePath.replace(/\0/g, '').replace(/\\/g, '/');
  
  // Resolve path segments safely
  const segments = clean.split('/').filter(s => s && s !== '.' && s !== '..');
  return segments.join('/');
}

/**
 * Checks if a filename is a valid, safe entry file
 */
export function isValidEntryFile(filename: string): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return lower.endsWith('.html') || lower.endsWith('.htm');
}

/**
 * Validates file size limits
 */
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_UNCOMPRESSED_RATIO = 20; // Zip bomb defense

export function validateFileSize(size: number, maxBytes: number = MAX_UPLOAD_SIZE): boolean {
  return size > 0 && size <= maxBytes;
}

/**
 * Basic HTML escape for metadata strings
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
