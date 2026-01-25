-- TopicNest Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ DROP EXISTING TABLES (if they exist with wrong schema) ============
-- Drop in reverse order due to foreign key dependencies
-- CASCADE automatically removes any policies, indexes, etc.
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ CATEGORIES TABLE ============
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(20),
    gradient VARCHAR(100),
    glow_color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ POSTS TABLE ============
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============ COMMENTS TABLE ============
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============ BOOKMARKS TABLE ============
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ============ INDEXES FOR PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- Full-text search index for posts
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));

-- ============ INSERT DEFAULT CATEGORIES ============
INSERT INTO categories (name, slug, description, icon, gradient, glow_color) VALUES
    ('Technology', 'technology', 'Discuss the latest in tech, gadgets, and innovation', '💻', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'rgba(102, 126, 234, 0.5)'),
    ('Gaming', 'gaming', 'Connect with fellow gamers and discuss your favorite games', '🎮', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'rgba(240, 147, 251, 0.5)'),
    ('Art & Design', 'art-design', 'Share and appreciate creative works and design inspiration', '🎨', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'rgba(79, 172, 254, 0.5)'),
    ('Music', 'music', 'Discover new music and discuss your favorite artists', '🎵', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'rgba(67, 233, 123, 0.5)'),
    ('Movies & TV', 'movies-tv', 'Reviews, recommendations, and discussions about entertainment', '🎬', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 'rgba(250, 112, 154, 0.5)'),
    ('Books', 'books', 'Book reviews, recommendations, and literary discussions', '📚', 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'rgba(161, 140, 209, 0.5)')
ON CONFLICT (slug) DO NOTHING;

-- ============ ROW LEVEL SECURITY (RLS) ============
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access to users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to bookmarks" ON bookmarks
    FOR SELECT USING (true);

-- Allow public insert/update/delete for anonymous users (since we're using anon key)
CREATE POLICY "Allow public insert to users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to users" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to posts" ON posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to posts" ON posts
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete from posts" ON posts
    FOR DELETE USING (true);

CREATE POLICY "Allow public insert to comments" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to comments" ON comments
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete from comments" ON comments
    FOR DELETE USING (true);

CREATE POLICY "Allow public insert to bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete from bookmarks" ON bookmarks
    FOR DELETE USING (true);

-- ============ STORAGE BUCKET FOR IMAGES ============
-- Note: You need to create this bucket manually in Supabase Dashboard > Storage
-- Create a bucket called "post-images" with public access
-- Or run this in SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

