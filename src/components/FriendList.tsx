'use client';

import { useState, useEffect, useCallback } from 'react';

interface FriendUser {
  id: string;
  username: string;
  pet?: { level: number; stage: string; lastFed?: string; lastPetted?: string } | null;
}

interface FriendEntry {
  friendshipId: string;
  user: FriendUser;
}

interface FriendsData {
  friends: FriendEntry[];
  received: FriendEntry[];
  sent: FriendEntry[];
}

function isOnline(pet?: FriendUser['pet']): boolean {
  if (!pet?.lastFed && !pet?.lastPetted) return false;
  const last = Math.max(
    new Date(pet.lastFed || 0).getTime(),
    new Date(pet.lastPetted || 0).getTime()
  );
  return Date.now() - last < 5 * 60 * 1000;
}

function stageEmoji(stage: string): string {
  const map: Record<string, string> = {
egg: '🔧',
  baby: '⚙️',
    teen: '🐥',
    adult: '🦅',
    legendary: '🐉',
  };
  return map[stage] || '🐣';
}

export default function FriendList() {
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addUsername, setAddUsername] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addUsername.trim()) return;
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: addUsername.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAddError(json.error || 'Failed to send request');
      } else {
        setAddSuccess('Request sent!');
        setAddUsername('');
        fetchFriends();
      }
    } catch {
      setAddError('Network error');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleAccept(userId: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/friends/${userId}/accept`, { method: 'POST' });
      if (res.ok) fetchFriends();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(userId: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/friends/${userId}`, { method: 'DELETE' });
      if (res.ok) fetchFriends();
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#00ffd5', fontFamily: "'Press Start 2P', monospace", fontSize: 12 }}>
        Loading friends...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#ff2d78', fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
        Failed to load friends
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Add Friend */}
      <div className="card-retro" style={{ padding: 20 }}>
        <h3 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 10,
          color: '#00ffd5', marginBottom: 12, letterSpacing: 1,
        }}>
          ➕ ADD FRIEND
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={addUsername}
            onChange={(e) => { setAddUsername(e.target.value); setAddError(''); setAddSuccess(''); }}
            placeholder="Enter username"
            style={{
              flex: 1, padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)', border: '2px solid #333',
              color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              outline: 'none', borderRadius: 0,
            }}
          />
          <button
            type="submit"
            disabled={addLoading}
            className="btn-pixel btn-pixel-cyan"
            style={{ fontSize: 9, padding: '10px 20px', opacity: addLoading ? 0.5 : 1 }}
          >
            {addLoading ? '...' : 'SEND'}
          </button>
        </form>
        {addError && (
          <p style={{ color: '#ff2d78', fontFamily: "'Press Start 2P', monospace", fontSize: 8, marginTop: 8 }}>
            ⚠ {addError}
          </p>
        )}
        {addSuccess && (
          <p style={{ color: '#39ff14', fontFamily: "'Press Start 2P', monospace", fontSize: 8, marginTop: 8 }}>
            ✓ {addSuccess}
          </p>
        )}
      </div>

      {/* Pending Received */}
      {data.received.length > 0 && (
        <div className="card-retro" style={{ padding: 20 }}>
          <h3 style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 10,
            color: '#ffd700', marginBottom: 16, letterSpacing: 1,
          }}>
            📨 INCOMING REQUESTS ({data.received.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.received.map((req) => (
              <div key={req.friendshipId} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'rgba(255,215,0,0.05)',
                border: '1px solid rgba(255,215,0,0.2)',
              }}>
                <div>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                    color: '#fff',
                  }}>
                    @{req.user.username}
                  </span>
                  {req.user.pet && (
                    <span style={{ fontSize: 9, color: '#888', marginLeft: 8 }}>
                      {stageEmoji(req.user.pet.stage)} Lv.{req.user.pet.level}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleAccept(req.user.id)}
                    disabled={actionLoading === req.user.id}
                    className="btn-pixel btn-pixel-lime"
                    style={{ fontSize: 8, padding: '6px 12px' }}
                  >
                    ✓ ACCEPT
                  </button>
                  <button
                    onClick={() => handleRemove(req.user.id)}
                    disabled={actionLoading === req.user.id}
                    className="btn-pixel btn-pixel-pink"
                    style={{ fontSize: 8, padding: '6px 12px' }}
                  >
                    ✕ REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Sent */}
      {data.sent.length > 0 && (
        <div className="card-retro" style={{ padding: 20 }}>
          <h3 style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 10,
            color: '#666', marginBottom: 16, letterSpacing: 1,
          }}>
            📤 SENT REQUESTS ({data.sent.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.sent.map((req) => (
              <div key={req.friendshipId} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid #222',
              }}>
                <div>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                    color: '#888',
                  }}>
                    @{req.user.username}
                  </span>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    color: '#555', marginLeft: 8,
                  }}>
                    (pending)
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(req.user.id)}
                  disabled={actionLoading === req.user.id}
                  style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    padding: '6px 12px', background: 'transparent',
                    border: '1px solid #555', color: '#888', cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="card-retro" style={{ padding: 20 }}>
        <h3 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 10,
          color: '#00ffd5', marginBottom: 16, letterSpacing: 1,
        }}>
          👥 FRIENDS ({data.friends.length})
        </h3>
        {data.friends.length === 0 ? (
          <p style={{
            textAlign: 'center', color: '#555',
            fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: 20,
          }}>
            No friends yet. Add someone above!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {data.friends.map((f) => {
              const online = isOnline(f.user.pet);
              return (
                <div key={f.friendshipId} style={{
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
                  background: online ? 'rgba(0,255,213,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${online ? 'rgba(0,255,213,0.2)' : '#222'}`,
                  transition: 'all 0.3s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Online indicator */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: online ? '#00ffd5' : '#333',
                      boxShadow: online ? '0 0 6px #00ffd5' : 'none',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                      color: online ? '#00ffd5' : '#666',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      @{f.user.username}
                    </span>
                  </div>
                  {f.user.pet && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, color: '#888' }}>
                      <span>{stageEmoji(f.user.pet.stage)}</span>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8 }}>
                        {f.user.pet.stage.toUpperCase()} · Lv.{f.user.pet.level}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button
                      onClick={() => { /* placeholder for /battle/[id] */ }}
                      className="btn-pixel btn-pixel-lime"
                      style={{ fontSize: 7, padding: '6px 10px', flex: 1 }}
                    >
                      ⚔️ CHALLENGE
                    </button>
                    <button
                      onClick={() => handleRemove(f.user.id)}
                      disabled={actionLoading === f.user.id}
                      style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                        padding: '6px 10px', background: 'transparent',
                        border: '1px solid #333', color: '#555', cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
