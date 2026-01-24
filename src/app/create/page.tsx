'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCategories, getCategoryById, getCategoryBySlug, createPost, getPostById, updatePost, uploadPostImage, createPostWithImage, Category } from '@/lib/api';
import Header from '@/components/Header';

export default function CreatePostPage() {
    return (
        <Suspense fallback={
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
        }>
            <CreatePostContent />
        </Suspense>
    );
}

function CreatePostContent() {
    const [username, setUsername] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editPostId, setEditPostId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryIdParam = searchParams.get('categoryId') || '';
    const topicSlugParam = searchParams.get('topic') || '';
    const editParam = searchParams.get('edit') || '';

    // Fetch categories and set up editing if applicable
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const categoriesData = await getCategories();
            setCategories(categoriesData);

            // If categoryId or topic slug is provided, set the selected category
            if (categoryIdParam) {
                const category = await getCategoryById(categoryIdParam);
                if (category) {
                    setSelectedCategory(category);
                }
            } else if (topicSlugParam) {
                const category = await getCategoryBySlug(topicSlugParam);
                if (category) {
                    setSelectedCategory(category);
                }
            }

            // If editing, load the post data
            if (editParam) {
                setIsEditing(true);
                setEditPostId(editParam);
                const postData = await getPostById(editParam);
                if (postData) {
                    setTitle(postData.title);
                    setContent(postData.content);
                    if (postData.category) {
                        setSelectedCategory(postData.category);
                    }
                    if (postData.image_url) {
                        setExistingImageUrl(postData.image_url);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [categoryIdParam, editParam, topicSlugParam]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('topicnest_user');
        const storedUserId = localStorage.getItem('topicnest_user_id');
        if (!storedUsername || !storedUserId) {
            router.push('/');
        } else {
            setUsername(storedUsername);
            setUserId(storedUserId);
            fetchData();
        }
    }, [router, fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('topicnest_user');
        localStorage.removeItem('topicnest_user_id');
        router.push('/');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim() && selectedCategory && userId) {
            setIsSubmitting(true);
            try {
                let imageUrl = null;

                // Only attempt upload if a file is actually selected
                if (selectedFile) {
                    imageUrl = await uploadPostImage(selectedFile, userId);
                } else if (existingImageUrl) {
                    imageUrl = existingImageUrl;
                }

                if (isEditing && editPostId) {
                    // Update existing post
                    await updatePost(editPostId, title.trim(), content.trim(), imageUrl || undefined);
                } else {
                    // Create new post
                    await createPostWithImage(title.trim(), content.trim(), selectedCategory.id, userId, imageUrl || undefined);
                }
                // Redirect to topic page
                router.push(`/topic/${selectedCategory.slug}`);
            } catch (error: any) {
                console.error('Error saving post:', error);
                alert(`Error saving post: ${error.message || 'Unknown error'}. 
                
If you uploaded an image, make sure it's under 5MB and that you've created the "post-images" bucket in Supabase.`);
                setIsSubmitting(false);
            }
        }
    };

    const canSubmit = title.trim().length > 0 && content.trim().length > 0 && selectedCategory !== null;

    if (!username || isLoading) {
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
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 10 }}>
                {/* Page Title */}
                <div style={{ marginBottom: '40px' }}>
                    <h1
                        style={{
                            fontSize: '36px',
                            fontWeight: '800',
                            color: '#1e293b',
                            marginBottom: '8px',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        {isEditing ? 'Edit Post' : 'Create New Post'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>
                        {selectedCategory
                            ? <>Posting in <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{selectedCategory.name}</span></>
                            : 'Select a category below'
                        }
                    </p>
                </div>

                {/* Post Form */}
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '24px',
                            padding: '32px',
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
                            animation: 'fadeInUp 0.5s ease both'
                        }}
                    >
                        {/* Title Input */}
                        <div style={{ marginBottom: '24px' }}>
                            <label
                                htmlFor="title"
                                style={{
                                    display: 'block',
                                    color: '#1e293b',
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
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                    color: '#1e293b',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                                }}
                            />
                            <div style={{ textAlign: 'right', marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>
                                {title.length}/300
                            </div>
                        </div>

                        {/* Category Selector */}
                        {!isEditing && (
                            <div style={{ marginBottom: '24px' }}>
                                <label
                                    htmlFor="category"
                                    style={{
                                        display: 'block',
                                        color: '#1e293b',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={selectedCategory?.id || ''}
                                    onChange={(e) => {
                                        const cat = categories.find(c => c.id === e.target.value);
                                        setSelectedCategory(cat || null);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        background: 'rgba(139, 92, 246, 0.05)',
                                        border: '1px solid rgba(139, 92, 246, 0.15)',
                                        color: '#1e293b',
                                        fontSize: '16px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                >
                                    <option value="">Select a category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Content Input */}
                        <div style={{ marginBottom: '28px' }}>
                            <label
                                htmlFor="content"
                                style={{
                                    display: 'block',
                                    color: '#1e293b',
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
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                    color: '#1e293b',
                                    fontSize: '15px',
                                    lineHeight: '1.7',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                    minHeight: '200px'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                                }}
                            />
                        </div>

                        {/* Image Upload */}
                        <div style={{ marginBottom: '28px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    color: '#1e293b',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    marginBottom: '10px'
                                }}
                            >
                                Add Image (Optional)
                            </label>
                            <div
                                style={{
                                    border: '2px dashed rgba(139, 92, 246, 0.2)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    background: 'rgba(139, 92, 246, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'; e.currentTarget.style.background = 'rgba(139, 92, 246, 0.02)'; }}
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview || existingImageUrl ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={imagePreview || existingImageUrl || ''}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setImagePreview(null);
                                                setExistingImageUrl(null);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '-10px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <p style={{ color: '#64748b', fontSize: '14px' }}>Click to upload an image</p>
                                        <p style={{ color: '#94a3b8', fontSize: '12px' }}>PNG, JPG or GIF up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                style={{
                                    padding: '14px 28px',
                                    borderRadius: '14px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                    color: '#64748b',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
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
                                        ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                                        : 'rgba(139, 92, 246, 0.1)',
                                    border: 'none',
                                    color: canSubmit && !isSubmitting ? 'white' : '#94a3b8',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.3s ease',
                                    boxShadow: canSubmit && !isSubmitting ? '0 8px 30px rgba(139, 92, 246, 0.3)' : 'none',
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
                        background: 'rgba(139, 92, 246, 0.08)',
                        borderRadius: '16px',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                        animation: 'fadeInUp 0.5s ease 0.1s both'
                    }}
                >
                    <h3 style={{ color: '#8b5cf6', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Tips for a great post
                    </h3>
                    <ul style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
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
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
