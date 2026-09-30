-- Math & Physics Model Library - Supabase / PostgreSQL Schema
-- Migration 001: Initial Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics')),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subject, slug)
);

-- 3. Models Table (Metadata only, NO binary files stored in DB)
CREATE TABLE IF NOT EXISTS public.models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics')),
    category TEXT NOT NULL,
    thumbnail_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
    owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    drive_file_id TEXT NOT NULL,
    drive_folder_id TEXT,
    entry_file TEXT NOT NULL DEFAULT 'index.html',
    file_type TEXT NOT NULL CHECK (file_type IN ('html', 'zip')),
    file_size BIGINT DEFAULT 0,
    version TEXT NOT NULL DEFAULT '1.0.0',
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('pending', 'uploading', 'processing', 'ready', 'failed', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Model Tags
CREATE TABLE IF NOT EXISTS public.model_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    UNIQUE(model_id, tag)
);

-- 5. User Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, model_id)
);

-- 6. User Recent Views (limited to recent history)
CREATE TABLE IF NOT EXISTS public.recent_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, model_id)
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid querying & debounce search
CREATE INDEX IF NOT EXISTS idx_models_subject_category ON public.models(subject, category);
CREATE INDEX IF NOT EXISTS idx_models_visibility ON public.models(visibility);
CREATE INDEX IF NOT EXISTS idx_models_owner ON public.models(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_models_title_trgm ON public.models(title);
CREATE INDEX IF NOT EXISTS idx_model_tags_tag ON public.model_tags(tag);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_user_opened ON public.recent_views(user_id, last_opened_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Categories: readable by anyone, editable only by admins
CREATE POLICY "Categories readable by all" ON public.categories FOR SELECT USING (true);

-- Models: Public models readable by all. Private models readable only by owner or admin
CREATE POLICY "Public models visible to all" ON public.models
    FOR SELECT USING (visibility = 'public' OR owner_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can insert own models" ON public.models
    FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update own models or admin" ON public.models
    FOR UPDATE USING (owner_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can delete own models or admin" ON public.models
    FOR DELETE USING (owner_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Favorites policies
CREATE POLICY "Users manage own favorites" ON public.favorites
    FOR ALL USING (user_id = auth.uid());

-- Recent views policies
CREATE POLICY "Users manage own recent views" ON public.recent_views
    FOR ALL USING (user_id = auth.uid());
