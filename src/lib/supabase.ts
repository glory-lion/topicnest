import { createClient } from '@supabase/supabase-js';
import type { Database } from './database-types';

const supabaseUrl = 'https://dnkzpufpttsunuqybzcx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua3pwdWZwdHRzdW51cXliemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY5MTYsImV4cCI6MjA4NDE4MjkxNn0.KRvJHE4pW71PIxvl73RfbAqwYAZjGH8RNCKJ9ar9m7A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ USER FUNCTIONS ============

export async function getOrCreateUser(username: string): Promise<any> {
    // Check if user exists
    const { data: existingUser } = await (supabase.from('users') as any)
        .select('*')
        .eq('username', username)
        .single();

    if (existingUser) {
        return existingUser;
    }

    // Create new user
    const { data: newUser, error } = await (supabase.from('users') as any)
        .insert({ username })
        .select()
        .single();

    if (error) {
        console.error('Error creating user:', error);
        throw error;
    }

    return newUser;
}

export async function getUserById(userId: string): Promise<any> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting user:', error);
        return null;
    }

    return data;
}

// ============ CATEGORY FUNCTIONS ============

export async function getCategories(): Promise<any[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error getting categories:', error);
        return [];
    }

    return data;
}

export async function getCategoryById(categoryId: string): Promise<any> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

    if (error) {
        console.error('Error getting category:', error);
        return null;
    }

    return data;
}

export async function getCategoryBySlug(slug: string): Promise<any> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error getting category by slug:', error);
        return null;
    }

    return data;
}

// ============ POST FUNCTIONS ============

export async function getPosts(categoryId?: string): Promise<any[]> {
    let query = (supabase.from('posts') as any)
        .select(`
            *,
            users (id, username),
            categories (id, name, slug)
        `)
        .order('created_at', { ascending: false });

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error getting posts:', error);
        return [];
    }

    return data;
}

export async function getPostsByCategory(categorySlug: string) {
    // First get the category
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users (id, username),
            comments (id)
        `)
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting posts by category:', error);
        return [];
    }

    return data;
}

export async function getPostById(postId: string): Promise<any> {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users (id, username),
            categories (id, name, slug)
        `)
        .eq('id', postId)
        .single();

    if (error) {
        console.error('Error getting post:', error);
        return null;
    }

    return data;
}

export async function createPost(
    title: string,
    content: string,
    categoryId: string,
    userId: string
): Promise<any> {
    const { data, error } = await (supabase.from('posts') as any)
        .insert({
            title,
            content,
            category_id: categoryId,
            user_id: userId,
            upvotes: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        throw error;
    }

    return data;
}

export async function updatePost(postId: string, title: string, content: string, imageUrl?: string) {
    const updateData: any = { title, content, updated_at: new Date().toISOString() };
    if (imageUrl !== undefined) {
        updateData.image_url = imageUrl;
    }

    const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error('Error updating post:', error);
        throw error;
    }

    return data;
}

export async function deletePost(postId: string) {
    console.log('Attempting to delete post:', postId);

    const { error, count } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .select();

    console.log('Delete result:', { error, count });

    if (error) {
        console.error('Error deleting post:', error);
        throw error;
    }

    // Verify the post was actually deleted
    const { data: checkPost } = await supabase
        .from('posts')
        .select('id')
        .eq('id', postId)
        .single();

    if (checkPost) {
        console.error('Post still exists after delete - RLS may be blocking');
        throw new Error('Delete failed - Row Level Security may be blocking this operation. Please run the RLS fix SQL in Supabase.');
    }

    console.log('Post deleted successfully');
    return true;
}

export async function upvotePost(postId: string): Promise<any> {
    // First get current upvotes
    const { data: post } = await supabase
        .from('posts')
        .select('upvotes')
        .eq('id', postId)
        .single();

    if (!post) return null;

    const { data, error } = await supabase
        .from('posts')
        .update({ upvotes: (post.upvotes || 0) + 1 })
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error('Error upvoting post:', error);
        throw error;
    }

    return data;
}

// ============ COMMENT FUNCTIONS ============

export async function getCommentsByPostId(postId: string) {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            users (id, username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error getting comments:', error);
        return [];
    }

    return data;
}

