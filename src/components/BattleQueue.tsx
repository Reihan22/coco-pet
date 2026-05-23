'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface WaitingBattle {
  id: string;
  challengerId: string;
  status: string;
  createdAt: string;
  challenger: {
    id: string;
    username: string;
    pet: { name: string; level: number; stage: string } | null;
  };
}

interface ActiveBattle {
  id: string;
  challengerId: string;
  opponentId: string;
  status: string;
  createdAt: string;
  challenger: {
    id: string;
    username: string;
    pet: { name: string; level: number; stage: string } | null;
  };
  opponent: {
    id: string;
    username: string;
    pet: { name: string; level: number; stage: string } | null;
  };
}

interface HistoryBattle {
  id: string;
  challengerId: string;
  opponentId: string;
  status: string;
  winnerId: string | null;
  xpAwarded: number;
  createdAt: string;
  finishedAt: string | null;
  challenger: {
    id: string;
    username: string;
    pet: { name: string; level: number; stage: string } | null;
  };
  opponent: {
    id: string;
    username: string;
    pet: { name: string; level: number; stage: string } | null;
  };
  winner?: { id: string; username: string } | null;
}

interface FriendEntry {
  friendshipId: string;
  user: { id: string; username: string; pet?: { level: number; stage: string } | null };
}

const stageEmoji: Record<string, string> = { egg: '🥚', baby: '🐣', junior: '🧒', senior: '🦸', legend: '⭐' };

