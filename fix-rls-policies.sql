-- ============================================
-- OPTION 1: QUICK FIX - DISABLE RLS TEMPORARILY
-- This is the simplest solution to get everything working
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS on all tables (allows all operations)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- ============================================
-- After running the above, everything should work:
-- ✅ Profile photo updates
-- ✅ Post deletion
-- ✅ Comment deletion
-- ✅ Bookmark operations
-- ============================================


-- ============================================
-- OPTION 2: IF YOU WANT RLS ENABLED WITH PUBLIC ACCESS
-- Run this INSTEAD of the above (not both)
-- ============================================

/*
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow public insert to users" ON users;
DROP POLICY IF EXISTS "Allow public update to users" ON users;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to posts" ON posts;
DROP POLICY IF EXISTS "Allow public insert to posts" ON posts;
DROP POLICY IF EXISTS "Allow public update to posts" ON posts;
DROP POLICY IF EXISTS "Allow public delete from posts" ON posts;
DROP POLICY IF EXISTS "Allow public read access to comments" ON comments;
DROP POLICY IF EXISTS "Allow public insert to comments" ON comments;
DROP POLICY IF EXISTS "Allow public update to comments" ON comments;
DROP POLICY IF EXISTS "Allow public delete from comments" ON comments;
DROP POLICY IF EXISTS "Allow public read access to bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Allow public insert to bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Allow public delete from bookmarks" ON bookmarks;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Categories table policies
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Posts table policies
CREATE POLICY "Allow all on posts" ON posts FOR ALL USING (true) WITH CHECK (true);

-- Comments table policies
CREATE POLICY "Allow all on comments" ON comments FOR ALL USING (true) WITH CHECK (true);

-- Bookmarks table policies
CREATE POLICY "Allow all on bookmarks" ON bookmarks FOR ALL USING (true) WITH CHECK (true);
*/
