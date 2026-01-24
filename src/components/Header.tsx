'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserByUsername } from '@/lib/api';

interface HeaderProps {
    username: string;
}

export default function Header({ username }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch user's avatar on mount and when username changes
    useEffect(() => {
        const fetchUserAvatar = async () => {
            if (username) {
                try {
                    const user = await getUserByUsername(username);
                    if (user?.avatar_url) {
                        setAvatarUrl(user.avatar_url);
                    }
                } catch (error) {
                    console.error('Error fetching user avatar:', error);
                }
            }
        };
        fetchUserAvatar();
    }, [username]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        localStorage.removeItem('topicnest_user_id');
        router.push('/');
    };

    return (
        <>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                    padding: isMobile ? '12px 16px' : '12px 48px'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {/* Logo */}
                    <Link href="/forum" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                        <div
                            style={{
                                width: isMobile ? '36px' : '40px',
                                height: isMobile ? '36px' : '40px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                                flexShrink: 0
                            }}
                        >
                            <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontSize: isMobile ? '18px' : '22px',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.5px',
                                paddingRight: '4px'
                            }}
                        >
                            Topic<em style={{ fontStyle: 'italic', paddingRight: '2px' }}>Nest</em>
                        </span>
                    </Link>

                    {/* Desktop Search Bar */}
                    {!isMobile && (
                        <form
                            onSubmit={handleSearch}
                            style={{
                                flex: 1,
                                maxWidth: '500px',
                                margin: '0 40px',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search posts, topics, or people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px 10px 44px',
                                    borderRadius: '12px',
                                    background: isSearchFocused ? '#fff' : 'rgba(139, 92, 246, 0.05)',
                                    border: `1.5px solid ${isSearchFocused ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)'}`,
                                    fontSize: '15px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSearchFocused ? '0 4px 20px rgba(139, 92, 246, 0.1)' : 'none'
                                }}
                            />
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={isSearchFocused ? '#8b5cf6' : '#94a3b8'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </form>
                    )}

                    {/* Desktop User Section */}
                    {!isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Link
                                href={`/profile/${username}`}
                                style={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease',
                                    background: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <span style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>
                                    {username}
                                </span>
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={username}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        username.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#ef4444';
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.background = 'none';
                                }}
                                title="Logout"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Mobile Right Section */}
                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Mobile Search Icon */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>

                            {/* Mobile Avatar */}
                            <Link href={`/profile/${username}`} style={{ textDecoration: 'none' }}>
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={username}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        username.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {isMobileMenuOpen ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {isMobile && isMobileMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: '60px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        zIndex: 49,
                        padding: '20px',
                        animation: 'slideDown 0.3s ease'
                    }}
                >
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    borderRadius: '14px',
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    border: '1.5px solid rgba(139, 92, 246, 0.15)',
                                    fontSize: '16px',
                                    color: '#1e293b',
                                    outline: 'none'
                                }}
                            />
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="2"
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                    </form>

                    {/* Mobile Menu Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link
                            href="/forum"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: 'rgba(139, 92, 246, 0.05)',
                                textDecoration: 'none',
                                color: '#1e293b',
                                fontWeight: '500'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Home
                        </Link>

                        <Link
                            href={`/profile/${username}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: 'rgba(139, 92, 246, 0.05)',
                                textDecoration: 'none',
                                color: '#1e293b',
                                fontWeight: '500'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile
                        </Link>

                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#ef4444',
                                fontWeight: '500',
                                fontSize: '16px',
                                width: '100%'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {/* Animation keyframes */}
            <style jsx global>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
