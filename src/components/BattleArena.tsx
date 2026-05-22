'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { calculateStats } from '@/lib/pet';
import PixelPet from '@/components/PixelPet';

interface BattlePet {
  name: string;
  level: number;
  stage: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

interface BattleUser {
  id: string;
  username: string;
  pet: BattlePet | null;
}

interface BattleEvent {
  actor: string;
  action: string;
  damage?: number;
  selfDamage?: number;
  success?: boolean;
  message: string;
  critical?: boolean;
}

interface TurnRecord {
  turn: number;
  challengerAction: string;
  opponentAction: string;
  events: BattleEvent[];
  challengerState: { currentHp: number; maxHp: number; defending: boolean };
  opponentState: { currentHp: number; maxHp: number; defending: boolean };
  ended?: boolean;
}

interface BattleData {
  id: string;
  challengerId: string;
  opponentId: string;
  status: string;
  winnerId: string | null;
  turns: TurnRecord[];
  xpAwarded: number;
  createdAt: string;
  finishedAt: string | null;
  challenger: BattleUser;
  opponent: BattleUser;
  winner?: { id: string; username: string } | null;
}

export default function BattleArena({ battleId }: { battleId: string }) {
  const router = useRouter();
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBattle = useCallback(async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setCurrentUserId(meData.user.id);

      const res = await fetch(`/api/battles/${battleId}`);
      if (!res.ok) {
        setError('Battle not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBattle(data.battle);

      if (data.battle.status === 'finished') {
        setShowVictory(true);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch {
      setError('Failed to load battle');
    } finally {
      setLoading(false);
    }
  }, [battleId, router]);

  useEffect(() => {
    fetchBattle();

    // Poll during active battle
    pollRef.current = setInterval(() => {
      fetchBattle();
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchBattle]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle?.turns]);

  async function handleAction(action: string) {
    if (actionLoading || !battle || battle.status !== 'active') return;
    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/battles/${battleId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Action failed');
        setActionLoading(false);
        return;
      }

      // Refresh battle
      await fetchBattle();
    } catch {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    if (!battle) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/battles/${battleId}/accept`, { method: 'POST' });
      if (res.ok) {
        await fetchBattle();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to accept');
      }
    } catch {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#ff6b35', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          ⚔️ Loading Battle...
        </div>
      </div>
    );
  }

  if (error && !battle) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ff4444', fontFamily: "'Press Start 2P', monospace", fontSize: 11 }}>
        {error}
      </div>
    );
  }

  if (!battle) return null;

  const isChallenger = currentUserId === battle.challengerId;
  const myRole = isChallenger ? 'challenger' : 'opponent';
  const myUser = isChallenger ? battle.challenger : battle.opponent;
  const oppUser = isChallenger ? battle.opponent : battle.challenger;
  const turns = (battle.turns || []) as TurnRecord[];
  const lastTurn = turns[turns.length - 1];

  // Get current HP states
  let myHp = myUser.pet ? calculateStats(myUser.pet.level, myUser.pet.stage).hp : 0;
  let oppHp = oppUser.pet ? calculateStats(oppUser.pet.level, oppUser.pet.stage).hp : 0;
  let myMaxHp = myHp;
  let oppMaxHp = oppHp;

  if (lastTurn) {
    if (isChallenger) {
      myHp = lastTurn.challengerState.currentHp;
      myMaxHp = lastTurn.challengerState.maxHp;
      oppHp = lastTurn.opponentState.currentHp;
      oppMaxHp = lastTurn.opponentState.maxHp;
    } else {
      myHp = lastTurn.opponentState.currentHp;
      myMaxHp = lastTurn.opponentState.maxHp;
      oppHp = lastTurn.challengerState.currentHp;
      oppMaxHp = lastTurn.challengerState.maxHp;
    }
  }

  const myHpPct = Math.max(0, (myHp / myMaxHp) * 100);
  const oppHpPct = Math.max(0, (oppHp / oppMaxHp) * 100);


  return (
    <div style={{ position: 'relative' }}>
      {/* Victory/Defeat Overlay */}
      {showVictory && battle.status === 'finished' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 28,
            color: battle.winnerId === currentUserId ? '#39ff14' : (battle.winnerId ? '#ff4444' : '#ffd700'),
            textShadow: `0 0 30px ${battle.winnerId === currentUserId ? '#39ff14' : '#ff4444'}`,
            marginBottom: 16,
          }}>
            {battle.winnerId === currentUserId ? '🏆 VICTORY!' : (battle.winnerId ? '💀 DEFEAT' : '🤝 DRAW')}
          </div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#aaa', marginBottom: 8,
          }}>
            {battle.winnerId === currentUserId ? '+50 XP' : '+20 XP'}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              onClick={() => setShowVictory(false)}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: '10px 20px',
                border: '2px solid #00ffd5', background: 'rgba(0,255,213,0.1)', color: '#00ffd5',
                cursor: 'pointer',
              }}
            >
              VIEW LOG
            </button>
            <button
              onClick={() => router.push('/dashboard/battles')}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 9, padding: '10px 20px',
                border: '2px solid #ff6b35', background: 'rgba(255,107,53,0.1)', color: '#ff6b35',
                cursor: 'pointer',
              }}
            >
              BACK TO HUB
            </button>
          </div>
        </div>
      )}

      {/* Waiting state */}
      {battle.status === 'waiting' && (
        <div style={{
          textAlign: 'center', padding: 40,
          border: '2px solid #333', background: 'rgba(255,107,53,0.05)',
        }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#ff6b35', marginBottom: 16 }}>
            ⏳ WAITING FOR OPPONENT
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#aaa', marginBottom: 24 }}>
            Challenge sent to <strong style={{ color: '#fff' }}>@{oppUser.username}</strong>
          </div>
          {!isChallenger && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 10, padding: '12px 24px',
                border: '2px solid #39ff14', background: 'rgba(57,255,20,0.1)', color: '#39ff14',
                cursor: 'pointer', opacity: actionLoading ? 0.5 : 1,
              }}
            >
              ⚔️ ACCEPT CHALLENGE
            </button>
          )}
          {isChallenger && (
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#666', animation: 'pulse-glow 2s ease-in-out infinite' }}>
              Waiting for @{oppUser.username} to accept...
            </div>
          )}
        </div>
      )}

      {/* Battle Arena */}
      {(battle.status === 'active' || battle.status === 'finished') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fighters */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center',
          }}>
            {/* My Pet */}
            <FighterCard
              username={`@${myUser.username}`}
              petName={myUser.pet?.name || '???'}
              stage={myUser.pet?.stage || 'egg'}
              level={myUser.pet?.level || 1}
              currentHp={myHp}
              maxHp={myMaxHp}
              hpPct={myHpPct}
              isYou={true}
            />

            {/* VS */}
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 16,
              color: '#ff6b35', textShadow: '0 0 10px rgba(255,107,53,0.5)',
            }}>
              VS
            </div>

            {/* Opponent Pet */}
            <FighterCard
              username={`@${oppUser.username}`}
              petName={oppUser.pet?.name || '???'}
              stage={oppUser.pet?.stage || 'egg'}
              level={oppUser.pet?.level || 1}
              currentHp={oppHp}
              maxHp={oppMaxHp}
              hpPct={oppHpPct}
              isYou={false}
            />
          </div>

          {/* Action Buttons */}
          {battle.status === 'active' && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
            }}>
              {[
                { key: 'attack', label: '⚔️ Attack', color: '#ff6b35', desc: 'Basic attack' },
                { key: 'defend', label: '🛡️ Defend', color: '#00ffd5', desc: 'Halve incoming damage' },
                { key: 'special', label: '💥 Special', color: '#ff2d78', desc: 'Costs 20% HP, big damage' },
                { key: 'flee', label: '🏃 Flee', color: '#ffd700', desc: '50%+ chance to escape' },
              ].map((a) => (
                <button
                  key={a.key}
                  onClick={() => handleAction(a.key)}
                  disabled={actionLoading}
                  style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                    padding: '14px 8px', textAlign: 'center',
                    border: `2px solid ${a.color}`,
                    background: `rgba(${hexToRgb(a.color)},0.08)`,
                    color: a.color, cursor: 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = `rgba(${hexToRgb(a.color)},0.2)`; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = `rgba(${hexToRgb(a.color)},0.08)`; }}
                >
                  <div>{a.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: '#666', marginTop: 4 }}>{a.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#ff4444',
              padding: 10, border: '1px solid #ff4444', background: 'rgba(255,68,68,0.1)',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Battle Log */}
          <div style={{
            border: '1px solid #222', background: 'rgba(0,0,0,0.4)',
            padding: 16, maxHeight: 300, overflowY: 'auto',
          }} ref={logRef}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#ff6b35', marginBottom: 12 }}>
              ⚔️ BATTLE LOG
            </div>
            {turns.length === 0 && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#555', fontSize: 12, fontStyle: 'italic' }}>No turns yet...</div>
            )}
            {turns.map((t, i) => (
              <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #111' }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#666', marginBottom: 4 }}>
                  TURN {t.turn}
                </div>
                {t.events.map((evt, j) => (
                  <div key={j} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: evt.critical ? '#ffd700' : (evt.action === 'flee' && evt.success ? '#ffd700' : '#ccc'),
                    marginBottom: 2,
                    textShadow: evt.critical ? '0 0 8px rgba(255,215,0,0.5)' : 'none',
                  }}>
                    {evt.critical && <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ffd700' }}>CRITICAL! </span>}
                    {evt.message}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Turn count */}
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#555',
            textAlign: 'center',
          }}>
            TURN {turns.length} / 20
          </div>
        </div>
      )}
    </div>
  );
}

function FighterCard({ username, petName, stage, level, currentHp, maxHp, hpPct, isYou }: {
  username: string; petName: string; stage: string; level: number;
  currentHp: number; maxHp: number; hpPct: number; isYou: boolean;
}) {
  const hpColor = hpPct > 50 ? '#39ff14' : hpPct > 25 ? '#ffd700' : '#ff4444';
  const stageToEvolution = (s: string): 'egg' | 'baby' | 'junior' | 'senior' | 'legend' => {
    if (['egg', 'baby', 'junior', 'senior', 'legend'].includes(s)) return s as 'egg' | 'baby' | 'junior' | 'senior' | 'legend';
    return 'egg';
  };
  return (
    <div style={{
      border: `2px solid ${isYou ? '#00ffd5' : '#ff6b35'}`,
      background: `rgba(${isYou ? '0,255,213' : '255,107,53'},0.05)`,
      padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: isYou ? '#00ffd5' : '#ff6b35', marginBottom: 4 }}>
        {isYou ? '(YOU)' : '(OPP)'}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#aaa', marginBottom: 8 }}>{username}</div>
      <div style={{ marginBottom: 4 }}>
        <PixelPet stage={stageToEvolution(stage)} mood="happy" level={level} size="sm" />
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#fff', marginBottom: 4 }}>
        {petName}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#888', marginBottom: 8 }}>Lv.{level} {stage}</div>
      {/* HP Bar */}
      <div style={{ background: '#1a1a1a', height: 14, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          background: hpColor, height: '100%',
          width: `${hpPct}%`,
          transition: 'width 0.5s ease, background 0.5s ease',
          boxShadow: `0 0 8px ${hpColor}`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#fff',
          textShadow: '0 0 4px #000',
        }}>
          {currentHp} / {maxHp}
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
