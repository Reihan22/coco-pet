'use client';

import { useState, useEffect } from 'react';

interface LabProps {
  tokens: number;
  level: number;
  stage: string;
  stats: { hp: number; atk: number; def: number; spd: number };
  personality: string | null;
  personalityUnlocked: boolean;
  skills: any[];
  activeSkills: string[];
  onUpdate: () => void;
}

type Tab = 'mining' | 'training' | 'personality' | 'fusion';

export default function MiMoLab({ tokens, level, stage, stats, personality, personalityUnlocked, skills, activeSkills, onUpdate }: LabProps) {
  const [tab, setTab] = useState<Tab>('mining');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  // Mining state
  const [miningData, setMiningData] = useState<{ balance: number; rate: number; pending: number; lastMinedAt: string } | null>(null);

  // Training state
  const [trainOptions, setTrainOptions] = useState<Record<string, any> | null>(null);

  // Personality state
  const [personalityOptions, setPersonalityOptions] = useState<Record<string, any> | null>(null);

  // Fusion state
  const [fusionCosts, setFusionCosts] = useState<Record<string, number> | null>(null);
  const [partnerUser, setPartnerUser] = useState('');

  useEffect(() => {
    if (tab === 'mining') fetchMining();
    if (tab === 'training') fetchTraining();
    if (tab === 'personality') fetchPersonality();
    if (tab === 'fusion') fetchFusion();
  }, [tab]);

  async function fetchMining() {
    try {
      const res = await fetch('/api/tokens');
      if (res.ok) setMiningData(await res.json());
    } catch {}
  }

  async function handleClaim() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/tokens', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: `Mined ${data.mined} tokens!`, type: 'ok' });
        setMiningData(prev => prev ? { ...prev, balance: data.balance, pending: 0 } : null);
        onUpdate();
      } else {
        setMsg({ text: data.message || data.error, type: 'err' });
      }
    } catch {
      setMsg({ text: 'Network error', type: 'err' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchTraining() {
    try {
      const res = await fetch('/api/training');
      if (res.ok) {
        const data = await res.json();
        setTrainOptions(data.options);
      }
    } catch {}
  }

  async function handleTrain(type: string) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingType: type }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: `Trained ${data.skill.name}!`, type: 'ok' });
        onUpdate();
      } else {
        setMsg({ text: data.error, type: 'err' });
      }
    } catch {
      setMsg({ text: 'Network error', type: 'err' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchPersonality() {
    try {
      const res = await fetch('/api/personality');
      if (res.ok) {
        const data = await res.json();
        setPersonalityOptions(data.options);
      }
    } catch {}
  }

  async function handlePersonality(action: 'unlock' | 'change', type: string) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, personalityType: type }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message, type: 'ok' });
        onUpdate();
      } else {
        setMsg({ text: data.error, type: 'err' });
      }
    } catch {
      setMsg({ text: 'Network error', type: 'err' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchFusion() {
    try {
      const res = await fetch('/api/fusion');
      if (res.ok) {
        const data = await res.json();
        setFusionCosts(data.costs);
      }
    } catch {}
  }

  async function handleFusion(type: string) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/fusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fusionType: type, partnerUsername: partnerUser || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message, type: 'ok' });
        onUpdate();
      } else {
        setMsg({ text: data.error, type: 'err' });
      }
    } catch {
      setMsg({ text: 'Network error', type: 'err' });
    } finally {
      setLoading(false);
    }
  }

  const tabBtn = (t: Tab, label: string, icon: string) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        padding: '8px 14px',
        border: `2px solid ${tab === t ? '#b44dff' : '#333'}`,
        background: tab === t ? 'rgba(180,77,255,0.12)' : 'transparent',
        color: tab === t ? '#b44dff' : '#666',
        cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s',
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div>
      {/* Token balance banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(180,77,255,0.15), rgba(0,255,213,0.08))',
        border: '1px solid rgba(180,77,255,0.3)', borderRadius: 8,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#b44dff', marginBottom: 4 }}>
            MiMo Token Balance
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#ffd700' }}>
            🪙 {tokens}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#666' }}>
            Powered by Xiaomi MiMo V2.5 Pro
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabBtn('mining', 'Mining', '⛏️')}
        {tabBtn('training', 'Training', '🧠')}
        {tabBtn('personality', 'Personality', '🎭')}
        {tabBtn('fusion', 'Fusion', '🔮')}
      </div>

      {/* Message */}
      {msg && (
        <div style={{
          padding: '10px 14px', marginBottom: 16, borderRadius: 6,
          background: msg.type === 'ok' ? 'rgba(57,255,20,0.1)' : 'rgba(255,45,120,0.1)',
          border: `1px solid ${msg.type === 'ok' ? '#39ff14' : '#ff2d78'}`,
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: msg.type === 'ok' ? '#39ff14' : '#ff2d78',
        }}>
          {msg.text}
        </div>
      )}

      {/* MINING TAB */}
      {tab === 'mining' && (
        <div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
            Your bot mines tokens passively based on its Mark level. Claim every 3 days max!
          </p>
          {miningData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888', marginBottom: 6 }}>Rate</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#ffd700' }}>{miningData.rate}/h</div>
              </div>
              <div style={{ textAlign: 'center', padding: 16, background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)', borderRadius: 8 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888', marginBottom: 6 }}>Pending</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#39ff14' }}>{miningData.pending}</div>
              </div>
              <div style={{ textAlign: 'center', padding: 16, background: 'rgba(180,77,255,0.05)', border: '1px solid rgba(180,77,255,0.2)', borderRadius: 8 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888', marginBottom: 6 }}>Level</div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#b44dff' }}>Mk.{level}</div>
              </div>
            </div>
          )}
          <button
            className="btn-pixel"
            onClick={handleClaim}
            disabled={loading || !miningData || miningData.pending <= 0}
            style={{
              width: '100%', padding: '14px',
              opacity: loading || !miningData || miningData.pending <= 0 ? 0.4 : 1,
              background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
              color: '#000', fontWeight: 'bold',
            }}
          >
            {loading ? '⛏️ Mining...' : miningData && miningData.pending > 0 ? `⛏️ Claim ${miningData.pending} Tokens` : '⛏️ No tokens to claim yet'}
          </button>
        </div>
      )}

      {/* TRAINING TAB */}
      {tab === 'training' && (
        <div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
            Train your bot with AI-powered upgrades. Permanent stat boosts!
          </p>
          {trainOptions && Object.entries(trainOptions).map(([key, opt]: [string, any]) => {
            const learned = skills.some((s: any) => s.id === key);
            return (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', marginBottom: 8, borderRadius: 8,
                background: learned ? 'rgba(57,255,20,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${learned ? '#39ff14' : '#333'}`,
              }}>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: learned ? '#39ff14' : '#fff', marginBottom: 4 }}>
                    {learned && '✓ '}{opt.name}
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888' }}>
                    {opt.desc}
                  </div>
                </div>
                <button
                  className="btn-pixel btn-pixel-cyan"
                  onClick={() => handleTrain(key)}
                  disabled={loading || learned}
                  style={{ fontSize: 7, padding: '8px 14px', opacity: learned ? 0.4 : 1 }}
                >
                  {learned ? 'Learned' : `🪙 ${opt.cost}`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* PERSONALITY TAB */}
      {tab === 'personality' && (
        <div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
            {personalityUnlocked
              ? `Current: ${personality?.toUpperCase() || 'None'}. Change costs 150 tokens.`
              : 'Unlock a personality to give your bot a unique combat style! Costs 300 tokens.'}
          </p>
          {personalityOptions && Object.entries(personalityOptions).map(([key, p]: [string, any]) => (
            <div key={key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', marginBottom: 8, borderRadius: 8,
              background: personality === key ? 'rgba(180,77,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${personality === key ? '#b44dff' : '#333'}`,
            }}>
              <div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#fff', marginBottom: 4 }}>
                  {p.icon} {p.name} {personality === key && '(Active)'}
                </div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888' }}>
                  {p.desc}
                </div>
              </div>
              <button
                className="btn-pixel"
                onClick={() => handlePersonality(personalityUnlocked ? 'change' : 'unlock', key)}
                disabled={loading || personality === key}
                style={{
                  fontSize: 7, padding: '8px 14px',
                  opacity: personality === key ? 0.4 : 1,
                  background: 'linear-gradient(135deg, #b44dff, #8b00ff)',
                  color: '#fff',
                }}
              >
                {personality === key ? 'Active' : personalityUnlocked ? '🪙 150' : '🪙 300'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FUSION TAB */}
      {tab === 'fusion' && (
        <div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
            Fuse your bot with MiMo energy to permanently boost all stats. Epic fusion requires Mk.III+.
          </p>
          {fusionCosts && Object.entries(fusionCosts).map(([key, cost]: [string, any]) => {
            const boost = key === 'standard' ? '15%' : key === 'rare' ? '25%' : '40%';
            const color = key === 'standard' ? '#00ffd5' : key === 'rare' ? '#ffd700' : '#ff2d78';
            const locked = key === 'epic' && level < 15;
            return (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', marginBottom: 8, borderRadius: 8,
                background: `${color}08`, border: `1px solid ${color}33`,
              }}>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color, marginBottom: 4 }}>
                    {key === 'standard' ? '⚡' : key === 'rare' ? '✨' : '💀'} {key.charAt(0).toUpperCase() + key.slice(1)} Fusion
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888' }}>
                    +{boost} all stats{key === 'rare' ? ' + partner bonus' : ''}{locked ? ' (Req: Mk.III)' : ''}
                  </div>
                </div>
                <button
                  className="btn-pixel"
                  onClick={() => handleFusion(key)}
                  disabled={loading || locked}
                  style={{ fontSize: 7, padding: '8px 14px', background: color, color: '#000', opacity: locked ? 0.3 : 1 }}
                >
                  🪙 {cost}
                </button>
              </div>
            );
          })}

          {/* Partner input for rare/epic */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#888', marginBottom: 6 }}>
              Partner Username (for Rare/Epic fusion bonus)
            </div>
            <input
              type="text"
              value={partnerUser}
              onChange={e => setPartnerUser(e.target.value)}
              placeholder="friend_username"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 6,
                border: '1px solid #333', background: 'rgba(255,255,255,0.03)',
                color: '#fff', fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
