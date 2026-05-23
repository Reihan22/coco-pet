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

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }
        .auth-orb {
          position: fixed;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(60px);
        }
        .auth-orb-cyan {
          top: -25%;
          left: -15%;
          background: radial-gradient(circle, rgba(0,255,213,0.18) 0%, transparent 60%);
          animation: orb-drift-1 14s ease-in-out infinite;
        }
        .auth-orb-pink {
          bottom: -25%;
          right: -15%;
          background: radial-gradient(circle, rgba(255,45,120,0.18) 0%, transparent 60%);
          animation: orb-drift-2 18s ease-in-out infinite;
        }
        @keyframes orb-drift-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,30px) scale(1.1); }
        }
        @keyframes orb-drift-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px,-30px) scale(1.1); }
        }
        .auth-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,213,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,213,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .auth-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .auth-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          top: -10px;
          animation: particle-fall linear infinite;
        }
        .auth-particle--cyan { background: #00ffd5; box-shadow: 0 0 8px #00ffd5; }
        .auth-particle--pink { background: #ff2d78; box-shadow: 0 0 8px #ff2d78; }
        .auth-particle--lime { background: #76ff03; box-shadow: 0 0 8px #76ff03; }
        @keyframes particle-fall {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(110vh); opacity: 0; }
        }

        .auth-shell {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 2;
        }
        .auth-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          margin-bottom: 24px;
          transition: transform 0.2s;
        }
        .auth-brand:hover { transform: translateY(-1px); }
        .auth-brand-icon { font-size: 22px; }
        .auth-brand-text {
          font-family: var(--font-pixel), monospace;
          font-size: 12px;
          color: #00ffd5;
          text-shadow: 0 0 10px rgba(0,255,213,0.5);
        }

        .auth-mech-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .auth-mech-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,213,0.2) 0%, transparent 65%);
          animation: mech-pulse 3s ease-in-out infinite;
        }
        @keyframes mech-pulse {
          0%,100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .auth-mech-svg {
          position: relative;
          z-index: 1;
          animation: mech-bounce 2.4s ease-in-out infinite;
          filter: drop-shadow(0 4px 12px rgba(0,255,213,0.3));
        }
        @keyframes mech-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .auth-title {
          font-family: var(--font-pixel), monospace;
          font-size: 18px;
          text-align: center;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #00ffd5, #b44dff, #ff2d78);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: title-shift 6s ease infinite;
          letter-spacing: 2px;
        }
        @keyframes title-shift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .auth-subtitle {
          font-family: var(--font-pixel), monospace;
          font-size: 8px;
          color: #888;
          text-align: center;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .auth-card-wrap {
          position: relative;
          border-radius: 14px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(0,255,213,0.4), rgba(180,77,255,0.4), rgba(255,45,120,0.4));
          background-size: 200% 200%;
          animation: border-shift 8s ease infinite;
        }
        @keyframes border-shift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .auth-card-border {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #00ffd5, #b44dff, #ff2d78);
          opacity: 0.4;
          filter: blur(20px);
          animation: border-shift 8s ease infinite;
          z-index: -1;
        }
        .auth-card {
          background: rgba(10,10,15,0.92);
          backdrop-filter: blur(12px);
          border-radius: 13px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-error {
          background: rgba(255,45,120,0.1);
          border: 1px solid rgba(255,45,120,0.4);
          color: #ff8fab;
          padding: 10px 14px;
          border-radius: 8px;
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .auth-field { display: flex; flex-direction: column; }
        .auth-label {
          font-family: var(--font-pixel), monospace;
          font-size: 8px;
          color: #aaa;
          margin-bottom: 6px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .auth-label-tag { color: #00ffd5; opacity: 0.7; }
        .auth-input-wrap { position: relative; }
        .auth-input-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #00ffd5;
          font-family: var(--font-mono), monospace;
          font-size: 14px;
          opacity: 0.6;
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(0,255,213,0.15);
          border-radius: 8px;
          padding: 12px 14px 12px 32px;
          color: #f0f0f0;
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        .auth-input::placeholder { color: #555; }
        .auth-input:focus {
          border-color: #00ffd5;
          box-shadow: 0 0 0 3px rgba(0,255,213,0.1), inset 0 0 12px rgba(0,255,213,0.05);
          background: rgba(0,255,213,0.03);
        }
        .auth-hint {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #555;
          margin-top: 4px;
        }

        .auth-btn {
          position: relative;
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #00ffd5 0%, #00c9a7 100%);
          color: #000;
          font-family: var(--font-pixel), monospace;
          font-size: 11px;
          letter-spacing: 2px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: 0 0 0 1px rgba(0,255,213,0.3), 0 4px 20px rgba(0,255,213,0.25);
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(0,255,213,0.5), 0 6px 28px rgba(0,255,213,0.4);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-btn-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          animation: btn-shine 3s ease-in-out infinite;
        }
        @keyframes btn-shine {
          0%,60% { transform: translateX(-100%); }
          80%,100% { transform: translateX(100%); }
        }
        .auth-btn-text { position: relative; z-index: 1; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,213,0.2), transparent);
        }
        .auth-divider-text {
          font-family: var(--font-pixel), monospace;
          font-size: 8px;
          color: #555;
          letter-spacing: 2px;
        }
        .auth-switch {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .auth-link {
          color: #00ffd5;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s, text-shadow 0.2s;
        }
        .auth-link:hover {
          color: #80ffe6;
          text-shadow: 0 0 8px rgba(0,255,213,0.6);
        }

        .auth-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          color: #444;
        }
        .auth-footer-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00ffd5;
          box-shadow: 0 0 8px #00ffd5;
          animation: dot-pulse 2s ease-in-out infinite;
        }
        @keyframes dot-pulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
