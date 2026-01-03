'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    SearchIcon,
    BellIcon,
    ChatIcon,
    CreateIcon,
    UserIcon,
    ChevronDownIcon,
    MenuIcon
} from './Icons';

interface HeaderProps {
    username?: string;
}

const Header: React.FC<HeaderProps> = ({ username = 'Guest' }) => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        router.push('/');
    };

    return (
        <header
            className="glass sticky top-0 z-50"
            style={{
                height: '64px',
                borderBottom: '1px solid var(--border-color-dark)',
                background: 'rgba(14, 17, 19, 0.9)'
            }}
        >
            <div className="flex items-center justify-between h-full px-4 max-w-[1920px] mx-auto">
                {/* Logo */}
                <Link href="/forum" className="flex items-center gap-2">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold hidden sm:block gradient-text">
                        TopicNest
                    </span>
                </Link>

                {/* Search Bar */}
                <div
                    className="flex-1 max-w-xl mx-4"
                    style={{
                        position: 'relative',
                    }}
                >
                    <div
                        className="flex items-center rounded-full transition-all duration-300"
                        style={{
                            background: searchFocused ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                            border: `1px solid ${searchFocused ? 'var(--primary-purple)' : 'var(--border-color-dark)'}`,
                            boxShadow: searchFocused ? '0 0 0 3px rgba(124, 58, 237, 0.2)' : 'none',
                        }}
                    >
                        <div className="pl-4 pr-2" style={{ color: 'var(--text-muted)' }}>
                            <SearchIcon size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search TopicNest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="flex-1 py-2.5 pr-4 bg-transparent border-none outline-none text-sm"
                            style={{ color: 'var(--text-light)' }}
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 rounded-full transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <MenuIcon size={22} />
                    </button>

                    {/* Create button */}
                    <Link
                        href="/create-post"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            color: 'white'
                        }}
                    >
                        <CreateIcon size={18} />
                        <span className="font-medium">Create</span>
                    </Link>

                    {/* Notification Icons */}
                    <div className="hidden md:flex items-center gap-1">
                        <button
                            className="p-2.5 rounded-full transition-colors relative hover:bg-[var(--bg-tertiary)]"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <ChatIcon size={20} />
                            <span className="badge">3</span>
                        </button>
                        <button
                            className="p-2.5 rounded-full transition-colors relative hover:bg-[var(--bg-tertiary)]"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <BellIcon size={20} />
                            <span className="badge">5</span>
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 pl-3 rounded-full transition-all hover:bg-[var(--bg-tertiary)]"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color-dark)'
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                                }}
                            >
                                <span className="text-white text-sm font-bold">
                                    {username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-light)' }}>
                                {username}
                            </span>
                            <ChevronDownIcon size={16} style={{ color: 'var(--text-muted)' }} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div
                                    className="absolute right-0 top-full mt-2 py-2 rounded-lg z-20 min-w-[180px] animate-fadeIn"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color-dark)',
                                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
                                    }}
                                >
                                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color-dark)' }}>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-light)' }}>
                                            {username}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            1,234 karma
                                        </p>
                                    </div>
                                    <Link
                                        href={`/u/${username}`}
                                        className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-[var(--bg-tertiary)]"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <UserIcon size={16} />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2 transition-colors hover:bg-[var(--bg-tertiary)]"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
