-- =========================================================================
-- MATH & PHYSICS MODEL LIBRARY - SUPABASE DATABASE RESET & INIT SCRIPT
-- Chạy đoạn script này trong Supabase -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. XÓA BỎ TOÀN BỘ CÁC BẢNG CŨ VÀ DỮ LIỆU RÁC XUNG ĐỘT (TỪ CÁC CODE CŨ)
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.recent_views CASCADE;
DROP TABLE IF EXISTS public.model_tags CASCADE;
DROP TABLE IF EXISTS public.models CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TẠO BẢNG MODELS CHUẨN (id dạng TEXT để hỗ trợ mã model của ứng dụng)
CREATE TABLE public.models (
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

-- 3. TẠO BẢNG DANH MỤC CATEGORIES
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics')),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subject, slug)
);

-- 4. TẠO BẢNG FAVORITES & RECENT VIEWS
CREATE TABLE public.favorites (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.recent_views (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TẠO INDEX ĐỂ TRUY VẤN CỰC NHANH
CREATE INDEX idx_models_subject_category ON public.models(subject, category);
CREATE INDEX idx_models_status ON public.models(status);
CREATE INDEX idx_models_updated_at ON public.models(updated_at DESC);
CREATE INDEX idx_favorites_model ON public.favorites(model_id);
CREATE INDEX idx_recent_model_opened ON public.recent_views(last_opened_at DESC);

-- 6. TẮT ROW LEVEL SECURITY (RLS) ĐỂ APP KẾT NỐI TRỰC TIẾP KHÔNG BỊ CHẶN QUYỀN
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_views DISABLE ROW LEVEL SECURITY;
