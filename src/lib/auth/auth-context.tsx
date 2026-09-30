'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginAs: (userId: 'user-001' | 'admin-001') => void;
  logout: () => void;
}

const DEMO_USERS: Record<string, User> = {
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  loginAs: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USERS['user-001']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Read user id from cookie or localStorage
    const saved = localStorage.getItem('model_library_user_id');
    if (saved && DEMO_USERS[saved]) {
      setUser(DEMO_USERS[saved]);
      document.cookie = `model_library_user_id=${saved}; path=/; max-age=864000`;
    } else {
      document.cookie = `model_library_user_id=user-001; path=/; max-age=864000`;
    }
  }, []);

  const loginAs = (userId: 'user-001' | 'admin-001') => {
    const selected = DEMO_USERS[userId];
    if (selected) {
      setUser(selected);
      localStorage.setItem('model_library_user_id', userId);
      document.cookie = `model_library_user_id=${userId}; path=/; max-age=864000`;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('model_library_user_id');
    document.cookie = `model_library_user_id=; path=/; max-age=0`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
