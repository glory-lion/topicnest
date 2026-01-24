'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { searchPosts, formatTimeAgo, Post } from '@/lib/api';
import Link from 'next/link';

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 50%, #faf5ff 100%)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

function SearchContent() {
    const [username, setUsername] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const performSearch = useCallback(async () => {
        if (!query) {
            setPosts([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchPosts(query);
            setPosts(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        if (!storedUsername) {
            router.push('/');
        } else {
            setUsername(storedUsername);
            performSearch();
        }
    }, [router, performSearch]);

    if (!username) return null;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 50%, #faf5ff 100%)',
            }}
        >
            <Header username={username} />

            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                        Search Results
                    </h1>
                    <p style={{ color: '#64748b' }}>
                        {isLoading ? 'Searching...' : `Found ${posts.length} results for "${query}"`}
                    </p>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid rgba(139, 92, 246, 0.2)',
                                borderTop: '3px solid #8b5cf6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }}
                        />
                    </div>
                ) : posts.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '80px 40px',
                            background: '#fff',
                            borderRadius: '24px',
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                        <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>No results found</h2>
                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                            We couldn't find any posts matching "{query}". Try different keywords or browse categories.
                        </p>
                        <Link
                            href="/forum"
                            style={{
                                display: 'inline-block',
                                marginTop: '24px',
                                color: '#8b5cf6',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            Back to Forum
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => router.push(`/postdetail/${post.id}`)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid rgba(139, 92, 246, 0.05)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.05)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div
                                        style={{
                                            background: post.category?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            color: '#fff',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {post.category?.name}
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        {formatTimeAgo(post.created_at)}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                                    {post.title}
                                </h3>
                                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
                                    {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Link
                                        href={`/profile/${post.author?.username}`}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px',
                                            overflow: 'hidden'
                                        }}>
                                            {post.author?.avatar_url ? (
                                                <img src={post.author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                post.author?.username?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                                            {post.author?.username}
                                        </span>
                                    </Link>
                                    <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                            </svg>
                                            {post.upvotes}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            {post.comment_count || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
