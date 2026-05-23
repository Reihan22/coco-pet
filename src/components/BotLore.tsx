'use client';

import { useState, useEffect } from 'react';

interface BotLoreProps {
  userId: string;
}

export default function BotLore({ userId }: BotLoreProps) {
  const [lore, setLore] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`codepet_lore_${userId}`);
      if (saved) setLore(saved);
    }
  }, [userId]);

  async function generateLore() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pet/lore', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate lore');
        return;
      }
      setLore(data.lore);
      localStorage.setItem(`codepet_lore_${userId}`, data.lore);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'rgba(18,18,26,0.6)',
      border: '1px solid rgba(180,77,255,0.2)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          color: '#b44dff',
          fontFamily: 'var(--font-pixel)',
          fontSize: 10,
          cursor: 'pointer',
        }}
      >
        <span>📜 Bot Lore</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {!lore && !loading && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                Generate AI-powered backstory for your mech
              </p>
              <button
                onClick={generateLore}
                className="btn-pixel btn-pixel-purple"
                style={{ fontSize: 9 }}
              >
                ✨ Generate Lore
              </button>
            </div>
          )}

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: 20,
              color: '#b44dff',
              fontFamily: 'var(--font-pixel)',
              fontSize: 9,
            }}>
              <div style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}>
                ⚡ Generating backstory...
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: 12,
              color: '#ff2d78',
              fontSize: 13,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {lore && !loading && (
            <>
              <div style={{
                fontSize: 13,
                color: '#e0e0e0',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                padding: '12px',
                background: 'rgba(180,77,255,0.04)',
                border: '1px solid rgba(180,77,255,0.1)',
                borderRadius: 4,
                marginBottom: 12,
              }}>
                {lore}
              </div>
              <button
                onClick={generateLore}
                className="btn-pixel btn-pixel-purple"
                style={{ fontSize: 9 }}
              >
                🔄 Regenerate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
