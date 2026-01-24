'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import {
    getUserWithStats,
    getPostsByUser,
    getBookmarksByUser,
    updateUserProfile,
    uploadAvatarImage,
    formatTimeAgo,
    Post,
    UserStats,
    Bookmark,
    PostWithRelations,
    UserWithStats,
    BookmarkWithPost
} from '@/lib/api';

export default function ProfilePage() {
    const [loggedInUser, setLoggedInUser] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [profileUser, setProfileUser] = useState<UserWithStats | null>(null);
    const [userPosts, setUserPosts] = useState<PostWithRelations[]>([]);
    const [userBookmarks, setUserBookmarks] = useState<BookmarkWithPost[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newBio, setNewBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const params = useParams();
    const profileUsername = params.username as string;

    const fetchProfileData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userData = await getUserWithStats(profileUsername);
            if (!userData) {
                setProfileUser(null);
                setIsLoading(false);
                return;
            }

            setProfileUser(userData as UserWithStats);
            setNewBio(userData.bio || '');

            const posts = await getPostsByUser(userData.id);
            setUserPosts(posts as PostWithRelations[]);

            // Only fetch bookmarks if viewing own profile
            if (localStorage.getItem('topicnest_user') === profileUsername) {
                const bookmarks = await getBookmarksByUser(userData.id);
                setUserBookmarks(bookmarks as BookmarkWithPost[]);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    }, [profileUsername]);

    useEffect(() => {
        const storedUser = localStorage.getItem('topicnest_user');
        const storedId = localStorage.getItem('topicnest_user_id');
        if (!storedUser) {
            router.push('/');
        } else {
            setLoggedInUser(storedUser);
            setUserId(storedId || '');
            fetchProfileData();
        }
    }, [router, fetchProfileData]);

    const isOwnProfile = loggedInUser.toLowerCase() === profileUsername.toLowerCase();

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && userId) {
            try {
                console.log('Starting avatar upload for user:', userId);
                const url = await uploadAvatarImage(file, userId);
                console.log('Avatar uploaded successfully, URL:', url);

                if (url && profileUser) {
                    console.log('Updating profile with new avatar URL...');
                    await updateUserProfile(userId, profileUser.bio || '', url);
                    console.log('Profile updated successfully');
                    setProfileUser({ ...profileUser, avatar_url: url });
                }
            } catch (error: any) {
                console.error('Avatar upload error:', error);

                let errorMessage = error.message || 'Unknown error';

                // Check for RLS-related error
                if (errorMessage.includes('no rows were updated') || errorMessage.includes('RLS')) {
                    errorMessage = `Database update failed. Please run the RLS policies from supabase-schema.sql in your Supabase SQL Editor.

To fix this:
1. Go to your Supabase Dashboard > SQL Editor
2. Run the RLS policies section from supabase-schema.sql
3. Or temporarily disable RLS on the users table for testing`;
                }

                alert(`Failed to upload image: ${errorMessage}`);
            }
        }
    };

    const handleSaveProfile = async () => {
        if (!userId || !profileUser) return;
        setIsSaving(true);
        try {
            await updateUserProfile(userId, newBio, profileUser.avatar_url || undefined);
            setProfileUser({ ...profileUser, bio: newBio });
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !profileUser) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div style={{ minHeight: '100vh', textAlign: 'center', padding: '100px' }}>
                <h1>User not found</h1>
                <button onClick={() => router.push('/forum')}>Back to Forum</button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <Header username={loggedInUser} />

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Profile Header Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '40px',
                    position: 'relative'
                }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '48px',
                            fontWeight: '700',
                            overflow: 'hidden',
                            border: '4px solid #fff',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }}>
                            {profileUser.avatar_url ? (
                                <img src={profileUser.avatar_url} alt={profileUser.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                profileUser.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        {isOwnProfile && (
                            <label style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                width: '36px',
                                height: '36px',
                                background: '#fff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </label>
                        )}
                    </div>

                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                        {profileUser.username}
                    </h1>

                    <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                        Joined {new Date(profileUser.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{profileUser.post_count}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Posts</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{profileUser.comment_count}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Comments</div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                        {isEditing ? (
                            <div>
                                <textarea
                                    value={newBio}
                                    onChange={(e) => setNewBio(e.target.value)}
                                    placeholder="Write something about yourself..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #8b5cf6',
                                        fontSize: '15px',
                                        color: '#334155',
                                        minHeight: '80px',
                                        outline: 'none',
                                        marginBottom: '12px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setNewBio(profileUser.bio || ''); }}
                                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: isOwnProfile ? '16px' : '0' }}>
                                    {profileUser.bio || "This user hasn't written a bio yet."}
                                </p>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                    <div
                        onClick={() => setActiveTab('posts')}
                        style={{
                            padding: '12px 4px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: activeTab === 'posts' ? '#8b5cf6' : '#64748b',
                            borderBottom: activeTab === 'posts' ? '2px solid #8b5cf6' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Posts
                    </div>
                    {isOwnProfile && (
                        <div
                            onClick={() => setActiveTab('bookmarks')}
                            style={{
                                padding: '12px 4px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: activeTab === 'bookmarks' ? '#8b5cf6' : '#64748b',
                                borderBottom: activeTab === 'bookmarks' ? '2px solid #8b5cf6' : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Bookmarks
                        </div>
                    )}
                </div>

                {/* Content */}
                {activeTab === 'posts' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {userPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No posts yet.</div>
                        ) : (
                            userPosts.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => router.push(`/postdetail/${post.id}`)}
                                    style={{
                                        background: '#fff',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                        border: '1px solid #eef2f6',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {post.categories?.name}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formatTimeAgo(post.created_at)}</span>
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{post.title}</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {post.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {userBookmarks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No bookmarks yet.</div>
                        ) : (
                            userBookmarks.map(bookmark => (
                                bookmark.posts && (
                                    <div
                                        key={bookmark.id}
                                        onClick={() => router.push(`/postdetail/${bookmark.posts!.id}`)}
                                        style={{
                                            background: '#fff',
                                            padding: '20px',
                                            borderRadius: '16px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                            border: '1px solid #eef2f6',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#ec4899', background: 'rgba(236,72,153,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                                {bookmark.posts.categories?.name}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formatTimeAgo(bookmark.posts.created_at)}</span>
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{bookmark.posts.title}</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b' }}>by {bookmark.posts.users?.username}</p>
                                    </div>
                                )
                            ))
                        )}
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
