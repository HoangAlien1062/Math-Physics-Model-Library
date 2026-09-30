-- Math & Physics Model Library - Supabase / PostgreSQL Schema
-- Migration 001: Personal Library Schema (No Auth / Direct Access)

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Models Table (Metadata only, NO binary files stored in DB)
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT DEFAULT '',
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics')),
    category TEXT NOT NULL,
    thumbnail_url TEXT,
    drive_file_id TEXT,
    drive_folder_id TEXT,
    cache_path TEXT,
    entry_file TEXT NOT NULL DEFAULT 'index.html',
    file_type TEXT NOT NULL DEFAULT 'html' CHECK (file_type IN ('html', 'zip')),
    file_size BIGINT DEFAULT 0,
    version TEXT NOT NULL DEFAULT '1.0.0',
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('pending', 'uploading', 'processing', 'ready', 'failed', 'deleted')),
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics')),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subject, slug)
);

-- 4. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Recent Views Table
CREATE TABLE IF NOT EXISTS public.recent_views (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_models_subject_category ON public.models(subject, category);
CREATE INDEX IF NOT EXISTS idx_models_status ON public.models(status);
CREATE INDEX IF NOT EXISTS idx_models_updated_at ON public.models(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_model ON public.favorites(model_id);
CREATE INDEX IF NOT EXISTS idx_recent_model_opened ON public.recent_views(last_opened_at DESC);

-- Disable Row Level Security (RLS) so your personal library API works freely with ANON/SERVICE keys
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_views DISABLE ROW LEVEL SECURITY;
