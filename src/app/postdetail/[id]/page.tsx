'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Mock posts data with full content
const mockPostsData: Record<string, {
    id: string;
    title: string;
    content: string;
    author: string;
    time: string;
    upvotes: number;
    comments: Array<{ id: string; author: string; content: string; time: string; upvotes: number }>
}> = {
    'tech-1': {
        id: 'tech-1',
        title: 'The Future of AI in 2025',
        content: 'Artificial Intelligence has made incredible strides this year. From advanced language models that can understand context better than ever, to AI-powered tools that are revolutionizing creative industries. The most exciting development has been the emergence of multimodal AI systems that can seamlessly work with text, images, audio, and video.\n\nWhat excites me most is how accessible these technologies are becoming. Small businesses and individual developers can now leverage AI capabilities that were only available to tech giants a few years ago.',
        author: 'techguru',
        time: '2 hours ago',
        upvotes: 156,
        comments: [
            { id: 'c1', author: 'airesearcher', content: 'Great points! I think the real game-changer will be when these models become more efficient and can run locally on consumer devices.', time: '1 hour ago', upvotes: 23 },
            { id: 'c2', author: 'devmaster', content: 'The accessibility aspect is huge. We\'ve integrated AI into our startup and it\'s been transformative.', time: '45 min ago', upvotes: 12 }
        ]
    },
    'tech-2': {
        id: 'tech-2',
        title: 'Best Programming Languages to Learn',
        content: 'If you\'re looking to start your programming journey or expand your skill set, here are my top recommendations for 2025:\n\n1. Python - Still the king for data science, AI, and general-purpose programming\n2. TypeScript - JavaScript with superpowers, essential for modern web development\n3. Rust - For systems programming and when performance matters\n4. Go - Perfect balance of simplicity and power for backend services\n\nRemember, the best language is the one that helps you solve problems effectively.',
        author: 'codemaster',
        time: '5 hours ago',
        upvotes: 89,
        comments: [
            { id: 'c1', author: 'rustfan', content: 'Rust is amazing! The learning curve is steep but worth it.', time: '4 hours ago', upvotes: 15 }
        ]
    },
    'gaming-1': {
        id: 'gaming-1',
        title: 'Top 10 Indie Games of 2025',
        content: 'These indie games are absolute gems that flew under the radar this year. From innovative puzzle platformers to emotional narrative experiences, indie developers continue to push boundaries. My top pick is "Echoes of Tomorrow" - a time-bending adventure with stunning pixel art.',
        author: 'gamerlord',
        time: '3 hours ago',
        upvotes: 42,
        comments: [
            { id: 'c1', author: 'pixelart_fan', content: 'Echoes of Tomorrow is incredible! The soundtrack alone is worth the price.', time: '2 hours ago', upvotes: 8 },
            { id: 'c2', author: 'indiegamer', content: 'Don\'t sleep on "Nebula Dreams" either - amazing roguelike mechanics!', time: '1 hour ago', upvotes: 5 }
        ]
    },
    'gaming-2': {
        id: 'gaming-2',
        title: 'Review: The Latest AAA Release',
        content: 'Just finished the main story, here\'s my take on this highly anticipated title. The graphics are stunning, the gameplay is polished, but the story falls a bit flat compared to previous entries in the series. Overall, a solid 8/10 experience that fans will enjoy.',
        author: 'reviewking',
        time: '6 hours ago',
        upvotes: 28,
        comments: [
            { id: 'c1', author: 'gamer123', content: 'Agreed on the story. The side quests are actually more interesting than the main plot.', time: '5 hours ago', upvotes: 11 }
        ]
    }
};

export default function PostDetailPage() {
    const [username, setUsername] = useState<string>('');
    const [commentText, setCommentText] = useState('');
    const [upvoted, setUpvoted] = useState(false);
    const [comments, setComments] = useState<Array<{ id: string; author: string; content: string; time: string; upvotes: number }>>([]);
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    // Find the post
    const post = mockPostsData[postId] || mockPostsData['tech-1'];

    // Initialize comments from post data
    useEffect(() => {
        setComments(post.comments);
    }, [post.comments]);

    const handlePostComment = () => {
        if (commentText.trim()) {
            const newComment = {
                id: `c${Date.now()}`,
                author: username,
                content: commentText.trim(),
                time: 'just now',
                upvotes: 0
            };
            setComments([...comments, newComment]);
            setCommentText('');
        }
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        if (!storedUsername) {
            router.push('/');
        } else {
            setUsername(storedUsername);
        }
    }, [router]);

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
                            onClick={() => router.back()}
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
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 10 }}>
                {/* Post Card */}
                <article
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '24px',
                        animation: 'fadeInUp 0.5s ease both'
                    }}
                >
                    {/* Post Title */}
                    <h1
                        style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '20px',
                            lineHeight: '1.3'
                        }}
                    >
                        {post.title}
                    </h1>

                    {/* Author Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
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
                                fontSize: '18px'
                            }}
                        >
                            {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>
                                {post.author}
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {post.time}
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div
                        style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            marginBottom: '28px',
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {post.content}
                    </div>

                    {/* Post Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <button
                            onClick={() => setUpvoted(!upvoted)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                background: upvoted ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                border: upvoted ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: upvoted ? '#a855f7' : 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '15px',
                                fontWeight: '500'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={upvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {upvoted ? post.upvotes + 1 : post.upvotes}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '15px' }}>
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
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        animation: 'fadeInUp 0.5s ease 0.1s both'
                    }}
                >
                    <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
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
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                fontSize: '15px',
                                resize: 'none',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button
                                disabled={!commentText.trim()}
                                onClick={handlePostComment}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: commentText.trim() ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: commentText.trim() ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.3s ease',
                                    boxShadow: commentText.trim() ? '0 8px 30px rgba(168, 85, 247, 0.4)' : 'none'
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
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    animation: `fadeInUp 0.4s ease ${0.2 + index * 0.1}s both`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
                                            fontSize: '14px'
                                        }}
                                    >
                                        {comment.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>
                                            {comment.author}
                                        </div>
                                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                                            {comment.time}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '15px', lineHeight: '1.6', marginBottom: '12px' }}>
                                    {comment.content}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>
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
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
}
