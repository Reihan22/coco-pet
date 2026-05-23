'use client';

import { useState } from 'react';

export default function CodeReviewPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleReview() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setReview('');
    setTokensUsed(0);

    try {
      const res = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Review failed');
        return;
      }

      setReview(data.review);
      setTokensUsed(data.tokens_used || 0);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'go',
    'rust', 'c', 'cpp', 'csharp', 'ruby', 'php', 'swift',
    'kotlin', 'sql', 'html', 'css', 'shell',
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '80px 20px 40px', maxWidth: 900, margin: '0 auto' }}>
      {/* Background orbs */}
      <div className="bg-orb bg-orb--cyan" />
      <div className="bg-orb bg-orb--pink" />

      <h1 style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: 'clamp(14px, 2.5vw, 22px)',
        color: '#00ffd5',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        🔍 Code Review
      </h1>
      <p style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: 9,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 2,
      }}>
        AI-powered code review by Xiaomi MiMo V2.5 Pro
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: '#12121a',
            color: '#00ffd5',
            border: '1px solid rgba(0,255,213,0.3)',
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            borderRadius: 4,
          }}
        >
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: 280,
          background: '#0a0a0f',
          color: '#e0e0e0',
          border: '1px solid rgba(0,255,213,0.2)',
          padding: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          lineHeight: 1.6,
          borderRadius: 4,
          resize: 'vertical',
          outline: 'none',
        }}
      />

      <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <button
          onClick={handleReview}
          disabled={loading || !code.trim()}
          className="btn-pixel"
          style={{
            opacity: loading || !code.trim() ? 0.4 : 1,
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Reviewing...' : '🔍 Review with MiMo'}
        </button>
        {tokensUsed > 0 && (
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 9,
            color: '#ffd700',
            padding: '4px 12px',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 3,
          }}>
            ⚡ {tokensUsed.toLocaleString()} tokens
          </span>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: 'rgba(255,45,120,0.1)',
          border: '1px solid rgba(255,45,120,0.3)',
          color: '#ff2d78',
          borderRadius: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {review && (
        <div style={{
          marginTop: 24,
          padding: 20,
          background: '#12121a',
          border: '1px solid rgba(0,255,213,0.2)',
          borderRadius: 6,
          maxHeight: 500,
          overflowY: 'auto',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 11,
            color: '#00ffd5',
            marginBottom: 16,
          }}>
            ⚡ MiMo Review
          </h3>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: '#e0e0e0',
            lineHeight: 1.7,
            margin: 0,
          }}>
            {review}
          </pre>
        </div>
      )}
    </div>
  );
}
