'use client';

import { useState } from 'react';

interface ChallengeData {
  title: string;
  description: string;
  hint: string;
  solution_approach: string;
  difficulty: string;
}

interface ChallengeProps {
  level: number;
  challengesCompleted: number;
  onComplete: () => void;
}

export default function Challenge({
  level,
  challengesCompleted,
  onComplete,
}: ChallengeProps) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const getDifficulty = (): string => {
    if (level <= 10) return 'easy';
    if (level <= 25) return 'medium';
    return 'hard';
  };

  const generateChallenge = async () => {
    setIsGenerating(true);
    setChallenge(null);
    setShowHint(false);
    setIsComplete(false);
    setError('');

    try {
      const res = await fetch('/api/ai/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: getDifficulty() }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChallenge(data.challenge);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate challenge',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const completeChallenge = async () => {
    try {
      const res = await fetch('/api/challenges/complete', { method: 'POST' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setIsComplete(true);
      onComplete();
    } catch {
      setError('Failed to record completion');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "'Press Start 2P', monospace",
            padding: '4px 8px',
            background:
              level <= 10
                ? 'rgba(57,255,20,0.13)'
                : level <= 25
                  ? 'rgba(255,215,0,0.13)'
                  : 'rgba(255,45,120,0.13)',
            color:
              level <= 10 ? '#39ff14' : level <= 25 ? '#ffd700' : '#ff2d78',
            border: `1px solid ${level <= 10 ? 'rgba(57,255,20,0.27)' : level <= 25 ? 'rgba(255,215,0,0.27)' : 'rgba(255,45,120,0.27)'}`,
          }}
        >
          {getDifficulty()}
        </span>
        <span style={{ fontSize: 11, color: '#555' }}>
          Level {level} • {challengesCompleted} completed • +50 XP
        </span>
      </div>

      {/* Generate button */}
      <button
        onClick={generateChallenge}
        disabled={isGenerating}
        style={{
          padding: '12px 20px',
          fontSize: 12,
          fontFamily: "'Press Start 2P', monospace",
          background: isGenerating ? '#222' : 'rgba(0,255,213,0.13)',
          border: `2px solid ${isGenerating ? '#333' : '#00ffd5'}`,
          color: isGenerating ? '#555' : '#00ffd5',
          cursor: isGenerating ? 'wait' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {isGenerating ? '⏳ Generating...' : '🎮 Generate Challenge'}
      </button>

      {/* Challenge card */}
      {challenge && (
        <div
          style={{
            padding: 16,
            background: '#0a0a0f',
            border: '1px solid #222',
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <h3
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 13,
              color: '#00ffd5',
              marginBottom: 12,
            }}
          >
            {challenge.title}
          </h3>
          <p style={{ color: '#ddd', marginBottom: 12, whiteSpace: 'pre-wrap' }}>
            {challenge.description}
          </p>

          {/* Hint toggle */}
          <button
            onClick={() => setShowHint((v) => !v)}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#888',
              padding: '6px 12px',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
          </button>

          {showHint && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(255,215,0,0.08)',
                border: '1px solid rgba(255,215,0,0.2)',
                color: '#ffd700',
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              💡 {challenge.hint}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!isComplete ? (
              <>
                <button
                  onClick={completeChallenge}
                  style={{
                    padding: '8px 16px',
                    fontSize: 10,
                    fontFamily: "'Press Start 2P', monospace",
                    background: 'rgba(57,255,20,0.13)',
                    border: '2px solid #39ff14',
                    color: '#39ff14',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Complete (+50 XP)
                </button>
                <button
                  onClick={generateChallenge}
                  disabled={isGenerating}
                  style={{
                    padding: '8px 14px',
                    fontSize: 9,
                    fontFamily: "'Press Start 2P', monospace",
                    background: 'transparent',
                    border: '2px solid #333',
                    color: '#888',
                    cursor: 'pointer',
                  }}
                >
                  🔄 New Challenge
                </button>
              </>
            ) : (
              <div
                style={{
                  padding: '8px 16px',
                  background: 'rgba(57,255,20,0.13)',
                  border: '1px solid rgba(57,255,20,0.27)',
                  color: '#39ff14',
                  fontSize: 10,
                  fontFamily: "'Press Start 2P', monospace",
                }}
              >
                ✓ +50 XP Earned!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ color: '#ff2d78', fontSize: 12 }}>⚠ {error}</div>
      )}

      {/* Empty state */}
      {!challenge && !isGenerating && !error && (
        <div
          style={{ padding: 20, textAlign: 'center', color: '#444', fontSize: 13 }}
        >
          <p style={{ marginBottom: 8 }}>🎮 Generate a challenge to begin!</p>
          <p style={{ fontSize: 11 }}>
            Complete challenges to earn XP and level up your pet.
          </p>
        </div>
      )}
    </div>
  );
}
