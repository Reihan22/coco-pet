'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, string> = { username, password };
      if (isRegister) payload.email = email;

      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-orb auth-orb-cyan" />
      <div className="auth-orb auth-orb-pink" />

      {/* Grid overlay */}
      <div className="auth-grid" />

      {/* Particles */}
      <div className="auth-particles">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className={`auth-particle auth-particle--${['cyan','pink','lime'][i % 3]}`}
            style={{
              left: `${(i * 5.5) % 100}%`,
              animationDuration: `${6 + (i % 8)}s`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="auth-shell">
        {/* Top brand */}
        <Link href="/" className="auth-brand">
          <span className="auth-brand-icon">🤖</span>
          <span className="auth-brand-text">CodeBot</span>
        </Link>

        {/* Mech sprite */}
        <div className="auth-mech-wrap">
          <div className="auth-mech-glow" />
          <svg
            width="100"
            height="120"
            viewBox="0 0 100 120"
            className="auth-mech-svg"
            style={{ imageRendering: 'pixelated' }}
          >
            <rect x="46" y="0" width="8" height="14" fill="#5a6080" />
            <rect x="42" y="0" width="16" height="5" rx="2" fill={isRegister ? '#00ffd5' : '#ff2d78'} />
            <circle cx="50" cy="4" r="3" fill={isRegister ? '#00ffd5' : '#ff2d78'}>
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <rect x="25" y="14" width="50" height="30" rx="5" fill="#3a3f5c" />
            <rect x="29" y="18" width="42" height="22" rx="4" fill="#5a6080" />
            <rect x="32" y="22" width="36" height="12" rx="3" fill="#0a0e1a" />
            <rect x="35" y="24" width="12" height="8" rx="2" fill={isRegister ? '#00ffd5' : '#ff2d78'}>
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="53" y="24" width="12" height="8" rx="2" fill={isRegister ? '#00ffd5' : '#ff2d78'}>
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
            </rect>
            <rect x="40" y="38" width="20" height="3" fill="#0a0e1a" />
            <rect x="22" y="46" width="56" height="40" rx="6" fill="#3a3f5c" />
            <rect x="26" y="50" width="48" height="32" rx="5" fill="#5a6080" />
            <circle cx="50" cy="66" r="7" fill={isRegister ? '#00ffd5' : '#ff2d78'} opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="r" values="7;5;7" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <rect x="6" y="48" width="14" height="28" rx="4" fill="#3a3f5c" />
            <rect x="4" y="76" width="18" height="10" rx="4" fill="#5a6080" />
            <rect x="80" y="48" width="14" height="28" rx="4" fill="#3a3f5c" />
            <rect x="78" y="76" width="18" height="10" rx="4" fill="#5a6080" />
            <rect x="30" y="86" width="16" height="20" rx="4" fill="#3a3f5c" />
            <rect x="26" y="106" width="22" height="10" rx="5" fill="#5a6080" />
            <rect x="54" y="86" width="16" height="20" rx="4" fill="#3a3f5c" />
            <rect x="52" y="106" width="22" height="10" rx="5" fill="#5a6080" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="auth-title">
          {isRegister ? 'INITIALIZE BOT' : 'ENTER ARENA'}
        </h1>
        <p className="auth-subtitle">
          {isRegister
            ? 'Spawn your mech and start your evolution'
            : 'Welcome back, commander'}
        </p>

        {/* Form Card with animated gradient border */}
        <div className="auth-card-wrap">
          <div className="auth-card-border" />
          <form onSubmit={handleSubmit} className="auth-card">
            {error && (
              <div className="auth-error">
                <span style={{ fontSize: 14 }}>⚠</span> {error}
              </div>
            )}

            {/* Username */}
            <div className="auth-field">
              <label htmlFor="username" className="auth-label">
                <span className="auth-label-tag">[01]</span> Username
              </label>
              <div className="auth-input-wrap">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={isRegister ? 3 : 1}
                  maxLength={30}
                  placeholder={isRegister ? 'cool_coder_42' : 'username or email'}
                  className="auth-input"
                />
                <span className="auth-input-prefix">$</span>
              </div>
            </div>

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="email" className="auth-label">
                  <span className="auth-label-tag">[02]</span> Email
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="auth-input"
                  />
                  <span className="auth-input-prefix">@</span>
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                <span className="auth-label-tag">[{isRegister ? '03' : '02'}]</span> Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isRegister ? 6 : 1}
                  maxLength={100}
                  placeholder="••••••••"
                  className="auth-input"
                />
                <span className="auth-input-prefix">#</span>
              </div>
              {isRegister && (
                <p className="auth-hint">Min. 6 characters</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              <span className="auth-btn-glow" />
              <span className="auth-btn-text">
                {loading
                  ? '>> COMPILING...'
                  : isRegister
                  ? '>> SPAWN BOT'
                  : '>> JACK IN'}
              </span>
            </button>

            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">OR</span>
              <span className="auth-divider-line" />
            </div>

            <p className="auth-switch">
              {isRegister ? (
                <>
                  Already have a bot?{' '}
                  <Link href="/login" className="auth-link">
                    Log in →
                  </Link>
                </>
              ) : (
                <>
                  No bot yet?{' '}
                  <Link href="/register" className="auth-link">
                    Spawn one →
                  </Link>
                </>
              )}
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <span className="auth-footer-dot" />
          <span>Powered by Xiaomi MiMo V2.5 Pro</span>
        </div>
      </div>

    </div>
  );
}