export default function BattleQueue() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState('');
  const [waiting, setWaiting] = useState<WaitingBattle[]>([]);
  const [active, setActive] = useState<ActiveBattle[]>([]);
  const [history, setHistory] = useState<HistoryBattle[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'queue' | 'active' | 'history'>('queue');
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [challenging, setChallenging] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [meRes, queueRes, histRes, friendsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/battles/queue'),
        fetch('/api/battles/list'),
        fetch('/api/friends'),
      ]);

      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setCurrentUserId(meData.user.id);

      if (queueRes.ok) {
        const qData = await queueRes.json();
        setWaiting(qData.waiting || []);
        setActive(qData.active || []);
      }

      if (histRes.ok) {
        const hData = await histRes.json();
        setHistory(hData.battles || []);
      }

      if (friendsRes.ok) {
        const fData = await friendsRes.json();
        setFriends(fData.friends || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleChallengeFriend(friendId: string) {
    setChallenging(true);
    setError('');
    try {
      const res = await fetch('/api/battles/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponentId: friendId }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowFriendPicker(false);
        router.push(`/battle/${data.battle.id}`);
      } else {
        setError(data.error || 'Failed to challenge');
      }
    } catch {
      setError('Network error');
    } finally {
      setChallenging(false);
    }
  }

  async function handleRandomMatch() {
    setChallenging(true);
    setError('');
    try {
      const res = await fetch('/api/battles/queue', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        router.push(`/battle/${data.battle.id}`);
      } else {
        setError(data.error || 'No opponents available');
      }
    } catch {
      setError('Network error');
    } finally {
      setChallenging(false);
    }
  }

  async function handleFightAI() {
    setChallenging(true);
    setError('');
    try {
      const res = await fetch('/api/battles/ai', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        router.push(`/battle/${data.battle.id}`);
      } else {
        setError(data.error || 'Failed to start AI battle');
      }
    } catch {
      setError('Network error');
    } finally {
      setChallenging(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 11, color: '#ff6b35', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          Loading battles...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowFriendPicker(!showFriendPicker)}
          disabled={challenging}
          style={{
            fontFamily: "var(--font-pixel)", fontSize: 9, padding: '10px 16px',
            border: '2px solid #ff6b35', background: 'rgba(255,107,53,0.1)',
            color: '#ff6b35', cursor: 'pointer',
          }}
        >
          ⚔️ Challenge Friend
        </button>
        <button
          onClick={handleRandomMatch}
          disabled={challenging}
          style={{
            fontFamily: "var(--font-pixel)", fontSize: 9, padding: '10px 16px',
            border: '2px solid #00ffd5', background: 'rgba(0,255,213,0.1)',
            color: '#00ffd5', cursor: 'pointer', opacity: challenging ? 0.5 : 1,
          }}
        >
          🎲 Random Match
        </button>
        <button
          onClick={handleFightAI}
          disabled={challenging}
          style={{
            fontFamily: "var(--font-pixel)", fontSize: 9, padding: '10px 16px',
            border: '2px solid #ffd700', background: 'rgba(255,215,0,0.1)',
            color: '#ffd700', cursor: 'pointer', opacity: challenging ? 0.5 : 1,
          }}
        >
          🤖 Fight AI
        </button>
      </div>

      {error && (
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 9, color: '#ff4444',
          padding: 10, marginBottom: 16, border: '1px solid #ff4444', background: 'rgba(255,68,68,0.1)',
        }}>
          {error}
        </div>
      )}

      {/* Friend Picker */}
      {showFriendPicker && (
        <div style={{
          marginBottom: 20, padding: 16, border: '2px solid #ff6b35',
          background: 'rgba(255,107,53,0.05)',
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: '#ff6b35', marginBottom: 12 }}>
            SELECT FRIEND TO CHALLENGE
          </div>
          {friends.length === 0 ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: '#666' }}>No friends yet. Add friends first!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {friends.map((f) => (
                <button
                  key={f.user.id}
                  onClick={() => handleChallengeFriend(f.user.id)}
                  disabled={challenging}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', border: '1px solid #333', background: 'rgba(255,255,255,0.03)',
                    color: '#ccc', cursor: 'pointer', fontFamily: "var(--font-pixel)", fontSize: 9,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {stageEmoji[f.user.pet?.stage || 'egg']} @{f.user.username}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", color: '#666' }}>Lv.{f.user.pet?.level || 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['queue', 'active', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: "var(--font-pixel)", fontSize: 8,
              padding: '8px 14px', border: `2px solid ${tab === t ? '#ff6b35' : '#333'}`,
              background: tab === t ? 'rgba(255,107,53,0.1)' : 'transparent',
              color: tab === t ? '#ff6b35' : '#666', cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {t === 'queue' ? '📥 Challenges' : t === 'active' ? '⚔️ Active' : '📜 History'}
            {t === 'active' && active.length > 0 && ` (${active.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'queue' && (
        <div>
          {waiting.length === 0 ? (
            <EmptyState emoji="📭" text="No pending challenges" subtext="Challenge a friend or wait for someone to challenge you" />
          ) : (
            waiting.map((b) => (
              <BattleCard
                key={b.id}
                onClick={() => router.push(`/battle/${b.id}`)}
                style={{ borderColor: '#ffd700' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: '#ffd700' }}>
                      ⏳ Challenge from @{b.challenger.username}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: '#888', marginTop: 4 }}>
                      {stageEmoji[b.challenger.pet?.stage || 'egg']} {b.challenger.pet?.name || '???'} · Lv.{b.challenger.pet?.level || 1}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-pixel)", fontSize: 8, color: '#ffd700',
                    padding: '6px 12px', border: '1px solid #ffd700',
                  }}>
                    TAP TO ACCEPT →
                  </div>
                </div>
              </BattleCard>
            ))
          )}
        </div>
      )}

      {tab === 'active' && (
        <div>
          {active.length === 0 ? (
            <EmptyState emoji="⚔️" text="No active battles" subtext="Start a battle to see it here" />
          ) : (
            active.map((b) => {
              const opponent = b.challengerId === currentUserId ? b.opponent : b.challenger;
              return (
                <BattleCard
                  key={b.id}
                  onClick={() => router.push(`/battle/${b.id}`)}
                  style={{ borderColor: '#39ff14' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: '#39ff14' }}>
                        ⚔️ vs @{opponent.username}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: '#888', marginTop: 4 }}>
                        {stageEmoji[opponent.pet?.stage || 'egg']} {opponent.pet?.name || '???'} · Lv.{opponent.pet?.level || 1}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-pixel)", fontSize: 8, color: '#39ff14',
                      padding: '6px 12px', border: '1px solid #39ff14',
                    }}>
                      CONTINUE →
                    </div>
                  </div>
                </BattleCard>
              );
            })
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <EmptyState emoji="📜" text="No battle history" subtext="Complete battles to see results here" />
          ) : (
            history.map((b) => {
              const opponent = b.challengerId === currentUserId ? b.opponent : b.challenger;
              const won = b.winnerId === currentUserId;
              const drew = !b.winnerId;
              return (
                <BattleCard
                  key={b.id}
                  onClick={() => router.push(`/battle/${b.id}`)}
                  style={{ borderColor: won ? '#39ff14' : drew ? '#ffd700' : '#ff4444', opacity: 0.8 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: won ? '#39ff14' : drew ? '#ffd700' : '#ff4444' }}>
                        {won ? '🏆 WIN' : drew ? '🤝 DRAW' : '💀 LOSS'} vs @{opponent.username}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: '#888', marginTop: 4 }}>
                        {stageEmoji[opponent.pet?.stage || 'egg']} {opponent.pet?.name} · +{won ? 50 : 20} XP
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: '#555' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </BattleCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function BattleCard({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 14, marginBottom: 8,
        border: '2px solid #333',
        background: 'rgba(255,255,255,0.02)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, background 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({ emoji, text, subtext }: { emoji: string; text: string; subtext: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: '#666', marginBottom: 6 }}>{text}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: '#555' }}>{subtext}</div>
    </div>
  );
}
