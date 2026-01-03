'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnterForum = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      localStorage.setItem('topicnest_user', username);
      console.log("HELLO");
      setTimeout(() => {
        router.push('/forum');
      }, 500);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 35%, #a855f7 50%, #d946ef 70%, #ec4899 100%)'
      }}
    >
      {/* Main Card */}
      <div
        className="w-full max-w-[420px] animate-fadeIn"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
          padding: '48px 40px'
        }}
      >
        {/* Logo Section - centered */}
        <div className="flex items-center justify-center gap-3 mb-24">
          {/* Icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          {/* Brand Name */}
          <span
            style={{
              fontSize: '26px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Topic<em style={{ fontStyle: 'italic' }}>Nest</em>
          </span>
        </div>

        {/* Tagline */}
        <p
          className="text-center"
          style={{
            color: '#6b7280',
            fontSize: '17px',
            marginBottom: '10px',
            marginTop: '20px'
          }}
        >
          Join the conversation. Share your thoughts.
        </p>

        {/* Form */}
        <form onSubmit={handleEnterForum}>
          {/* Username Label */}
          <label
            htmlFor="username"
            style={{
              display: 'block',
              color: '#1f2937',
              fontSize: '15px',
              fontWeight: '600',
              marginBottom: '12px'
            }}
          >
            Username
          </label>

          {/* Username Input */}
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoFocus
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '15px',
              color: '#374151',
              background: '#ffffff',
              border: '1.5px solid #e5e7eb',
              borderRadius: '14px',
              outline: 'none',
              marginBottom: '28px',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8b5cf6';
              e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Enter Button */}
          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            style={{
              width: '100%',
              padding: '18px 28px',
              fontSize: '17px',
              fontWeight: '600',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              border: 'none',
              borderRadius: '14px',
              cursor: (!username.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!username.trim() || isLoading) ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              if (username.trim() && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg
                  className="animate-spin"
                  style={{ width: '20px', height: '20px' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                </svg>
                Entering...
              </span>
            ) : (
              'Enter Forum'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
