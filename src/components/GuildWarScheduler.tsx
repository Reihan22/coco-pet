'use client';

import { useState, useEffect, useCallback } from 'react';

interface Champion {
  userId: string;
  username: string;
  role: string;
  level: number;
  stage: string;
}

interface GuildOption {
  id: string;
  name: string;
  level: number;
}

export default function GuildWarScheduler({ onCreated }: { onCreated?: () => void }) {
  const [guilds, setGuilds] = useState<GuildOption[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedChampions, setSelectedChampions] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [bestOf, setBestOf] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [guildsRes, champsRes] = await Promise.all([
        fetch('/api/guilds'),
        fetch('/api/guild-wars/champions'),
      ]);

      if (guildsRes.ok) {
        const data = await guildsRes.json();
        setGuilds(data.guilds.map((g: { id: string; name: string; level: number }) => ({ id: g.id, name: g.name, level: g.level })));
      }
      if (champsRes.ok) {
        const data = await champsRes.json();
        setChampions(data.champions);
      }
    } catch {
      setError('Failed to load data');
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function toggleChampion(userId: string) {
    setSelectedChampions(prev => {
      if (prev.includes(userId)) return prev.filter(id => id !== userId);
      if (prev.length >= bestOf) return prev;
      return [...prev, userId];
    });
  }

  async function handleSubmit() {
    if (!selectedGuild || selectedChampions.length < 1 || !scheduledAt) {
      setError('Fill all fields and pick at least 1 champion');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/guild-wars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defenderGuildId: selectedGuild,
          scheduledAt: new Date(scheduledAt).toISOString(),
          champions: selectedChampions,
          bestOf,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`War scheduled! ID: ${data.war.id}`);
        setSelectedGuild('');
        setSelectedChampions([]);
        setScheduledAt('');
        onCreated?.();
      } else {
        setError(data.error || 'Failed to create war');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const stageEmoji: Record<string, string> = { egg: '🥚', baby: '🐣', junior: '🧒', senior: '🦸', legend: '⭐' };

  return (
    <div className="card-retro" style={{ padding: 24 }}>
      <h3 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#ff6b35', marginBottom: 20 }}>
        ⚔️ SCHEDULE GUILD WAR
      </h3>

      {/* Defender guild */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', display: 'block', marginBottom: 6 }}>
          OPPONENT GUILD
        </label>
        <select
          value={selectedGuild}
          onChange={e => setSelectedGuild(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            background: '#111', border: '1px solid #333', color: '#fff',
          }}
        >
          <option value="">Select guild...</option>
          {guilds.map(g => (
            <option key={g.id} value={g.id}>{g.name} (Lv.{g.level})</option>
          ))}
        </select>
      </div>

      {/* Best of */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', display: 'block', marginBottom: 6 }}>
          BEST OF
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[3, 5].map(n => (
            <button
              key={n}
              onClick={() => { setBestOf(n); setSelectedChampions(prev => prev.slice(0, n)); }}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: '8px 16px',
                border: `2px solid ${bestOf === n ? '#ff6b35' : '#333'}`,
                background: bestOf === n ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: bestOf === n ? '#ff6b35' : '#666', cursor: 'pointer',
              }}
            >
              Bo{n}
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled time */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', display: 'block', marginBottom: 6 }}>
          SCHEDULED TIME
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            background: '#111', border: '1px solid #333', color: '#fff',
          }}
        />
      </div>

      {/* Champion selection */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', display: 'block', marginBottom: 6 }}>
          CHAMPIONS ({selectedChampions.length}/{bestOf})
        </label>
        {champions.length === 0 ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#555', padding: 12 }}>
            No eligible members found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
            {champions.map(c => {
              const selected = selectedChampions.includes(c.userId);
              return (
                <button
                  key={c.userId}
                  onClick={() => toggleChampion(c.userId)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', cursor: 'pointer',
                    border: `1px solid ${selected ? '#ff6b35' : '#222'}`,
                    background: selected ? 'rgba(255,107,53,0.1)' : 'transparent',
                    color: selected ? '#ff6b35' : '#888', textAlign: 'left',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  }}
                >
                  <span>
                    {stageEmoji[c.stage] || '🐣'} {c.username} — Lv.{c.level} {c.role !== 'member' && `(${c.role})`}
                  </span>
                  {selected && <span style={{ color: '#39ff14' }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ff2d78', marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}
      {success && (
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#39ff14', marginBottom: 12 }}>
          ✓ {success}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 10, padding: '12px 24px', width: '100%',
          border: '2px solid #ff6b35', background: 'rgba(255,107,53,0.1)', color: '#ff6b35',
          cursor: 'pointer', opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'CREATING...' : '⚔️ DECLARE WAR'}
      </button>
    </div>
  );
}
