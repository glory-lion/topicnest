'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreatePostPage() {
    const [username, setUsername] = useState<string>('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const topicId = searchParams.get('topic') || '';

    // Topic display names
    const topicNames: Record<string, string> = {
        'technology': 'Technology',
        'gaming': 'Gaming',
        'art-design': 'Art & Design',
        'books': 'Books & Literature',
        'music': 'Music',
        'health': 'Health & Fitness'
    };

    const topicName = topicNames[topicId] || 'Select Topic';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            setIsSubmitting(true);

            // Create new post object
            const newPost = {
                id: `user-${Date.now()}`,
                title: title.trim(),
                excerpt: content.trim().substring(0, 100) + (content.length > 100 ? '...' : ''),
                content: content.trim(),
                author: username,
                time: 'just now',
                upvotes: 0,
                comments: 0
            };

            // Get existing posts from localStorage
            const existingPosts = JSON.parse(localStorage.getItem('topicnest_posts') || '{}');

            // Add new post to the topic
            if (!existingPosts[topicId]) {
                existingPosts[topicId] = [];
            }
            existingPosts[topicId].unshift(newPost); // Add to beginning

            // Save back to localStorage
            localStorage.setItem('topicnest_posts', JSON.stringify(existingPosts));

            // Redirect to topic page
            setTimeout(() => {
                router.push(`/topic/${topicId}`);
            }, 500);
        }
    };

    const canSubmit = title.trim().length > 0 && content.trim().length > 0;

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
                {/* Page Title */}
                <div style={{ marginBottom: '40px' }}>
                    <h1
                        style={{
                            fontSize: '36px',
                            fontWeight: '800',
                            color: '#ffffff',
                            marginBottom: '8px',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Create New Post
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                        Posting in <span style={{ color: '#a855f7', fontWeight: '600' }}>{topicName}</span>
                    </p>
                </div>

                {/* Post Form */}
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            padding: '32px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            animation: 'fadeInUp 0.5s ease both'
                        }}
                    >
                        {/* Title Input */}
                        <div style={{ marginBottom: '24px' }}>
                            <label
                                htmlFor="title"
                                style={{
                                    display: 'block',
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    marginBottom: '10px'
                                }}
                            >
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Give your post a catchy title..."
                                maxLength={300}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontSize: '16px',
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
                            <div style={{ textAlign: 'right', marginTop: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>
                                {title.length}/300
                            </div>
                        </div>

                        {/* Content Input */}
                        <div style={{ marginBottom: '28px' }}>
                            <label
                                htmlFor="content"
                                style={{
                                    display: 'block',
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    marginBottom: '10px'
                                }}
                            >
                                Content
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your thoughts, ideas, or questions..."
                                rows={10}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontSize: '15px',
                                    lineHeight: '1.7',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                    minHeight: '200px'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                style={{
                                    padding: '14px 28px',
                                    borderRadius: '14px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                style={{
                                    padding: '14px 32px',
                                    borderRadius: '14px',
                                    background: canSubmit && !isSubmitting
                                        ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: canSubmit && !isSubmitting ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.3s ease',
                                    boxShadow: canSubmit && !isSubmitting ? '0 8px 30px rgba(168, 85, 247, 0.4)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTop: '2px solid white',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}
                                        />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Tips Section */}
                <div
                    style={{
                        marginTop: '24px',
                        padding: '24px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        animation: 'fadeInUp 0.5s ease 0.1s both'
                    }}
                >
                    <h3 style={{ color: '#a855f7', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Tips for a great post
                    </h3>
                    <ul style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                        <li>Use a clear and descriptive title</li>
                        <li>Be respectful and constructive in your discussions</li>
                        <li>Add relevant details to help others understand your point</li>
                        <li>Engage with comments on your post</li>
                    </ul>
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
                input::placeholder, textarea::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
}
