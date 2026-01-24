'use client';

import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    type = 'danger'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'rgba(239, 68, 68, 0.1)',
            border: 'rgba(239, 68, 68, 0.3)',
            text: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            glow: 'rgba(239, 68, 68, 0.3)'
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
            text: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            glow: 'rgba(245, 158, 11, 0.3)'
        },
        info: {
            bg: 'rgba(139, 92, 246, 0.1)',
            border: 'rgba(139, 92, 246, 0.3)',
            text: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            glow: 'rgba(139, 92, 246, 0.3)'
        }
    };

    const colorScheme = colors[type];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onCancel}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '32px',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    zIndex: 9999,
                    animation: 'slideUp 0.3s ease'
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: colorScheme.bg,
                        border: `1px solid ${colorScheme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        color: colorScheme.text
                    }}
                >
                    {type === 'danger' && (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    )}
                    {type === 'warning' && (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    )}
                    {type === 'info' && (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    )}
                </div>

                {/* Title */}
                <h3
                    style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b',
                        textAlign: 'center',
                        marginBottom: '12px'
                    }}
                >
                    {title}
                </h3>

                {/* Message */}
                <p
                    style={{
                        fontSize: '15px',
                        color: '#64748b',
                        textAlign: 'center',
                        lineHeight: '1.6',
                        marginBottom: '28px'
                    }}
                >
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            border: 'none',
                            color: '#475569',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.background = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: '12px',
                            background: colorScheme.gradient,
                            border: 'none',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 8px 20px ${colorScheme.glow}`,
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 12px 28px ${colorScheme.glow}`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 8px 20px ${colorScheme.glow}`;
                        }}
                    >
                        {isLoading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>

            {/* Animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -45%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </>
    );
}
