-- Run this in your Supabase SQL Editor to update the database schema for the new features

-- 1. Ensure categories table exists with all necessary columns
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- or SERIAL if you used that previously
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    gradient TEXT,
    glow_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add new columns for customization (Gradient & Glow) if they don't exist yet
DO $$
BEGIN
    -- Add gradient column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'gradient') THEN
        ALTER TABLE categories ADD COLUMN gradient TEXT;
    END IF;

    -- Add glow_color column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'glow_color') THEN
        ALTER TABLE categories ADD COLUMN glow_color TEXT;
    END IF;

    -- Add icon column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
        ALTER TABLE categories ADD COLUMN icon TEXT;
    END IF;
END $$;
