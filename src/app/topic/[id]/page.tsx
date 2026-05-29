'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategory, deletePost as deletePostFromDB, formatTimeAgo, Category, Post, PostWithRelations } from '@/lib/api';
import Header from '@/components/Header';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';

// Default styling if category doesn't have custom styling
const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const defaultGlowColor = 'rgba(102, 126, 234, 0.5)';

interface DisplayPost {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    time: string;
    upvotes: number;
    comments: number;
}

export default function TopicPage() {
    const [username, setUsername] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [hoveredPost, setHoveredPost] = useState<string | null>(null);
    const [posts, setPosts] = useState<DisplayPost[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const params = useParams();
    const topicId = params.id as string;

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Get category info
    const topic = category ? {
        name: category.name,
        gradient: category.gradient || defaultGradient,
        glowColor: category.glow_color || defaultGlowColor
    } : {
        name: 'Loading...',
        gradient: defaultGradient,
        glowColor: defaultGlowColor
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        const storedUserId = localStorage.getItem('topicnest_user_id');
        if (!storedUsername) {
            router.push('/');
        } else {
            setUsername(storedUsername);
            setUserId(storedUserId || '');
            loadCategoryAndPosts();
        }
    }, [router, topicId]);

    const loadCategoryAndPosts = async () => {
        try {
            // Load category
            const cat = await getCategoryBySlug(topicId);
            if (cat) {
                setCategory(cat);

                // Load posts for this category
                const postsData = await getPostsByCategory(topicId);
                const displayPosts: DisplayPost[] = postsData.map((post: PostWithRelations) => ({
                    id: post.id,
                    title: post.title,
                    excerpt: post.content.substring(0, 150) + (post.content.length > 150 ? '...' : ''),
                    author: post.users?.username || 'Anonymous',
                    time: formatTimeAgo(post.created_at),
                    upvotes: post.upvotes || 0,
                    comments: (post as any).comments?.length || post.comment_count || 0
                }));
                setPosts(displayPosts);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        localStorage.removeItem('topicnest_user_id');
        router.push('/');
    };

    const handleDeleteClick = (postId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPostToDelete(postId);
    };

    const handleConfirmDelete = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        const originalPosts = [...posts];
        setPosts(posts.filter(p => p.id !== postToDelete));

        try {
            await deletePostFromDB(postToDelete);
            setPostToDelete(null);
        } catch (error: any) {
            console.error('Error deleting post:', error);
            setPosts(originalPosts);

            if (error.message?.includes('RLS') || error.message?.includes('Row Level Security')) {
                alert('Delete failed: Database permissions issue.\n\nPlease run this SQL in your Supabase Dashboard:\n\nALTER TABLE posts DISABLE ROW LEVEL SECURITY;');
            } else {
                alert('Failed to delete post: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setIsDeleting(false);
            setPostToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setPostToDelete(null);
    };

    if (!username) {
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
            <main style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: isMobile ? '24px 16px' : '48px 32px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Topic Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    marginBottom: isMobile ? '24px' : '40px',
                    gap: isMobile ? '16px' : '0'
                }}>
                    <div>
                        <h1
                            style={{
                                fontSize: isMobile ? '28px' : '36px',
                                fontWeight: '800',
                                color: '#1e293b',
                                marginBottom: '8px',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            {topic.name}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: isMobile ? '14px' : '16px' }}>
                            {posts.length} discussions
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/create?topic=${topicId}`)}
                        style={{
                            padding: isMobile ? '12px 20px' : '14px 28px',
                            background: topic.gradient,
                            border: 'none',
                            borderRadius: '14px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: `0 8px 30px ${topic.glowColor}`,
                            transition: 'all 0.3s ease',
                            width: isMobile ? '100%' : 'auto'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 12px 40px ${topic.glowColor}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 8px 30px ${topic.glowColor}`;
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Post
                    </button>
                </div>

                {/* Posts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            onClick={() => router.push(`/postdetail/${post.id}`)}
                            onMouseEnter={() => setHoveredPost(post.id)}
                            onMouseLeave={() => setHoveredPost(null)}
                            style={{
                                background: hoveredPost === post.id
                                    ? 'rgba(255, 255, 255, 0.98)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                padding: '28px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: hoveredPost === post.id ? 'translateX(8px)' : 'translateX(0)',
                                border: '1px solid rgba(139, 92, 246, 0.1)',
                                borderLeft: hoveredPost === post.id
                                    ? `4px solid`
                                    : '4px solid transparent',
                                borderLeftColor: hoveredPost === post.id ? '#8b5cf6' : 'transparent',
                                boxShadow: hoveredPost === post.id
                                    ? '0 20px 40px rgba(139, 92, 246, 0.12)'
                                    : '0 4px 16px rgba(0, 0, 0, 0.04)',
                                animation: `fadeInUp 0.5s ease ${index * 0.1}s both`
                            }}
                        >
                            {/* Post header with title and action buttons */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3
                                    style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        flex: 1
                                    }}
                                >
                                    {post.title}
                                </h3>
                                {/* Edit and Delete buttons - only show for own posts */}
                                {post.author === username && (
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/create?topic=${topicId}&edit=${post.id}`); }}
                                            title="Edit post"
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
                                            onClick={(e) => handleDeleteClick(post.id, e)}
                                            title="Delete post"
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
                            <p
                                style={{
                                    color: '#64748b',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    marginBottom: '20px'
                                }}
                            >
                                {post.excerpt}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                                        by <Link
                                            href={`/profile/${post.author}`}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ color: '#8b5cf6', fontWeight: '500', textDecoration: 'none' }}
                                        >
                                            {post.author}
                                        </Link>
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {post.time}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                        </svg>
                                        {post.upvotes}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        {post.comments}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={postToDelete !== null}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isLoading={isDeleting}
                type="danger"
            />

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
            `}</style>
        </div>
    );
}
