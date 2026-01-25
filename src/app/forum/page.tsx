'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, deleteCategory, Category } from '@/lib/api';

import Header from '@/components/Header';
import CreateTopicModal from '@/components/CreateTopicModal';
import { TopicIcons } from '@/lib/topicIcons';



// Icon components for categories (since we can't store React in DB)
const categoryIcons: { [key: string]: React.ReactNode } = {
    'technology': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    ),
    'gaming': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h4" />
            <path d="M8 10v4" />
            <circle cx="17" cy="10" r="1" />
            <circle cx="15" cy="12" r="1" />
        </svg>
    ),
    'art-design': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="19" cy="13" r="2" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="12" cy="19" r="2" />
            <path d="M12 2a10 10 0 1 0 10 10" />
        </svg>
    ),
    'books': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    'music': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    ),
    'movies-tv': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
    ),
    'health': (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
};

// Default gradient and glow if not defined in DB
const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const defaultGlowColor = 'rgba(102, 126, 234, 0.5)';

export default function ForumPage() {
    const [username, setUsername] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const router = useRouter();


    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 576);
            setIsTablet(window.innerWidth >= 576 && window.innerWidth < 992);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        if (!storedUsername) {
            router.push('/');
        } else {
            setUsername(storedUsername);
            loadCategories();
        }
    }, [router]);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (e: React.MouseEvent, categoryId: string, slug: string) => {
        e.stopPropagation();

        // Prevent deleting default categories
        const defaultCategories = ['technology', 'gaming', 'art-design', 'books', 'music', 'movies-tv', 'health'];
        if (defaultCategories.includes(slug)) {
            alert("You cannot delete default topics.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
            try {
                await deleteCategory(categoryId);
                await loadCategories(); // Refresh list
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete topic');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        localStorage.removeItem('topicnest_user_id');
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
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
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
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
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
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    animation: 'pulse 6s ease-in-out infinite'
                }}
            />

            <Header username={username} />

            {/* Main Content */}
            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: isMobile ? '32px 16px' : isTablet ? '48px 24px' : '64px 32px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Page Title */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '64px' }}>
                    <h1
                        style={{
                            fontSize: isMobile ? '32px' : isTablet ? '40px' : '48px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: '16px',
                            letterSpacing: '-1px'
                        }}
                    >
                        Explore Topics
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: isMobile ? '15px' : '18px',
                        maxWidth: '400px',
                        margin: '0 auto 24px',
                        padding: isMobile ? '0 16px' : '0'
                    }}>
                        Choose a category to join the discussion and connect with others
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                            padding: isMobile ? '10px 20px' : '12px 28px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                            transition: 'all 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Topic
                    </button>
                </div>


                {/* Topics Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, minmax(0, 360px))',
                        gap: isMobile ? '16px' : '28px',
                        justifyContent: 'center'
                    }}
                >
                    {isLoading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                            <div
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    border: '3px solid rgba(139, 92, 246, 0.2)',
                                    borderTop: '3px solid #8b5cf6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto'
                                }}
                            />
                        </div>
                    ) : categories.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                            No categories found. Please run the SQL schema in Supabase.
                        </div>
                    ) : (
                        categories.map((category, index) => {
                            const gradient = category.gradient || defaultGradient;
                            const glowColor = category.glow_color || defaultGlowColor;
                            const icon = categoryIcons[category.slug] || categoryIcons['technology'];

                            return (
                                <div
                                    key={category.id}
                                    onClick={() => router.push(`/topic/${category.slug}`)}
                                    onMouseEnter={() => setHoveredTopic(category.id)}
                                    onMouseLeave={() => setHoveredTopic(null)}
                                    style={{
                                        background: hoveredTopic === category.id
                                            ? 'rgba(255, 255, 255, 0.95)'
                                            : 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        borderRadius: isMobile ? '20px' : '24px',
                                        padding: isMobile ? '20px' : '32px',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: hoveredTopic === category.id ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                                        boxShadow: hoveredTopic === category.id
                                            ? `0 30px 60px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.1)`
                                            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(139, 92, 246, 0.05)',
                                        border: '1px solid rgba(139, 92, 246, 0.1)',
                                        animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                                        position: 'relative'
                                    }}
                                >
                                    {/* Delete Button (only for user-created topics) */}
                                    {!['technology', 'gaming', 'art-design', 'books', 'music', 'movies-tv', 'health'].includes(category.slug) && (
                                        <button
                                            onClick={(e) => handleDeleteCategory(e, category.id, category.slug)}
                                            style={{
                                                position: 'absolute',
                                                top: isMobile ? '10px' : '20px',
                                                right: isMobile ? '10px' : '20px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                opacity: 1,
                                                transition: 'all 0.2s',
                                                zIndex: 10
                                            }}
                                            title="Delete topic"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#ef4444';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.color = '#ef4444';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    )}

                                    {/* Icon */}
                                    <div
                                        style={{
                                            width: isMobile ? '52px' : '64px',
                                            height: isMobile ? '52px' : '64px',
                                            borderRadius: isMobile ? '16px' : '20px',
                                            background: gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            marginBottom: isMobile ? '16px' : '24px',
                                            transition: 'all 0.4s ease',
                                            transform: hoveredTopic === category.id ? 'scale(1.15) rotate(5deg)' : 'scale(1) rotate(0deg)',
                                            boxShadow: hoveredTopic === category.id
                                                ? `0 20px 40px ${glowColor}`
                                                : `0 10px 30px ${glowColor.replace('0.5', '0.2')}`,
                                            fontSize: '28px'
                                        }}
                                    >
                                        {/* Check if it's a TopicIcon key first, then fall back to slug-based SVG icons */}
                                        {category.icon && TopicIcons[category.icon] ? (
                                            TopicIcons[category.icon]
                                        ) : categoryIcons[category.slug] ? (
                                            icon
                                        ) : (
                                            TopicIcons['folder'] || icon
                                        )}
                                    </div>



                                    {/* Title */}
                                    <h3
                                        style={{
                                            fontSize: isMobile ? '18px' : '22px',
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            marginBottom: '10px',
                                            letterSpacing: '-0.3px'
                                        }}
                                    >
                                        {category.name}
                                    </h3>

                                    {/* Description */}
                                    <p
                                        style={{
                                            color: '#64748b',
                                            fontSize: '15px',
                                            lineHeight: '1.6',
                                            marginBottom: '24px'
                                        }}
                                    >
                                        {category.description || 'Join the discussion'}
                                    </p>

                                    {/* Arrow */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: hoveredTopic === category.id ? gradient : 'rgba(139, 92, 246, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                transform: hoveredTopic === category.id ? 'translateX(4px)' : 'translateX(0)'
                                            }}
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={hoveredTopic === category.id ? '#ffffff' : '#8b5cf6'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Create Topic Modal */}
            <CreateTopicModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    loadCategories();
                }}
            />

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
