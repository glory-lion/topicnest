export interface User {
  id: string;
  username: string;
  avatar?: string;
  karma: number;
  createdAt: Date;
}

export interface Community {
  id: string;
  name: string;
  displayName: string;
  description: string;
  avatar?: string;
  banner?: string;
  members: number;
  createdAt: Date;
  isNsfw?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  author: User;
  community: Community;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  isNsfw?: boolean;
  isSpoiler?: boolean;
  isOC?: boolean;
  userVote?: 'up' | 'down' | null;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  replies?: Comment[];
  userVote?: 'up' | 'down' | null;
}

export type SortOption = 'best' | 'hot' | 'new' | 'top' | 'rising';
export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
