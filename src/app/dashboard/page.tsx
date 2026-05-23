'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PixelPet from '@/components/PixelPet';
import XPBar from '@/components/XPBar';
import MoodBadge from '@/components/MoodBadge';
import StatCard from '@/components/StatCard';
import ActivityFeed from '@/components/ActivityFeed';
import EvolutionTimeline from '@/components/EvolutionTimeline';
import Achievements from '@/components/Achievements';
import Challenge from '@/components/Challenge';
import MiMoLab from '@/components/MiMoLab';
import {
  calculateMood,
  xpProgress,
  type EvolutionStage,
  type PetMood,
  type Activity,
  type PetState,
} from '@/lib/pet';

interface PetData {
  id: string;
  name: string;
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  stage: string;
  totalCommits: number;
  streakDays: number;
  challengesCompleted: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  personality?: string | null;
  personalityUnlocked?: boolean;
  skills?: any[];
  activeSkills?: string[];
}

interface UserData {
  id: string;
  username: string;
  email: string;
  tokens?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedCooldown, setFeedCooldown] = useState(false);
  const [petCooldown, setPetCooldown] = useState(false);
  const [xpPopup, setXpPopup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenge' | 'lab'>('overview');
  const [editingName, setEditingName] = useState(false);
  const [botName, setBotName] = useState('');
  const [renameError, setRenameError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setPet(data.pet);

      // Fetch activities
      const actRes = await fetch('/api/pet/activities');
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData.activities);
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleFeed() {
    if (feedCooldown) return;
    setFeedCooldown(true);
    try {
      const res = await fetch('/api/pet/feed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPet(data.pet);
        setXpPopup(`+${data.xpGained} XP`);
        setTimeout(() => setXpPopup(null), 2000);
        // Re-fetch activities
        refreshData();
      }
    } finally {
      setTimeout(() => setFeedCooldown(false), 30000);
    }
  }

  async function handlePet() {
    if (petCooldown) return;
    setPetCooldown(true);
    try {
      const res = await fetch('/api/pet/pet', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setPet(data.pet);
        setXpPopup('💖 +Happy');
        setTimeout(() => setXpPopup(null), 2000);
        refreshData();
      }
    } finally {
      setTimeout(() => setPetCooldown(false), 15000);
    }
  }

  async function handleRename() {
    const name = botName.trim();
    if (name.length < 2 || name.length > 20) {
      setRenameError('2-20 characters');
      return;
    }
    setRenameError('');
    try {
      const res = await fetch('/api/pet/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setPet((prev) => prev ? { ...prev, name: data.name } : prev);
        setEditingName(false);
      } else {
        setRenameError(data.error || 'Failed');
      }
    } catch {
      setRenameError('Network error');
    }
  }

  async function refreshData() {
    try {
      const [meRes, actRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/pet/activities'),
      ]);
      if (meRes.ok) {
        const meData = await meRes.json();
        setPet(meData.pet);
      }
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData.activities);
      }
    } catch { /* ignore */ }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#00ffd5', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!pet || !user) return null;

  const mood: PetMood = calculateMood(pet.hunger, pet.happiness);
  const stage = pet.stage as EvolutionStage;
  const xp = xpProgress(pet.xp);

  const petState: PetState = {
    name: pet.name,
    level: pet.level,
    xp: pet.xp,
    hunger: pet.hunger,
    happiness: pet.happiness,
    stage,
    totalCommits: pet.totalCommits,
    streakDays: pet.streakDays,
    challengesCompleted: pet.challengesCompleted,
    hp: pet.hp,
    atk: pet.atk,
    def: pet.def,
    spd: pet.spd,
    activities,
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,213,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, left: 0, right: 0,
        padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#00ffd5' }}>
            🤖 CodeBot
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#ffd700', background: 'rgba(255,215,0,0.1)',
            padding: '4px 10px', borderRadius: 4,
            border: '1px solid rgba(255,215,0,0.3)',
          }}>
            🪙 {user.tokens ?? 0}
          </span>
          <span style={{ fontSize: 12, color: '#666' }}>@{user.username}</span>
          <button
            onClick={handleLogout}
            className="btn-pixel btn-pixel-pink"
            style={{ fontSize: 8, padding: '6px 12px' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 20px 60px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['overview', 'achievements', 'challenge'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                padding: '8px 16px',
                border: `2px solid ${activeTab === tab ? '#00ffd5' : '#333'}`,
                background: activeTab === tab ? 'rgba(0,255,213,0.1)' : 'transparent',
                color: activeTab === tab ? '#00ffd5' : '#666',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'overview' ? '🏠 Overview' : tab === 'achievements' ? '🏆 Achievements' : '🎮 Challenge'}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('lab')}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9, padding: '8px 16px',
              border: `2px solid ${activeTab === 'lab' ? '#b44dff' : '#333'}`,
              background: activeTab === 'lab' ? 'rgba(180,77,255,0.12)' : 'transparent',
              color: activeTab === 'lab' ? '#b44dff' : '#666',
              cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s',
            }}
          >
            🧬 MiMo Lab
          </button>
          <div style={{ flex: 1 }} />
          {/* Future nav links */}
          <Link href="/skins" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#ffd700', padding: '8px 12px', textDecoration: 'none',
            border: '1px solid #ffd700',
          }}>
            🎨 Paint
          </Link>
          <Link href="/dashboard/battles" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#ff6b35', padding: '8px 12px', textDecoration: 'none',
            border: '1px solid #ff6b35',
          }}>
            ⚔️ Duels
          </Link>
          <Link href="/dashboard/friends" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#00ffd5', padding: '8px 12px', textDecoration: 'none',
            border: '1px solid #00ffd5',
          }}>
            👥 Friends
          </Link>
          <Link href="/guild" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#b44dff', padding: '8px 12px', textDecoration: 'none',
            border: '1px solid #b44dff',
          }}>
            🏰 Squad
          </Link>
          <Link href="/guild-wars" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#ff2d78', padding: '8px 12px', textDecoration: 'none',
            border: '1px solid #ff2d78',
          }}>
            🏆 Squad Wars
          </Link>
          <Link href="/leaderboard" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#39ff14', padding: '8px 12px', textDecoration: 'none',
            border: '1px solid #39ff14',
          }}>
            📊 Board
          </Link>
        </div>

        {activeTab === 'overview' ? (
          <div className="dashboard-grid">
            {/* Left column: Pet + Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Pet card */}
              <div className="card-retro" style={{ padding: 24 }}>
                {/* Pet name - clickable to rename */}
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11, color: '#00ffd5',
                  marginBottom: 4, textAlign: 'center',
                  position: 'relative',
                }}>
                  {editingName ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <input
                        value={botName}
                        onChange={(e) => { setBotName(e.target.value); setRenameError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
                        maxLength={20}
                        autoFocus
                        style={{
                          background: 'rgba(0,255,213,0.08)', border: '1px solid #00ffd5',
                          color: '#00ffd5', padding: '4px 8px', borderRadius: 4,
                          fontFamily: "'Press Start 2P', monospace", fontSize: 11,
                          width: 160, textAlign: 'center', outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={handleRename} style={{
                          background: '#00ffd5', color: '#0a0a0f', border: 'none',
                          padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
                          fontFamily: "'Press Start 2P'", fontSize: 7,
                        }}>OK</button>
                        <button onClick={() => setEditingName(false)} style={{
                          background: 'rgba(255,255,255,0.1)', color: '#888', border: 'none',
                          padding: '3px 10px', borderRadius: 4, cursor: 'pointer',
                          fontFamily: "'Press Start 2P'", fontSize: 7,
                        }}>X</button>
                      </div>
                      {renameError && <span style={{ color: '#ff2d78', fontSize: 7 }}>{renameError}</span>}
                    </div>
                  ) : (
                    <span
                      onClick={() => { setBotName(pet.name); setEditingName(true); setRenameError(''); }}
                      style={{ cursor: 'pointer', borderBottom: '1px dashed rgba(0,255,213,0.3)' }}
                      title="Click to rename your bot"
                    >
                      {pet.name} ✏️
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 12, textAlign: 'center' }}>
                  <MoodBadge hunger={pet.hunger} happiness={pet.happiness} level={pet.level} />
                </div>

                {/* Pet display */}
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  padding: '20px 0', position: 'relative',
                }}>
                  <PixelPet stage={stage} mood={mood} level={pet.level} size="lg" />

                  {/* XP popup */}
                  {xpPopup && (
                    <div style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 12, color: '#39ff14',
                      animation: 'float-up-fade 2s ease-out forwards',
                      pointerEvents: 'none',
                    }}>
                      {xpPopup}
                    </div>
                  )}
                </div>

                {/* XP Bar */}
                <div style={{ marginTop: 16 }}>
                  <XPBar current={xp.current} max={xp.max} level={pet.level} />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button
                    className="btn-pixel btn-pixel-lime"
                    onClick={handleFeed}
                    disabled={feedCooldown}
                    style={{
                      flex: 1, opacity: feedCooldown ? 0.4 : 1,
                      cursor: feedCooldown ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ⚡ Charge {feedCooldown && '(30s)'}
                  </button>
                  <button
                    className="btn-pixel btn-pixel-pink"
                    onClick={handlePet}
                    disabled={petCooldown}
                    style={{
                      flex: 1, opacity: petCooldown ? 0.4 : 1,
                      cursor: petCooldown ? 'not-allowed' : 'pointer',
                    }}
                  >
                    🔧 Boost {petCooldown && '(15s)'}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="card-retro" style={{ padding: 20 }}>
                <h3 style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9, color: '#00ffd5',
                  marginBottom: 16, letterSpacing: 1,
                }}>
                  STATS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <StatCard label="HP" value={pet.hp} icon="❤️" color="#ff2d78" />
                  <StatCard label="ATK" value={pet.atk} icon="⚔️" color="#ffd700" />
                  <StatCard label="DEF" value={pet.def} icon="🛡️" color="#00ffd5" />
                  <StatCard label="SPD" value={pet.spd} icon="💨" color="#b44dff" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                  <StatCard label="Power" value={`${pet.hunger}%`} icon="⚡" color="#ff2d78" />
                  <StatCard label="Morale" value={`${pet.happiness}%`} icon="😊" color="#39ff14" />
                  <StatCard label="Commits" value={pet.totalCommits} icon="💻" color="#00ffd5" />
                </div>
              </div>
            </div>

            {/* Right column: Build Phase + Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Evolution Timeline */}
              <div className="card-retro" style={{ padding: 20 }}>
                <EvolutionTimeline stage={stage} level={pet.level} />
              </div>

              {/* Activity Feed */}
              <div className="card-retro" style={{ padding: 20, flex: 1 }}>
                <h3 style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9, color: '#00ffd5',
                  marginBottom: 16, letterSpacing: 1,
                }}>
                  ACTIVITY
                </h3>
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        ) : activeTab === 'achievements' ? (
          /* Achievements tab */
          <div className="card-retro" style={{ padding: 24 }}>
            <Achievements pet={petState} />
          </div>
        ) : activeTab === 'lab' ? (
          /* MiMo Lab tab */
          <div className="card-retro" style={{ padding: 24 }}>
            <h3 style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11, color: '#b44dff',
              marginBottom: 4,
            }}>
              🧬 MiMo Fusion Lab
            </h3>
            <p style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8, color: '#666',
              marginBottom: 20, lineHeight: 1.6,
            }}>
              AI-powered bot upgrades. Mine tokens, train skills, unlock personality, fuse for power.
            </p>
            <MiMoLab
              tokens={user.tokens ?? 0}
              level={pet.level}
              stage={pet.stage}
              stats={{ hp: pet.hp, atk: pet.atk, def: pet.def, spd: pet.spd }}
              personality={pet.personality ?? null}
              personalityUnlocked={pet.personalityUnlocked ?? false}
              skills={pet.skills ?? []}
              activeSkills={pet.activeSkills ?? []}
              onUpdate={refreshData}
            />
          </div>
        ) : (
          /* Challenge tab */
          <div className="card-retro" style={{ padding: 24 }}>
            <Challenge
              level={pet.level}
              challengesCompleted={pet.challengesCompleted ?? 0}
              onComplete={() => {
                setPet((prev) => prev ? { ...prev, xp: prev.xp + 50, challengesCompleted: (prev.challengesCompleted ?? 0) + 1 } : prev);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
