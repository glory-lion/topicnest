// TopicNest API Client
// Connects to Go backend at http://localhost:8080

const API_BASE = 'http://localhost:8080/api';

// --- Types ---

export interface User {
  id: number;
  username: string;
  karma: number;
  createdAt: string;
}

export interface Community {
  id: number;
  name: string;
  displayName: string;
  description: string;
  members: number;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  author: User;
  community: Community;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isOC?: boolean;
  userVote?: 'up' | 'down' | null;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  postId: number;
  parentId?: number;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
  userVote?: 'up' | 'down' | null;
  createdAt: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Storage ---

let authToken: string | null = null;
let currentUser: User | null = null;

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_token');
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('session_token', token);
    authToken = token;
  } else {
    localStorage.removeItem('session_token');
    authToken = null;
  }
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function setCurrentUser(user: User | null): void {
  currentUser = user;
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }
}

// Initialize from localStorage
export function initAuth(): void {
  if (typeof window === 'undefined') return;
  authToken = getStoredToken();
  const userStr = localStorage.getItem('current_user');
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch {
      currentUser = null;
    }
  }
}

// --- Fetch Helper ---

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const token = authToken || getStoredToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    return data as APIResponse<T>;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error' };
  }
}

// --- Auth API ---

export async function login(username: string): Promise<{ user: User; token: string } | null> {
  const response = await apiFetch<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });

  if (response.success && response.data) {
    setStoredToken(response.data.token);
    setCurrentUser(response.data.user);
    return response.data;
  }
  return null;
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
  setStoredToken(null);
  setCurrentUser(null);
}

export async function getMe(): Promise<User | null> {
  const response = await apiFetch<User>('/auth/me');
  if (response.success && response.data) {
    setCurrentUser(response.data);
    return response.data;
  }
  return null;
}

// --- Communities API ---

export async function getCommunities(): Promise<Community[]> {
  const response = await apiFetch<Community[]>('/communities');
  return response.success && response.data ? response.data : [];
}

export async function getCommunity(name: string): Promise<Community | null> {
  const response = await apiFetch<Community>(`/communities/${name}`);
  return response.success && response.data ? response.data : null;
}

// --- Posts API ---

export async function getPosts(communityName?: string, limit = 20): Promise<Post[]> {
  let url = `/posts?limit=${limit}`;
  if (communityName) {
    url += `&community=${communityName}`;
  }
  const response = await apiFetch<Post[]>(url);
  return response.success && response.data ? response.data : [];
}

export async function getPost(id: number): Promise<Post | null> {
  const response = await apiFetch<Post>(`/posts/${id}`);
  return response.success && response.data ? response.data : null;
}

export async function createPost(data: {
  title: string;
  content: string;
  communityId: number;
  isOC?: boolean;
}): Promise<Post | null> {
  const response = await apiFetch<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.success && response.data ? response.data : null;
}

export async function votePost(
  postId: number,
  voteType: 'up' | 'down' | 'none'
): Promise<{ upvotes: number; downvotes: number; userVote: string } | null> {
  const response = await apiFetch<{ upvotes: number; downvotes: number; userVote: string }>(
    `/posts/${postId}/vote`,
    {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    }
  );
  return response.success && response.data ? response.data : null;
}

// --- Comments API ---

export async function getComments(postId: number): Promise<Comment[]> {
  const response = await apiFetch<Comment[]>(`/posts/${postId}/comments`);
  return response.success && response.data ? response.data : [];
}

export async function createComment(
  postId: number,
  content: string,
  parentId?: number
): Promise<Comment | null> {
  const response = await apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId }),
  });
  return response.success && response.data ? response.data : null;
}

export async function voteComment(
  commentId: number,
  voteType: 'up' | 'down' | 'none'
): Promise<{ upvotes: number; downvotes: number; userVote: string } | null> {
  const response = await apiFetch<{ upvotes: number; downvotes: number; userVote: string }>(
    `/comments/${commentId}/vote`,
    {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    }
  );
  return response.success && response.data ? response.data : null;
}

// --- Update/Delete Posts ---

export async function updatePost(
  postId: number,
  data: { title: string; content: string }
): Promise<{ id: number; title: string; content: string } | null> {
  const response = await apiFetch<{ id: number; title: string; content: string }>(
    `/posts/${postId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.success && response.data ? response.data : null;
}

export async function deletePost(postId: number): Promise<boolean> {
  const response = await apiFetch<{ deleted: boolean }>(`/posts/${postId}`, {
    method: 'DELETE',
  });
  return response.success && response.data?.deleted === true;
}

// --- Update/Delete Comments ---

export async function updateComment(
  commentId: number,
  content: string
): Promise<{ id: number; content: string } | null> {
  const response = await apiFetch<{ id: number; content: string }>(
    `/comments/${commentId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }
  );
  return response.success && response.data ? response.data : null;
}

export async function deleteComment(commentId: number): Promise<boolean> {
  const response = await apiFetch<{ deleted: boolean }>(`/comments/${commentId}`, {
    method: 'DELETE',
  });
  return response.success && response.data?.deleted === true;
}

// --- Utility ---

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}
