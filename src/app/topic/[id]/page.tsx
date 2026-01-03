'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Topic metadata
const topicMeta: Record<string, { name: string; gradient: string; glowColor: string }> = {
    'technology': {
        name: 'Technology',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        glowColor: 'rgba(102, 126, 234, 0.5)'
    },
    'gaming': {
        name: 'Gaming',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        glowColor: 'rgba(17, 153, 142, 0.5)'
    },
    'art-design': {
        name: 'Art & Design',
        gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
        glowColor: 'rgba(238, 9, 121, 0.5)'
    },
    'books': {
        name: 'Books & Literature',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        glowColor: 'rgba(240, 147, 251, 0.5)'
    },
    'music': {
        name: 'Music',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        glowColor: 'rgba(79, 172, 254, 0.5)'
    },
    'health': {
        name: 'Health & Fitness',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        glowColor: 'rgba(250, 112, 154, 0.5)'
    }
};

// Mock posts data
const mockPosts: Record<string, Array<{ id: string; title: string; excerpt: string; author: string; time: string; upvotes: number; comments: number }>> = {
    'technology': [
        { id: '1', title: 'The Future of AI in 2025', excerpt: 'Exploring the latest breakthroughs in artificial intelligence...', author: 'techguru', time: '2 hours ago', upvotes: 156, comments: 42 },
        { id: '2', title: 'Best Programming Languages to Learn', excerpt: 'A comprehensive guide for beginners and experts alike...', author: 'codemaster', time: '5 hours ago', upvotes: 89, comments: 31 },
        { id: '3', title: 'Web Development Trends', excerpt: 'What\'s hot in frontend and backend development...', author: 'webdev101', time: '1 day ago', upvotes: 67, comments: 18 },
    ],
    'gaming': [
        { id: '1', title: 'Top 10 Indie Games of 2025', excerpt: 'These indie games are absolute gems...', author: 'gamerlord', time: '3 hours ago', upvotes: 42, comments: 23 },
        { id: '2', title: 'Review: The Latest AAA Release', excerpt: 'Just finished the main story, here\'s my take...', author: 'reviewking', time: '6 hours ago', upvotes: 28, comments: 17 },
    ],
    'art-design': [
        { id: '1', title: 'Digital Art Tips for Beginners', excerpt: 'Getting started with digital illustration...', author: 'artmaster', time: '4 hours ago', upvotes: 73, comments: 29 },
        { id: '2', title: 'Color Theory Explained', excerpt: 'Understanding how colors work together...', author: 'designpro', time: '8 hours ago', upvotes: 51, comments: 14 },
    ],
    'books': [
        { id: '1', title: 'Must-Read Sci-Fi Novels', excerpt: 'Expand your imagination with these classics...', author: 'bookworm', time: '1 hour ago', upvotes: 34, comments: 21 },
        { id: '2', title: 'Reading Challenge 2025', excerpt: 'Join us in reading 52 books this year...', author: 'reader123', time: '12 hours ago', upvotes: 45, comments: 38 },
    ],
    'music': [
        { id: '1', title: 'Best Albums of the Year', excerpt: 'A curated list of must-listen albums...', author: 'musicfan', time: '2 hours ago', upvotes: 67, comments: 25 },
        { id: '2', title: 'Learning Guitar: Week 1', excerpt: 'My journey starting to learn guitar...', author: 'newbie_guitarist', time: '1 day ago', upvotes: 23, comments: 12 },
    ],
    'health': [
        { id: '1', title: 'Morning Workout Routines', excerpt: 'Start your day with energy and focus...', author: 'fitlife', time: '5 hours ago', upvotes: 89, comments: 34 },
        { id: '2', title: 'Healthy Meal Prep Ideas', excerpt: 'Easy recipes for the busy professional...', author: 'healthychef', time: '1 day ago', upvotes: 56, comments: 22 },
    ]
};

export default function TopicPage() {
    const [username, setUsername] = useState<string>('');
    const [hoveredPost, setHoveredPost] = useState<string | null>(null);
    const [posts, setPosts] = useState<Array<{ id: string; title: string; excerpt: string; author: string; time: string; upvotes: number; comments: number }>>([]);
    const router = useRouter();
    const params = useParams();
    const topicId = params.id as string;

    const topic = topicMeta[topicId] || { name: 'Unknown Topic', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glowColor: 'rgba(102, 126, 234, 0.5)' };
    const defaultPosts = mockPosts[topicId] || [];

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        if (!storedUsername) {
            router.push('/');
        } else {
            setUsername(storedUsername);
        }

        // Load user-created posts from localStorage
        const userPosts = JSON.parse(localStorage.getItem('topicnest_posts') || '{}');
        const topicUserPosts = userPosts[topicId] || [];

        // Merge user posts with default posts (user posts first)
        setPosts([...topicUserPosts, ...defaultPosts]);
    }, [router, topicId, defaultPosts]);

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        router.push('/');
    };

    if (!username) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
                }}
            >
                <div
                    style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid #a855f7',
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
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Background Orbs */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
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
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'float 10s ease-in-out infinite reverse'
                }}
            />

            {/* Glassmorphism Header */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'rgba(15, 12, 41, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '16px 48px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    {/* Back Button & Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button
                            onClick={() => router.push('/forum')}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)'
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <span
                                style={{
                                    fontSize: '24px',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                Topic<em style={{ fontStyle: 'italic' }}>Nest</em>
                            </span>
                        </div>
                    </div>

                    {/* User Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '18px' }}>
                            Welcome, <span style={{ color: '#a855f7', fontWeight: '600' }}>{username}</span>
                        </span>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '18px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                            onClick={handleLogout}
                            title="Click to logout"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 85, 247, 0.4)';
                            }}
                        >
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 10 }}>
                {/* Topic Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div>
                        <h1
                            style={{
                                fontSize: '36px',
                                fontWeight: '800',
                                color: '#ffffff',
                                marginBottom: '8px',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            {topic.name}
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                            {posts.length} discussions
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/create?topic=${topicId}`)}
                        style={{
                            padding: '14px 28px',
                            background: topic.gradient,
                            border: 'none',
                            borderRadius: '14px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: `0 8px 30px ${topic.glowColor}`,
                            transition: 'all 0.3s ease'
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
                            onClick={() => router.push(`/postdetail/${topicId}-${post.id}`)}
                            onMouseEnter={() => setHoveredPost(post.id)}
                            onMouseLeave={() => setHoveredPost(null)}
                            style={{
                                background: hoveredPost === post.id
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                padding: '28px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: hoveredPost === post.id ? 'translateX(8px)' : 'translateX(0)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderLeft: hoveredPost === post.id
                                    ? `4px solid`
                                    : '4px solid transparent',
                                borderLeftColor: hoveredPost === post.id ? topic.glowColor.replace('0.5', '1') : 'transparent',
                                animation: `fadeInUp 0.5s ease ${index * 0.1}s both`
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    marginBottom: '10px'
                                }}
                            >
                                {post.title}
                            </h3>
                            <p
                                style={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    marginBottom: '20px'
                                }}
                            >
                                {post.excerpt}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
                                        by <span style={{ color: '#a855f7', fontWeight: '500' }}>{post.author}</span>
                                    </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {post.time}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                        </svg>
                                        {post.upvotes}
                                    </span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