export async function createComment(postId: string, userId: string, content: string): Promise<any> {
    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: userId,
            content,
            upvotes: 0
        })
        .select(`
            *,
            users (id, username)
        `)
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        throw error;
    }

    return data;
}

export async function updateComment(commentId: string, content: string) {
    const { data, error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating comment:', error);
        throw error;
    }

    return data;
}

export async function deleteComment(commentId: string) {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }

    return true;
}

export async function upvoteComment(commentId: string) {
    // First get current upvotes
    const { data: comment } = await supabase
        .from('comments')
        .select('upvotes')
        .eq('id', commentId)
        .single();

    if (!comment) return null;

    const { data, error } = await supabase
        .from('comments')
        .update({ upvotes: (comment.upvotes || 0) + 1 })
        .eq('id', commentId)
        .select()
        .single();

    if (error) {
        console.error('Error upvoting comment:', error);
        throw error;
    }

    return data;
}

// ============ HELPER FUNCTIONS ============

export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// ============ SEARCH FUNCTIONS ============

export async function searchPosts(query: string) {
    if (!query.trim()) return [];

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users (id, username),
            categories (id, name, slug),
            comments (id)
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error searching posts:', error);
        return [];
    }

    return data;
}

// ============ BOOKMARK FUNCTIONS ============

export async function getBookmarksByUser(userId: string) {
    const { data, error } = await supabase
        .from('bookmarks')
        .select(`
            *,
            posts (
                *,
                users (id, username),
                categories (id, name, slug)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting bookmarks:', error);
        return [];
    }

    return data;
}

export async function addBookmark(userId: string, postId: string) {
    const { data, error } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, post_id: postId })
        .select()
        .single();

    if (error) {
        console.error('Error adding bookmark:', error);
        return null;
    }

    return data;
}

export async function removeBookmark(userId: string, postId: string) {
    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

    if (error) {
        console.error('Error removing bookmark:', error);
        return false;
    }

    return true;
}

export async function isPostBookmarked(userId: string, postId: string) {
    const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

    if (error) {
        return false;
    }

    return !!data;
}

// ============ USER PROFILE FUNCTIONS ============

export async function getUserByUsername(username: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error) {
        console.error('Error getting user by username:', error);
        return null;
    }

    return data;
}

export async function getUserWithStats(username: string): Promise<any> {
    // Get user basic info
    const user = await getUserByUsername(username);
    if (!user) return null;

    // Get post count
    const { count: postCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Get comment count
    const { count: commentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return {
        ...user,
        post_count: postCount || 0,
        comment_count: commentCount || 0
    };
}

export async function getPostsByUser(userId: string) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            users (id, username),
            categories (id, name, slug),
            comments (id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting posts by user:', error);
        return [];
    }

    return data;
}

export async function updateUserProfile(userId: string, bio: string, avatarUrl?: string): Promise<any> {
    const updateData: { bio: string; avatar_url?: string } = { bio };
    if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
    }

    console.log('Updating user profile:', { userId, updateData });

    const { data, error } = await (supabase.from('users') as any)
        .update(updateData)
        .eq('id', userId)
        .select();

    console.log('Update result:', { data, error });

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }

    // Check if update actually affected any rows
    if (!data || data.length === 0) {
        console.error('Profile update returned empty result - RLS may be blocking the update. UserId:', userId);
        throw new Error('Profile update failed - no rows were updated. Please check Supabase RLS policies.');
    }

    return data[0];
}

// ============ IMAGE UPLOAD FUNCTIONS ============

export async function uploadPostImage(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

    if (error) {
        console.error('Error uploading image:', error);
        throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

export async function uploadAvatarImage(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    // Use timestamp to create unique filename and avoid upsert issues
    const fileName = `avatars/${userId}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

    if (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

// ============ CREATE POST WITH IMAGE ============

export async function createPostWithImage(
    title: string,
    content: string,
    categoryId: string,
    userId: string,
    imageUrl?: string
): Promise<any> {
    const { data, error } = await (supabase.from('posts') as any)
        .insert({
            title,
            content,
            category_id: categoryId,
            user_id: userId,
            image_url: imageUrl || null,
            upvotes: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        throw error;
    }

    return data;
}

