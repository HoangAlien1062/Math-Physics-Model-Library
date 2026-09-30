import { NextRequest } from 'next/server';
import { User } from '@/types';

export const DEMO_USERS: Record<string, User> = {
  'user-001': {
    id: 'user-001',
    email: 'hocsinh@thpt.edu.vn',
    displayName: 'Nguyễn Văn An',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: '2026-01-15T00:00:00Z',
  },
  'admin-001': {
    id: 'admin-001',
    email: 'admin@modellibrary.vn',
    displayName: 'Admin Quản Trị Viên',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: '2025-12-01T00:00:00Z',
  },
};

/**
 * Extracts currently authenticated user from Request headers, cookies, or default session
 */
export function getAuthenticatedUser(req?: NextRequest): User {
  if (!req) return DEMO_USERS['user-001'];

  // Check header or cookie for active user id
  const headerUserId = req.headers.get('x-user-id');
  const cookieUserId = req.cookies.get('model_library_user_id')?.value;
  const targetId = headerUserId || cookieUserId || 'user-001';

  return DEMO_USERS[targetId] || {
    id: targetId,
    email: `${targetId}@user.internal`,
    displayName: 'Người Dùng',
    role: targetId === 'admin-001' ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
}

/**
 * IDOR Protection: Checks if user can read model
 */
export function canAccessModel(model: { visibility: string; ownerUserId: string }, user: User): boolean {
  if (model.visibility === 'public') return true;
  if (user.role === 'admin') return true;
  return model.ownerUserId === user.id;
}

/**
 * IDOR Protection: Checks if user can modify/delete model
 */
export function canModifyModel(model: { ownerUserId: string }, user: User): boolean {
  if (user.role === 'admin') return true;
  return model.ownerUserId === user.id;
}
