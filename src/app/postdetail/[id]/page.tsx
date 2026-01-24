'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    getPostById,
    getCommentsByPostId,
    createComment,
    updateComment,
    deleteComment as deleteCommentFromDB,
    deletePost as deletePostFromDB,
    upvotePost,
    formatTimeAgo,
    isPostBookmarked,
    addBookmark,
    removeBookmark,
    Post,
    Comment,
    PostWithRelations,
    CommentWithUser
} from '@/lib/api';
import Header from '@/components/Header';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';

export default function PostDetailPage() {
    const [username, setUsername] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [commentText, setCommentText] = useState('');
    const [upvoted, setUpvoted] = useState(false);
    const [post, setPost] = useState<PostWithRelations | null>(null);
    const [comments, setComments] = useState<CommentWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
    const [showDeletePostModal, setShowDeletePostModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    // Fetch post and comments from Supabase
    const fetchPostData = useCallback(async (currentUserId?: string) => {
        try {
            setIsLoading(true);
            const [postData, commentsData] = await Promise.all([
                getPostById(postId),
                getCommentsByPostId(postId)
            ]);
            setPost(postData);
            setComments(commentsData);

            if (currentUserId || userId) {
                const bookmarked = await isPostBookmarked(currentUserId || userId, postId);
                setIsBookmarked(bookmarked);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setIsLoading(false);
        }
    }, [postId, userId]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        const storedUserId = localStorage.getItem('topicnest_user_id');
        if (!storedUsername || !storedUserId) {
            router.push('/');
        } else {
            setUsername(storedUsername);
            setUserId(storedUserId);
            fetchPostData(storedUserId);
        }
    }, [router, fetchPostData]);

    const handleToggleBookmark = async () => {
        if (!userId || !postId || isBookmarkLoading) return;

        setIsBookmarkLoading(true);
        try {
            if (isBookmarked) {
                await removeBookmark(userId, postId);
                setIsBookmarked(false);
            } else {
                await addBookmark(userId, postId);
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error('Bookmark error:', error);
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (commentText.trim() && userId) {
            try {
                const newComment = await createComment(postId, userId, commentText.trim());
                if (newComment) {
                    // Refresh comments to get the new one with user info
                    const updatedComments = await getCommentsByPostId(postId);
                    setComments(updatedComments);
                    setCommentText('');
                }
            } catch (error) {
                console.error('Error posting comment:', error);
            }
        }
    };

    const handleStartEdit = (comment: CommentWithUser) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleSaveEdit = async (commentId: string) => {
        if (editingContent.trim()) {
            try {
                const updated = await updateComment(commentId, editingContent.trim());
                if (updated) {
                    setComments(comments.map(c =>
                        c.id === commentId ? { ...c, content: editingContent.trim() } : c
                    ));
                }
                setEditingCommentId(null);
                setEditingContent('');
            } catch (error) {
                console.error('Error updating comment:', error);
            }
        }
    };

    const handleDeleteCommentClick = (commentId: string) => {
        setCommentToDelete(commentId);
    };

    const handleConfirmDeleteComment = async () => {
        if (!commentToDelete) return;

        setIsDeleting(true);
        const originalComments = [...comments];
        setComments(comments.filter(c => c.id !== commentToDelete));

        try {
            await deleteCommentFromDB(commentToDelete);
        } catch (error: any) {
            console.error('Error deleting comment:', error);
            setComments(originalComments);
            alert('Failed to delete comment: ' + (error.message || 'Unknown error'));
        } finally {
            setIsDeleting(false);
            setCommentToDelete(null);
        }
    };

    const handleUpvote = async () => {
        if (!post) return;
        try {
            const updatedPost = await upvotePost(postId);
            if (updatedPost) {
                setPost({ ...post, upvotes: updatedPost.upvotes });
                setUpvoted(true);
            }
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };

    const handleDeletePostClick = () => {
        setShowDeletePostModal(true);
    };

    const handleConfirmDeletePost = async () => {
        setIsDeleting(true);
        try {
            await deletePostFromDB(postId);
            router.back();
        } catch (error: any) {
            console.error('Error deleting post:', error);
            setIsDeleting(false);
            setShowDeletePostModal(false);
            if (error.message?.includes('RLS') || error.message?.includes('Row Level Security')) {
                alert('Delete failed: Database permissions issue.\n\nPlease run this SQL in your Supabase Dashboard:\n\nALTER TABLE posts DISABLE ROW LEVEL SECURITY;');
            } else {
                alert('Failed to delete post: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        localStorage.removeItem('topicnest_user_id');
        router.push('/');
    };

    if (!username || isLoading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 50%, #faf5ff 100%)'
                }}
            >
                <div
                    style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(139, 92, 246, 0.2)',
                        borderTop: '3px solid #8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}
                />
            </div>
        );
    }

    if (!post) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 50%, #faf5ff 100%)',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                <h2 style={{ color: '#1e293b', fontSize: '24px' }}>Post not found</h2>
                <button
                    onClick={() => router.back()}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 50%, #faf5ff 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Background Orbs - Soft Pastels */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'float 8s ease-in-out infinite'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'float 10s ease-in-out infinite reverse'
                }}
            />

            <Header username={username} />

            {/* Main Content */}
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 10 }}>
                {/* Post Card */}
                <article
                    style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                        marginBottom: '24px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
                        animation: 'fadeInUp 0.5s ease both'
                    }}
                >
                    {/* Post Title with Edit/Delete/Bookmark buttons */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h1
                            style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1e293b',
                                lineHeight: '1.3',
                                flex: 1
                            }}
                        >
                            {post.title}
                        </h1>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                            {/* Bookmark button */}
                            <button
                                onClick={handleToggleBookmark}
                                title={isBookmarked ? "Remove bookmark" : "Bookmark post"}
                                disabled={isBookmarkLoading}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: isBookmarked ? 'rgba(236, 72, 153, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                    border: isBookmarked ? '1px solid rgba(236, 72, 153, 0.15)' : '1px solid rgba(139, 92, 246, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    color: isBookmarked ? '#ec4899' : '#8b5cf6'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>

                            {/* Edit and Delete buttons - only show for own posts */}
                            {post.user_id === userId && (
                                <>
                                    <button
                                        onClick={() => router.push(`/create?categoryId=${post.category_id}&edit=${postId}`)}
                                        title="Edit post"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            color: '#8b5cf6'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleDeletePostClick}
                                        title="Delete post"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            color: '#ef4444'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Author Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <Link href={`/profile/${post.users?.username}`} style={{ textDecoration: 'none' }}>
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '18px',
                                    overflow: 'hidden'
                                }}
                            >
                                {post.users?.avatar_url ? (
                                    <img src={post.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    post.users?.username?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                        </Link>
                        <div>
                            <Link
                                href={`/profile/${post.users?.username}`}
                                style={{
                                    color: '#1e293b',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#1e293b'}
                            >
                                {post.users?.username || 'Unknown'}
                            </Link>
                            <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {formatTimeAgo(post.created_at)}
                            </div>
                        </div>
                    </div>

                    {/* Post Image */}
                    {post.image_url && (
                        <div style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden' }}>
                            <img
                                src={post.image_url}
                                alt={post.title}
                                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: '#f8fafc' }}
                            />
                        </div>
                    )}

                    {/* Post Content */}
                    <div
                        style={{
                            color: '#475569',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            marginBottom: '28px',
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {post.content}
                    </div>

                    {/* Post Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '20px', borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
                        <button
                            onClick={handleUpvote}
                            disabled={upvoted}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                background: upvoted ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                                border: upvoted ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(139, 92, 246, 0.15)',
                                color: upvoted ? '#8b5cf6' : '#64748b',
                                cursor: upvoted ? 'default' : 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '15px',
                                fontWeight: '500'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={upvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {post.upvotes}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '15px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {comments.length} comments
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
                        animation: 'fadeInUp 0.5s ease 0.1s both'
                    }}
                >
                    <h2 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
                        Comments
                    </h2>

                    {/* Comment Input */}
                    <div style={{ marginBottom: '32px' }}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'rgba(139, 92, 246, 0.05)',
                                border: '1px solid rgba(139, 92, 246, 0.15)',
                                color: '#1e293b',
                                fontSize: '15px',
                                resize: 'none',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button
                                disabled={!commentText.trim()}
                                onClick={handlePostComment}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: commentText.trim() ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 'rgba(139, 92, 246, 0.1)',
                                    border: 'none',
                                    color: commentText.trim() ? 'white' : '#94a3b8',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.3s ease',
                                    boxShadow: commentText.trim() ? '0 8px 30px rgba(139, 92, 246, 0.3)' : 'none'
                                }}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {comments.map((comment, index) => (
                            <div
                                key={comment.id}
                                style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    background: 'rgba(139, 92, 246, 0.04)',
                                    border: '1px solid rgba(139, 92, 246, 0.08)',
                                    animation: `fadeInUp 0.4s ease ${0.2 + index * 0.1}s both`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Link href={`/profile/${comment.users?.username}`} style={{ textDecoration: 'none' }}>
                                            <div
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {comment.users?.avatar_url ? (
                                                    <img src={comment.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    comment.users?.username?.charAt(0).toUpperCase() || '?'
                                                )}
                                            </div>
                                        </Link>
                                        <div>
                                            <Link
                                                href={`/profile/${comment.users?.username}`}
                                                style={{
                                                    color: '#1e293b',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    textDecoration: 'none'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#1e293b'}
                                            >
                                                {comment.users?.username || 'Unknown'}
                                            </Link>
                                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                                                {formatTimeAgo(comment.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Edit and Delete buttons - only show for own comments */}
                                    {comment.user_id === userId && editingCommentId !== comment.id && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStartEdit(comment); }}
                                                title="Edit comment"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    color: '#8b5cf6'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCommentClick(comment.id); }}
                                                title="Delete comment"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    color: '#ef4444'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Edit mode or display mode */}
                                {editingCommentId === comment.id ? (
                                    <div style={{ marginBottom: '12px' }}>
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: 'rgba(139, 92, 246, 0.05)',
                                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                                color: '#1e293b',
                                                fontSize: '15px',
                                                resize: 'none',
                                                outline: 'none',
                                                lineHeight: '1.6'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                                    color: '#64748b',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveEdit(comment.id)}
                                                disabled={!editingContent.trim()}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    background: editingContent.trim() ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 'rgba(139, 92, 246, 0.1)',
                                                    border: 'none',
                                                    color: editingContent.trim() ? 'white' : '#94a3b8',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: editingContent.trim() ? 'pointer' : 'not-allowed',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: editingContent.trim() ? '0 4px 15px rgba(139, 92, 246, 0.25)' : 'none'
                                                }}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '12px' }}>
                                        {comment.content}
                                    </p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                    {comment.upvotes}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Animation Keyframes */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-30px) translateX(20px);
                    }
                }
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                textarea::placeholder {
                    color: #94a3b8;
                }
            `}</style>

            {/* Confirm Delete Post Modal */}
            <ConfirmModal
                isOpen={showDeletePostModal}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDeletePost}
                onCancel={() => setShowDeletePostModal(false)}
                isLoading={isDeleting}
                type="danger"
            />

            {/* Confirm Delete Comment Modal */}
            <ConfirmModal
                isOpen={commentToDelete !== null}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDeleteComment}
                onCancel={() => setCommentToDelete(null)}
                isLoading={isDeleting}
                type="danger"
            />
        </div>
    );
}
