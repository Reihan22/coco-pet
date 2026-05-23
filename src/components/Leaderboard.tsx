'use client';

import { useState, useEffect, useCallback } from 'react';

type Tab = 'players' | 'guilds' | 'battles';

interface PlayerEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
  stage: string;
  petName: string;
}

interface GuildEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  memberCount: number;
  leader: string;
  description: string | null;
}

interface BattleEntry {
  rank: number;
  username: string;
  wins: number;
  level: number;
  stage: string;
}

const STAGE_EMOJI: Record<string, string> = {
  egg: '🔧',
  baby: '⚙️',
  junior: '🛡️',
  senior: '🤖',
  legend: '⭐',
};

const STAGE_LABELS: Record<string, string> = {
  egg: 'Frame',
  baby: 'Chassis',
  junior: 'Armor',
  senior: 'Full Mech',
  legend: 'Legend',
};

const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];

interface LeaderboardProps {
  currentUsername?: string;
}

export default function Leaderboard({ currentUsername }: LeaderboardProps) {
  const [tab, setTab] = useState<Tab>('players');
  const [players, setPlayers] = useState<PlayerEntry[]>([]);
  const [guilds, setGuilds] = useState<GuildEntry[]>([]);
  const [battles, setBattles] = useState<BattleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [playersRes, guildsRes, battlesRes] = await Promise.all([
        fetch('/api/leaderboard/global'),
        fetch('/api/leaderboard/guilds'),
        fetch('/api/leaderboard/battles'),
      ]);

      if (playersRes.ok) {
        const data = await playersRes.json();
        setPlayers(data.leaderboard || []);
      }
      if (guildsRes.ok) {
        const data = await guildsRes.json();
        setGuilds(data.leaderboard || []);
      }
      if (battlesRes.ok) {
        const data = await battlesRes.json();
        setBattles(data.leaderboard || []);
      }
    } catch {
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'players', label: 'Players', icon: '🏆' },
    { key: 'guilds', label: 'Guilds', icon: '⚔️' },
    { key: 'battles', label: 'Duels', icon: '🥊' },
  ];

  return (
    <div>
      {/* Tab bar + Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                padding: '10px 16px',
                border: tab === t.key ? '2px solid #ffd700' : '2px solid #333',
                background: tab === t.key ? 'rgba(255,215,0,0.1)' : 'transparent',
                color: tab === t.key ? '#ffd700' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            padding: '8px 14px',
            border: '2px solid #00ffd5',
            background: 'transparent',
            color: '#00ffd5',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.5 : 1,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(255,45,120,0.1)',
          border: '1px solid rgba(255,45,120,0.3)',
          padding: '12px 16px',
          color: '#ff2d78',
          fontSize: 12,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13 }}>
          Loading leaderboard...
        </div>
      )}

      {/* Players tab */}
      {!loading && tab === 'players' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {players.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13 }}>
              No players yet. Be the first!
            </div>
          )}
          {players.map((entry) => {
            const isUser = entry.username === currentUsername;
            const emoji = STAGE_EMOJI[entry.stage] || '🥚';
            const maxXP = players[0]?.xp || 1;
            const xpPct = Math.round((entry.xp / maxXP) * 100);

            return (
              <div
                key={entry.username}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: isUser ? 'rgba(0,255,213,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isUser ? '1px solid rgba(0,255,213,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: entry.rank <= 3 ? 14 : 10,
                  color: entry.rank <= 3 ? rankColors[entry.rank - 1] : '#555',
                  width: 28,
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>

                <span style={{
                  fontSize: 12,
                  color: isUser ? '#00ffd5' : '#ccc',
                  fontWeight: isUser ? 600 : 400,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entry.petName}
                  {isUser && (
                    <span style={{ fontSize: 9, color: '#666', marginLeft: 6 }}>← YOU</span>
                  )}
                </span>

                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: '#ffd700',
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  LV.{entry.level}
                </span>

                <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>

                <div style={{
                  width: 60, height: 6, background: '#1a1a2e', borderRadius: 3,
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${xpPct}%`,
                    background: isUser
                      ? 'linear-gradient(90deg, #00ffd5, #39ff14)'
                      : 'linear-gradient(90deg, #444, #666)',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guilds tab */}
      {!loading && tab === 'guilds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {guilds.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13 }}>
              No guilds yet. Create the first one!
            </div>
          )}
          {guilds.map((entry) => {
            const maxXP = guilds[0]?.xp || 1;
            const xpPct = Math.round((entry.xp / maxXP) * 100);

            return (
              <div
                key={entry.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid transparent',
                }}
              >
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: entry.rank <= 3 ? 14 : 10,
                  color: entry.rank <= 3 ? rankColors[entry.rank - 1] : '#555',
                  width: 28,
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>

                <span style={{
                  fontSize: 12,
                  color: '#ccc',
                  fontWeight: 600,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  ⚔️ {entry.name}
                </span>

                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 7,
                  color: '#b44dff',
                  background: 'rgba(180,77,255,0.1)',
                  border: '1px solid rgba(180,77,255,0.2)',
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  👥 {entry.memberCount}
                </span>

                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: '#ffd700',
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  LV.{entry.level}
                </span>

                <div style={{
                  width: 60, height: 6, background: '#1a1a2e', borderRadius: 3,
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${xpPct}%`,
                    background: 'linear-gradient(90deg, #b44dff, #ff2d78)',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Battles tab */}
      {!loading && tab === 'battles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {battles.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13 }}>
              No battles yet. Challenge someone!
            </div>
          )}
          {battles.map((entry) => {
            const isUser = entry.username === currentUsername;
            const emoji = STAGE_EMOJI[entry.stage] || '🥚';
            const maxWins = battles[0]?.wins || 1;
            const winPct = Math.round((entry.wins / maxWins) * 100);

            return (
              <div
                key={entry.username}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: isUser ? 'rgba(0,255,213,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isUser ? '1px solid rgba(0,255,213,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: entry.rank <= 3 ? 14 : 10,
                  color: entry.rank <= 3 ? rankColors[entry.rank - 1] : '#555',
                  width: 28,
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>

                <span style={{
                  fontSize: 12,
                  color: isUser ? '#00ffd5' : '#ccc',
                  fontWeight: isUser ? 600 : 400,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entry.username}
                  {isUser && (
                    <span style={{ fontSize: 9, color: '#666', marginLeft: 6 }}>← YOU</span>
                  )}
                </span>

                <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>

                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: '#ff2d78',
                  background: 'rgba(255,45,120,0.1)',
                  border: '1px solid rgba(255,45,120,0.2)',
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  🏆 {entry.wins}
                </span>

                <div style={{
                  width: 60, height: 6, background: '#1a1a2e', borderRadius: 3,
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{
                    height: '100%',
                    width: `${winPct}%`,
                    background: 'linear-gradient(90deg, #ff2d78, #ffd700)',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
