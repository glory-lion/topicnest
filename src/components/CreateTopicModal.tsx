'use client';

import React, { useState } from 'react';
import { createCategory } from '@/lib/api';
import { TopicIcons, iconOptions } from '@/lib/topicIcons';

interface CreateTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTopicModal({ isOpen, onClose, onSuccess }: CreateTopicModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('folder');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Topic name is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            await createCategory(name.trim(), description.trim() || undefined, icon || 'folder');
            setName('');
            setDescription('');
            setIcon('folder');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create topic');
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;


    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    animation: 'modalSlideIn 0.3s ease'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        Create New Topic
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '24px',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Topic Name */}
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="topicName" style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569',
                            marginBottom: '8px'
                        }}>
                            Topic Name *
                        </label>
                        <input
                            id="topicName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Photography, Cooking, Fitness"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="topicDesc" style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569',
                            marginBottom: '8px'
                        }}>
                            Description (optional)
                        </label>
                        <textarea
                            id="topicDesc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this topic..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                fontSize: '15px',
                                outline: 'none',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Icon Picker */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#475569',
                            marginBottom: '8px'
                        }}>
                            Icon
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {iconOptions.map((iconOption, index) => {
                                // Use the specific gradient defined for this icon type
                                const buttonGradient = iconOption.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

                                return (

                                    <button
                                        key={iconOption.id}
                                        type="button"
                                        onClick={() => setIcon(iconOption.id)}
                                        title={iconOption.name}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '10px',
                                            border: icon === iconOption.id ? '2px solid #8b5cf6' : '2px solid transparent',
                                            background: icon === iconOption.id
                                                ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                                                : buttonGradient,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: icon === iconOption.id ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                                            opacity: icon === iconOption.id ? 1 : 0.85,
                                            color: '#fff'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = icon === iconOption.id ? '1' : '0.85';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        {TopicIcons[iconOption.id]}
                                    </button>
                                );
                            })}
                        </div>
                        <p style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '8px',
                            marginBottom: 0
                        }}>
                            💡 Choose an icon that represents your topic
                        </p>

                    </div>


                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            fontSize: '14px',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            style={{
                                flex: 1,
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0',
                                background: '#fff',
                                color: '#64748b',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: isCreating ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: isCreating ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isCreating) {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCreating) {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || !name.trim()}
                            style={{
                                flex: 1,
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: isCreating || !name.trim()
                                    ? '#cbd5e1'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: isCreating || !name.trim() ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: isCreating || !name.trim()
                                    ? 'none'
                                    : '0 4px 12px rgba(139, 92, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isCreating && name.trim()) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCreating && name.trim()) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                }
                            }}
                        >
                            {isCreating ? 'Creating...' : 'Create Topic'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
