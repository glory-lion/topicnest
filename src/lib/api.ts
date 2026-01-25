// API Client for Go Backend
// This file provides functions to communicate with the Go backend API

// Construct API_BASE_URL robustly
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const baseUrl = rawBaseUrl.trim().replace(/\/$/, ''); // Remove trailing slash
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// ============ HELPER FUNCTIONS ============

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('topicnest_user_id');
    if (userId) {
      headers['Authorization'] = `Bearer ${userId}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// ============ TYPE DEFINITIONS ============

export interface User {
  id: string;
  username: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface UserStats extends User {
  post_count: number;
  comment_count: number;
}

// Alias for backward compatibility
export type UserWithStats = UserStats;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  gradient?: string | null;
  glow_color?: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  category_id: string;
  user_id: string;
  upvotes: number;
  created_at: string;
  updated_at?: string | null;
  // New property names
  author?: User | null;
  category?: Category | null;
  comment_count?: number;
  // Backward compatibility aliases
  users?: User | null;
  categories?: Category | null;
  comments?: Comment[] | null;
}

// Alias for backward compatibility
export type PostWithRelations = Post;

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at?: string | null;
  author?: User | null;
  // Backward compatibility alias
  users?: User | null;
}

// Alias for backward compatibility
export type CommentWithUser = Comment;

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post?: Post | null;
  // Backward compatibility alias
  posts?: Post | null;
}

// Alias for backward compatibility
export type BookmarkWithPost = Bookmark;

// ============ USER FUNCTIONS ============

export async function getOrCreateUser(username: string): Promise<User> {
  return fetchAPI<User>('/users', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function getUserById(userId: string): Promise<User> {
  return fetchAPI<User>(`/users/${userId}`);
}

export async function getUserByUsername(username: string): Promise<User> {
  return fetchAPI<User>(`/users/username/${encodeURIComponent(username.trim())}`);
}

export async function getUserWithStats(username: string): Promise<UserStats> {
  // First get user by username, then get stats
  const user = await getUserByUsername(username);
  return fetchAPI<UserStats>(`/users/${user.id}/stats`);
}

export async function updateUserProfile(
  userId: string,
  bio: string,
  avatarUrl?: string
): Promise<User> {
  return fetchAPI<User>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ bio, avatar_url: avatarUrl }),
  });
}

// ============ CATEGORY FUNCTIONS ============

export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/categories');
}

export async function getCategoryById(categoryId: string): Promise<Category> {
  return fetchAPI<Category>(`/categories/${categoryId}`);
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchAPI<Category>(`/categories/slug/${slug}`);
}

export async function createCategory(
  name: string,
  description?: string,
  icon?: string,
  gradient?: string,
  glowColor?: string
): Promise<Category> {
  return fetchAPI<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      icon,
      gradient,
      glow_color: glowColor
    }),
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await fetchAPI(`/categories/${categoryId}`, { method: 'DELETE' });
}


// ============ POST FUNCTIONS ============

export async function getPosts(categoryId?: string): Promise<Post[]> {
  const query = categoryId ? `?category_id=${categoryId}` : '';
  return fetchAPI<Post[]>(`/posts${query}`);
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  return fetchAPI<Post[]>(`/posts/category/${categorySlug}`);
}

export async function getPostById(postId: string): Promise<Post> {
  return fetchAPI<Post>(`/posts/${postId}`);
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  return fetchAPI<Post[]>(`/users/${userId}/posts`);
}

export async function createPost(
  title: string,
  content: string,
  categoryId: string,
  userId: string
): Promise<Post> {
  return fetchAPI<Post>(`/posts?user_id=${userId}`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      content,
      category_id: categoryId
    }),
  });
}

export async function createPostWithImage(
  title: string,
  content: string,
  categoryId: string,
  userId: string,
  imageUrl?: string
): Promise<Post> {
  return fetchAPI<Post>(`/posts?user_id=${userId}`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      content,
      category_id: categoryId,
      image_url: imageUrl
    }),
  });
}

export async function updatePost(
  postId: string,
  title: string,
  content: string,
  imageUrl?: string
): Promise<Post> {
  return fetchAPI<Post>(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content, image_url: imageUrl }),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await fetchAPI(`/posts/${postId}`, { method: 'DELETE' });
}

export async function upvotePost(postId: string): Promise<Post> {
  return fetchAPI<Post>(`/posts/${postId}/upvote`, { method: 'POST' });
}

export async function searchPosts(query: string): Promise<Post[]> {
  if (!query.trim()) return [];
  return fetchAPI<Post[]>(`/posts/search?q=${encodeURIComponent(query)}`);
}

// ============ COMMENT FUNCTIONS ============

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  return fetchAPI<Comment[]>(`/posts/${postId}/comments`);
}

export async function createComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment> {
  return fetchAPI<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, user_id: userId }),
  });
}

export async function updateComment(
  commentId: string,
  content: string
): Promise<Comment> {
  return fetchAPI<Comment>(`/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  await fetchAPI(`/comments/${commentId}`, { method: 'DELETE' });
}

export async function upvoteComment(commentId: string): Promise<Comment> {
  return fetchAPI<Comment>(`/comments/${commentId}/upvote`, { method: 'POST' });
}

// ============ BOOKMARK FUNCTIONS ============

export async function getBookmarksByUser(userId: string): Promise<Bookmark[]> {
  return fetchAPI<Bookmark[]>(`/users/${userId}/bookmarks`);
}

export async function addBookmark(userId: string, postId: string): Promise<Bookmark> {
  return fetchAPI<Bookmark>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, post_id: postId }),
  });
}

export async function removeBookmark(userId: string, postId: string): Promise<void> {
  await fetchAPI(`/bookmarks?user_id=${userId}&post_id=${postId}`, {
    method: 'DELETE'
  });
}

export async function isPostBookmarked(
  userId: string,
  postId: string
): Promise<boolean> {
  const result = await fetchAPI<{ bookmarked: boolean }>(
    `/bookmarks/check?user_id=${userId}&post_id=${postId}`
  );
  return result.bookmarked;
}

// ============ HELPER FUNCTIONS ============

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

// ============ IMAGE UPLOAD (Still using Supabase for storage) ============
// Note: Image uploads still go through Supabase Storage since the Go backend
// doesn't handle file uploads. This is a hybrid approach.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnkzpufpttsunuqybzcx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua3pwdWZwdHRzdW51cXliemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY5MTYsImV4cCI6MjA4NDE4MjkxNn0.KRvJHE4pW71PIxvl73RfbAqwYAZjGH8RNCKJ9ar9m7A';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadPostImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `posts/${userId}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function uploadAvatarImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `avatars/${userId}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
