'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Topic data
const topics = [
    {
        id: 'technology',
        name: 'Technology',
        description: 'Discuss the latest tech trends and innovations',
        posts: 142,
        members: '12.5k',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ),
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        glowColor: 'rgba(102, 126, 234, 0.5)'
    },
    {
        id: 'gaming',
        name: 'Gaming',
        description: 'Share your gaming experiences and reviews',
        posts: 98,
        members: '8.2k',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 12h4" />
                <path d="M8 10v4" />
                <circle cx="17" cy="10" r="1" />
                <circle cx="15" cy="12" r="1" />
            </svg>
        ),
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        glowColor: 'rgba(17, 153, 142, 0.5)'
    },
    {
        id: 'art-design',
        name: 'Art & Design',
        description: 'Showcase your creativity and get inspired',
        posts: 76,
        members: '6.8k',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2.5" />
                <circle cx="19" cy="13" r="2" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="12" cy="19" r="2" />
                <path d="M12 2a10 10 0 1 0 10 10" />
            </svg>
        ),
        gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
        glowColor: 'rgba(238, 9, 121, 0.5)'
    },
    {
        id: 'books',
        name: 'Books & Literature',
        description: 'Discover new reads and discuss your favorites',
        posts: 63,
        members: '4.3k',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        glowColor: 'rgba(240, 147, 251, 0.5)'
    },
    {
        id: 'music',
        name: 'Music',
        description: 'Talk about your favorite artists and genres',
        posts: 89,
        members: '9.1k',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
            </svg>
        ),
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        glowColor: 'rgba(79, 172, 254, 0.5)'
    },
    {
        id: 'health',
        name: 'Health & Fitness',
        description: 'Share tips and motivation for a healthy lifestyle',
        posts: 54,
        members: '5.7k',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        glowColor: 'rgba(250, 112, 154, 0.5)'
    }
];

export default function ForumPage() {
    const [username, setUsername] = useState<string>('');
    const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
    const router = useRouter();

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
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    animation: 'pulse 6s ease-in-out infinite'
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
                    {/* Logo */}
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
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px', position: 'relative', zIndex: 10 }}>
                {/* Page Title */}
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h1
                        style={{
                            fontSize: '48px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: '16px',
                            letterSpacing: '-1px'
                        }}
                    >
                        Explore Topics
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '18px', maxWidth: '400px', margin: '0 auto' }}>
                        Choose a category to join the discussion and connect with others
                    </p>
                </div>

                {/* Topics Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 360px))',
                        gap: '28px',
                        justifyContent: 'center'
                    }}
                >
                    {topics.map((topic, index) => (
                        <div
                            key={topic.id}
                            onClick={() => router.push(`/topic/${topic.id}`)}
                            onMouseEnter={() => setHoveredTopic(topic.id)}
                            onMouseLeave={() => setHoveredTopic(null)}
                            style={{
                                background: hoveredTopic === topic.id
                                    ? 'rgba(255, 255, 255, 0.12)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '24px',
                                padding: '32px',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: hoveredTopic === topic.id ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                                boxShadow: hoveredTopic === topic.id
                                    ? `0 30px 60px ${topic.glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.2)`
                                    : '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                animation: `fadeInUp 0.6s ease ${index * 0.1}s both`
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '20px',
                                    background: topic.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginBottom: '24px',
                                    transition: 'all 0.4s ease',
                                    transform: hoveredTopic === topic.id ? 'scale(1.15) rotate(5deg)' : 'scale(1) rotate(0deg)',
                                    boxShadow: hoveredTopic === topic.id
                                        ? `0 20px 40px ${topic.glowColor}`
                                        : `0 10px 30px ${topic.glowColor.replace('0.5', '0.3')}`
                                }}
                            >
                                {topic.icon}
                            </div>

                            {/* Title */}
                            <h3
                                style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    marginBottom: '10px',
                                    letterSpacing: '-0.3px'
                                }}
                            >
                                {topic.name}
                            </h3>

                            {/* Description */}
                            <p
                                style={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    marginBottom: '24px'
                                }}
                            >
                                {topic.description}
                            </p>

                            {/* Stats */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        {topic.posts} posts
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        {topic.members}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: hoveredTopic === topic.id ? topic.gradient : 'rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease',
                                        transform: hoveredTopic === topic.id ? 'translateX(4px)' : 'translateX(0)'
                                    }}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={hoveredTopic === topic.id ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
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
                        transform: translateY(40px);
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
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.5;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: translate(-50%, -50%) scale(1.1);
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
