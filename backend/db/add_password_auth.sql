-- Add password authentication to users table
-- Run this in Supabase SQL Editor

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- For existing users without passwords, you can either:
-- 1. Set a default password hash (not recommended)
-- 2. Require them to set a password on next login
-- 3. Keep username-only auth for existing users

-- Note: New users will be required to set a password
