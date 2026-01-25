'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      // Password length check for signup
      if (!isLogin && password.trim().length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccessMsg('');

      try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/users';
        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const apiUrl = envUrl.trim().replace(/\/$/, ''); // Remove whitespace and trailing slash
        const fullUrl = `${apiUrl}${endpoint}`;
        console.log('Attempting auth request to:', fullUrl);

        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password: password.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        // Store user data
        const user = data.user || data;
        const token = data.token || user.id;

        if (isLogin) {
          // Store user data and redirect only if logging in
          localStorage.setItem('topicnest_user', user.username);
          localStorage.setItem('topicnest_user_id', token);
          router.push('/forum');
        } else {
          // Signup successful - Switch to login view and show message
          setIsLogin(true);
          setPassword(''); // Clear password so they have to type it again (security/ux)
          setUsername(user.username || username); // Pre-fill username for convenience
          setSuccessMsg('✨ Account created! Please sign in with your new credentials.');
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Failed to authenticate. Please try again.');
        setIsLoading(false);
      }
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
        <div className="flex items-center justify-center gap-4 mb-12" style={{ marginBottom: '15px' }}>
          {/* Icon */}
          <div
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #c084fc 0%, #d946ef 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px -5px rgba(192, 132, 252, 0.4)',
              flexShrink: 0
            }}
          >
            <svg
              width="20"
              height="20"
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
              fontSize: '28px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-0.02em',
              lineHeight: '1.4',
              padding: '8px 0'
            }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #a855f7 0%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                paddingLeft: '2px',
                paddingRight: '1px',
                paddingBottom: '2px'
              }}
            >
              Topic
            </span>
            <span
              style={{
                background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontStyle: 'italic',
                paddingBottom: '2px',
                paddingRight: '2px'
              }}
            >
              Nest
            </span>
          </span>
        </div>

        {/* Tab Toggle for Login/Signup */}
        <div style={{
          display: 'flex',
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '4px',
          marginTop: '12px',
          marginBottom: '24px'
        }}>
          {/* Login Tab */}
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccessMsg('');
              setPassword('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: isLogin ? '#ffffff' : '#6b7280',
              background: isLogin ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isLogin ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            Sign In
          </button>

          {/* Signup Tab */}
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccessMsg('');
              setPassword('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: !isLogin ? '#ffffff' : '#6b7280',
              background: !isLogin ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: !isLogin ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Tagline - changes based on mode */}
        <p
          className="text-center"
          style={{
            color: '#6b7280',
            fontSize: '15px',
            marginBottom: '24px',
            minHeight: '40px'
          }}
        >
          {isLogin
            ? '👋 Welcome back! Enter your credentials to continue.'
            : '🚀 Create your account and join the conversation!'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
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

          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
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
              marginBottom: '20px',
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

          {/* Password Field */}
          <label
            htmlFor="password"
            style={{
              display: 'block',
              color: '#1f2937',
              fontSize: '15px',
              fontWeight: '600',
              marginBottom: '12px'
            }}
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder={isLogin ? "Enter your password" : "Create a password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '15px',
              color: '#374151',
              background: '#ffffff',
              border: '1.5px solid #e5e7eb',
              borderRadius: '14px',
              outline: 'none',
              marginBottom: '8px',
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

          {/* Password hint for signup */}
          {!isLogin && (
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '16px',
              marginTop: '4px'
            }}>
              💡 Choose a strong password (at least 6 characters)
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>✅</span>
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || isLoading}
            style={{
              width: '100%',
              padding: '18px 28px',
              fontSize: '17px',
              fontWeight: '600',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              border: 'none',
              borderRadius: '14px',
              cursor: (!username.trim() || !password.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!username.trim() || !password.trim() || isLoading) ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (username.trim() && password.trim() && !isLoading) {
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
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? '🔐 Sign In to Your Account' : '✨ Create Your Account'
            )}
          </button>
        </form>
      </div >
    </div >
  );
}
