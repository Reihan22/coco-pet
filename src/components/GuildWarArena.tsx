'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface WarGuild {
  id: string;
  name: string;
  level?: number;
}

interface MatchResult {
  matchIndex: number;
  champion1: { userId: string; username: string; level: number; stage: string };
  champion2: { userId: string; username: string; level: number; stage: string };
  winner: number;
  champion1RemainingHp: number;
  champion2RemainingHp: number;
  rounds: Array<{ round: number; dmg1to2: number; dmg2to1: number; hp1: number; hp2: number }>;
}

interface WarData {
  id: string;
  guild1Id: string;
  guild2Id: string;
  status: string;
  champions1: string[];
  champions2: string[];
  battles: MatchResult[];
  score1: number;
  score2: number;
  bestOf: number;
  winnerGuildId: string | null;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  guild1: WarGuild;
  guild2: WarGuild;
  winnerGuild?: WarGuild | null;
}

export default function GuildWarArena({ warId }: { warId: string }) {
  const [war, setWar] = useState<WarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);

  const fetchWar = useCallback(async () => {
    try {
      const res = await fetch(`/api/guild-wars/${warId}`);
      if (res.ok) {
        const data = await res.json();
        setWar(data.war);
      } else {
        setError('War not found');
      }
    } catch {
      setError('Failed to load war');
    } finally {
      setLoading(false);
    }
  }, [warId]);

  useEffect(() => { fetchWar(); }, [fetchWar]);

  async function handleAction(action: string, body?: Record<string, unknown>) {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/guild-wars/${warId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchWar();
      } else {
        setError(data.error || 'Action failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResolveMatch(matchIndex: number) {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/guild-wars/${warId}/battle/${matchIndex}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        await fetchWar();
      } else {
        setError(data.error || 'Battle failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ff6b35', fontFamily: "'Press Start 2P', monospace", fontSize: 12 }}>
        Loading war...
      </div>
    );
  }

  if (error && !war) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ff2d78', fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
        {error}
      </div>
    );
  }

  if (!war) return null;

  const battles = war.battles || [];
  const nextMatch = battles.length;
  const canResolve = war.status === 'active' && nextMatch < war.bestOf;
  const isFinished = war.status === 'finished';
  const isCancelled = war.status === 'cancelled';

  const stageEmoji: Record<string, string> = { egg: '🔧', baby: '⚙️', junior: '🛡️', senior: '🤖', legend: '⭐' };

  function statusColor(s: string) {
    if (s === 'active') return '#39ff14';
    if (s === 'finished') return '#ffd700';
    if (s === 'cancelled') return '#ff2d78';
    return '#ff6b35';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* War Header */}
      <div className="card-retro" style={{ padding: 24, background: 'rgba(255,107,53,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#666', marginBottom: 8 }}>
              GUILD WAR • Best of {war.bestOf}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#00ffd5' }}>
                {war.guild1.name}
              </span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: '#ff6b35' }}>
                VS
              </span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#ff6b35' }}>
                {war.guild2.name}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              color: statusColor(war.status), marginBottom: 4,
            }}>
              {war.status.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: '#fff' }}>
              {war.score1} — {war.score2}
            </div>
          </div>
        </div>

        {/* Winner banner */}
        {isFinished && war.winnerGuild && (
          <div style={{
            marginTop: 16, padding: 12,
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            textAlign: 'center',
            fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#ffd700',
          }}>
            🏆 {war.winnerGuild.name} WINS!
          </div>
        )}

        {/* Schedule info */}
        <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#555' }}>
          Scheduled: {new Date(war.scheduledAt).toLocaleString()}
          {war.startedAt && ` • Started: ${new Date(war.startedAt).toLocaleString()}`}
          {war.finishedAt && ` • Finished: ${new Date(war.finishedAt).toLocaleString()}`}
        </div>
      </div>

      {error && (
        <div style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ff2d78', textAlign: 'center', padding: 8,
          border: '1px solid #ff2d78', background: 'rgba(255,45,120,0.1)',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Action buttons */}
      {war.status === 'scheduled' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleAction('start')}
            disabled={actionLoading}
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: '10px 20px',
              border: '2px solid #39ff14', background: 'rgba(57,255,20,0.1)',
              color: '#39ff14', cursor: 'pointer', opacity: actionLoading ? 0.5 : 1,
            }}
          >
            ▶️ START WAR
          </button>
          <button
            onClick={() => handleAction('cancel')}
            disabled={actionLoading}
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: '10px 20px',
              border: '2px solid #ff2d78', background: 'transparent',
              color: '#ff2d78', cursor: 'pointer', opacity: actionLoading ? 0.5 : 1,
            }}
          >
            ✕ CANCEL
          </button>
        </div>
      )}

      {/* Match bracket / list */}
      <div className="card-retro" style={{ padding: 20 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#ff6b35', marginBottom: 16 }}>
          ⚔️ MATCHES
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid #333', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(battles.length / war.bestOf) * 100}%`,
              background: 'linear-gradient(90deg, #ff6b35, #ff2d78)',
              transition: 'width 0.5s',
            }} />
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#555', marginTop: 4, textAlign: 'right' }}>
            {battles.length}/{war.bestOf} matches
          </div>
        </div>

        {/* Match slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: war.bestOf }).map((_, i) => {
            const match = battles[i];
            const isExpanded = expandedMatch === i;

            if (!match) {
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', border: '1px solid #222',
                  background: canResolve && i === nextMatch ? 'rgba(255,107,53,0.05)' : 'transparent',
                }}>
                  <div>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#444' }}>
                      MATCH {i + 1}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#333', marginLeft: 12 }}>
                      Pending...
                    </span>
                  </div>
                  {canResolve && i === nextMatch && (
                    <button
                      onClick={() => handleResolveMatch(i)}
                      disabled={actionLoading}
                      style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 8, padding: '6px 14px',
                        border: '2px solid #ff6b35', background: 'rgba(255,107,53,0.1)',
                        color: '#ff6b35', cursor: 'pointer', opacity: actionLoading ? 0.5 : 1,
                      }}
                    >
                      ⚔️ RESOLVE
                    </button>
                  )}
                </div>
              );
            }

            const c1Name = match.champion1.username;
            const c2Name = match.champion2.username;
            const winnerName = match.winner === 1 ? c1Name : c2Name;
            const winnerColor = match.winner === 1 ? '#00ffd5' : '#ff6b35';

            return (
              <div key={i}>
                <button
                  onClick={() => setExpandedMatch(isExpanded ? null : i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', border: '1px solid #333', width: '100%',
                    background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#666' }}>
                      MATCH {i + 1}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00ffd5' }}>
                      {stageEmoji[match.champion1.stage] || '🐣'} {c1Name} Lv.{match.champion1.level}
                    </span>
                    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#444' }}>vs</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#ff6b35' }}>
                      {stageEmoji[match.champion2.stage] || '🐣'} {c2Name} Lv.{match.champion2.level}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: winnerColor }}>
                    🏆 {winnerName}
                  </span>
                </button>

                {isExpanded && (
                  <div style={{
                    padding: '12px 16px', border: '1px solid #222', borderTop: 'none',
                    background: 'rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#00ffd5' }}>
                        {c1Name}: {match.champion1RemainingHp} HP left
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#ff6b35' }}>
                        {c2Name}: {match.champion2RemainingHp} HP left
                      </span>
                    </div>
                    {match.rounds?.map((r, ri) => (
                      <div key={ri} style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#555',
                        padding: '2px 0',
                      }}>
                        R{r.round}: {c1Name} -{r.dmg2to1}HP | {c2Name} -{r.dmg1to2}HP → {r.hp1} vs {r.hp2}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Champions overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card-retro" style={{ padding: 16 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#00ffd5', marginBottom: 8 }}>
            {war.guild1.name} CHAMPIONS
          </div>
          {(war.champions1 as string[]).map((uid, i) => {
            const match = battles.find(m => m.champion1.userId === uid);
            return (
              <div key={uid} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#888', padding: '4px 0' }}>
                {match ? `${stageEmoji[match.champion1.stage] || '🐣'} ${match.champion1.username} Lv.${match.champion1.level}` : `#${i + 1} ${uid.slice(0, 8)}...`}
              </div>
            );
          })}
        </div>
        <div className="card-retro" style={{ padding: 16 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ff6b35', marginBottom: 8 }}>
            {war.guild2.name} CHAMPIONS
          </div>
          {(war.champions2 as string[]).length === 0 ? (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#444', fontStyle: 'italic' }}>
              Not set yet
            </div>
          ) : (
            (war.champions2 as string[]).map((uid, i) => {
              const match = battles.find(m => m.champion2.userId === uid);
              return (
                <div key={uid} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#888', padding: '4px 0' }}>
                  {match ? `${stageEmoji[match.champion2.stage] || '🐣'} ${match.champion2.username} Lv.${match.champion2.level}` : `#${i + 1} ${uid.slice(0, 8)}...`}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Back link */}
      <Link href="/guild-wars" style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        color: '#666', textDecoration: 'none', textAlign: 'center',
      }}>
        ← BACK TO SQUAD WARS
      </Link>
    </div>
  );
}
