'use client';

import { useState, useEffect, useCallback } from 'react';

interface GuildData {
  id: string;
  name: string;
  description: string | null;
  level: number;
  xp: number;
  memberCount: number;
  leader: { id: string; username: string };
}

export default function GuildList() {
  const [guilds, setGuilds] = useState<GuildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const fetchGuilds = useCallback(async () => {
    try {
      const res = await fetch('/api/guilds');
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const res = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, description: createDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create guild');
      } else {
        setShowCreate(false);
        setCreateName('');
        setCreateDesc('');
        fetchGuilds();
      }
    } catch {
      setCreateError('Network error');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin(guildId: string) {
    setJoinLoading(guildId);
    setJoinMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setJoinMsg({ id: guildId, text: 'Joined!', ok: true });
        fetchGuilds();
      } else {
        setJoinMsg({ id: guildId, text: data.error || 'Failed', ok: false });
      }
    } catch {
      setJoinMsg({ id: guildId, text: 'Network error', ok: false });
    } finally {
      setJoinLoading(null);
    }
  }

  const filtered = guilds.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#b44dff', fontFamily: "'Press Start 2P', monospace", fontSize: 12 }}>
        Loading guilds...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Search + Create */}
      <div className="card-retro" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guilds..."
            style={{
              flex: 1, minWidth: 200, padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)', border: '2px solid #333',
              color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              outline: 'none', borderRadius: 0,
            }}
          />
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              padding: '10px 20px', cursor: 'pointer',
              background: showCreate ? 'rgba(180,77,255,0.2)' : 'rgba(180,77,255,0.1)',
              border: '2px solid #b44dff', color: '#b44dff',
            }}
          >
            🏰 CREATE SQUAD
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ffd700', marginBottom: 4 }}>
              ⚠ Costs 500 XP from your bot
            </p>
            <input
              type="text"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              placeholder="Squad name (2-50 chars)"
              maxLength={50}
              required
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '2px solid #333',
                color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                outline: 'none', borderRadius: 0,
              }}
            />
            <input
              type="text"
              value={createDesc}
              onChange={e => setCreateDesc(e.target.value)}
              placeholder="Description (optional, max 500 chars)"
              maxLength={500}
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '2px solid #333',
                color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                outline: 'none', borderRadius: 0,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={createLoading}
                style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  padding: '10px 20px', cursor: 'pointer',
                  background: 'rgba(180,77,255,0.2)', border: '2px solid #b44dff',
                  color: '#b44dff', opacity: createLoading ? 0.5 : 1,
                }}
              >
                {createLoading ? '...' : 'CREATE'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                  padding: '10px 20px', cursor: 'pointer',
                  background: 'transparent', border: '2px solid #333', color: '#666',
                }}
              >
                CANCEL
              </button>
            </div>
            {createError && (
              <p style={{ color: '#ff2d78', fontFamily: "'Press Start 2P', monospace", fontSize: 8 }}>
                ⚠ {createError}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Guild Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', color: '#555',
          fontFamily: "'Press Start 2P', monospace", fontSize: 10, padding: 40,
        }}>
          {search ? 'No guilds match your search' : 'No guilds yet. Be the first to create one!'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(guild => (
            <div key={guild.id} className="card-retro" style={{
              padding: 20,
              background: 'rgba(180,77,255,0.03)',
              borderColor: 'rgba(180,77,255,0.15)',
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                  color: '#b44dff', margin: 0, wordBreak: 'break-word',
                }}>
                  {guild.name}
                </h3>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  color: '#ffd700', background: 'rgba(255,215,0,0.1)',
                  padding: '4px 8px', border: '1px solid rgba(255,215,0,0.3)',
                  whiteSpace: 'nowrap',
                }}>
                  Lv.{guild.level}
                </span>
              </div>

              {guild.description && (
                <p style={{ fontSize: 9, color: '#888', margin: '8px 0', lineHeight: 1.5 }}>
                  {guild.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 9, color: '#666' }}>
                <span>👑 {guild.leader.username}</span>
                <span>👥 {guild.memberCount}/50</span>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <a
                  href={`/guild/${guild.id}`}
                  style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    padding: '6px 12px', textDecoration: 'none',
                    background: 'transparent', border: '1px solid #b44dff',
                    color: '#b44dff', cursor: 'pointer',
                  }}
                >
                  VIEW
                </a>
                <button
                  onClick={() => handleJoin(guild.id)}
                  disabled={joinLoading === guild.id}
                  style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    padding: '6px 12px', cursor: 'pointer',
                    background: 'rgba(180,77,255,0.15)', border: '1px solid #b44dff',
                    color: '#b44dff', opacity: joinLoading === guild.id ? 0.5 : 1,
                  }}
                >
                  {joinLoading === guild.id ? '...' : 'JOIN'}
                </button>
              </div>

              {joinMsg && joinMsg.id === guild.id && (
                <p style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                  marginTop: 8, color: joinMsg.ok ? '#39ff14' : '#ff2d78',
                }}>
                  {joinMsg.ok ? '✓' : '⚠'} {joinMsg.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
