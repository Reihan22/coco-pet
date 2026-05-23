'use client';
import { useState, useEffect } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  tokenReward: number;
  status: string;
}

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  async function fetchDailyChallenge() {
    try {
      const res = await fetch('/api/challenges/daily');
      const data = await res.json();
      if (data.challenge) setChallenge(data.challenge);
    } catch (err) {
      console.error('Failed to fetch daily challenge:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!challenge || completing) return;
    setCompleting(true);
    try {
      const res = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id }),
      });
      if (res.ok) {
        setChallenge({ ...challenge, status: 'completed' });
      }
    } catch (err) {
      console.error('Failed to complete challenge:', err);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: '#00ffd5', fontFamily: 'var(--font-pixel)', fontSize: 9 }}>
        <div style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}>⚡ Loading daily challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>
        <p>No challenge available today</p>
        <button onClick={fetchDailyChallenge} className="btn-pixel btn-pixel-cyan" style={{ fontSize: 9, marginTop: 8 }}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = { easy: '#39ff14', medium: '#ffd700', hard: '#ff2d78' };
  const diffColor = difficultyColors[challenge.difficulty] || '#ffd700';

  return (
    <div style={{ background: 'rgba(0,255,213,0.04)', border: '1px solid rgba(0,255,213,0.15)', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#00ffd5', margin: 0 }}>{challenge.title}</h4>
        <span style={{ fontSize: 9, color: diffColor, fontFamily: 'var(--font-pixel)', textTransform: 'uppercase' }}>
          {challenge.difficulty}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.6, margin: '0 0 12px' }}>{challenge.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 11, color: '#ffd700' }}>⚡ +{challenge.xpReward} XP</span>
          <span style={{ fontSize: 11, color: '#b44dff' }}>🪙 +{challenge.tokenReward} tokens</span>
        </div>
        {challenge.status === 'completed' ? (
          <span style={{ fontSize: 11, color: '#39ff14', fontFamily: 'var(--font-pixel)' }}>✅ Done!</span>
        ) : (
          <button onClick={handleComplete} disabled={completing} className="btn-pixel btn-pixel-lime" style={{ fontSize: 9, opacity: completing ? 0.5 : 1 }}>
            {completing ? '...' : '✓ Complete'}
          </button>
        )}
      </div>
    </div>
  );
}
