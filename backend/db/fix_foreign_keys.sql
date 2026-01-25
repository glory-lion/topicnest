-- Run this in Supabase SQL Editor to fix all foreign key constraints
-- This ensures deleting categories works smoothly

-- First, let's check if bookmarks table exists and create it if not
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Drop existing foreign key constraints on posts.category_id and recreate with CASCADE
-- Step 1: Find and drop the constraint (Supabase usually names it automatically)
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Find the foreign key constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'posts'::regclass 
    AND confrelid = 'categories'::regclass;
    
    -- Drop it if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE posts DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Step 2: Add it back with ON DELETE CASCADE
ALTER TABLE posts 
ADD CONSTRAINT posts_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(id) ON DELETE CASCADE;

-- Ensure comments have CASCADE
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'comments'::regclass 
    AND confrelid = 'posts'::regclass;
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE comments DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) ON DELETE CASCADE;

-- Ensure votes have CASCADE  
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'votes'::regclass 
    AND confrelid = 'posts'::regclass
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'votes'::regclass AND attname = 'post_id')];
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE votes DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE votes 
ADD CONSTRAINT votes_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) ON DELETE CASCADE;
