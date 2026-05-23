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
import dynamic from 'next/dynamic';

const Achievements = dynamic(() => import('@/components/Achievements'), { ssr: false });
const Challenge = dynamic(() => import('@/components/Challenge'), { ssr: false });
const MiMoLab = dynamic(() => import('@/components/MiMoLab'), { ssr: false });
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
  equippedSkinId?: string | null;
  equippedAccessoryId?: string | null;
  equippedSkin?: { palette?: any; accessory?: string | null; animation?: string | null } | null;
  equippedAccessory?: { palette?: any; accessory?: string | null; animation?: string | null } | null;
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
      const [meRes, actRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/pet/activities'),
      ]);
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const data = await meRes.json();
      setUser(data.user);
      setPet(data.pet);
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
      <div className="dash-loading">
        <div className="dash-loading-text">Loading...</div>
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
      <div className="bg-orb bg-orb--cyan" />
      <div className="bg-orb bg-orb--pink" />

      {/* Navbar */}
      <nav className="dash-nav">
        <Link href="/" className="nav-logo">
          🤖 CodeBot
        </Link>
        <div className="nav-right">
          <span className="token-badge">🪙 {user.tokens ?? 0}</span>
          <span className="nav-username">@{user.username}</span>
          <button
            onClick={handleLogout}
            className="btn-pixel btn-pixel-pink nav-logout"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="dash-main">
        {/* Tab navigation + quick links */}
        <div className="tab-bar">
          {(['overview', 'achievements', 'challenge'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
            >
              {tab === 'overview' ? '🏠 Overview' : tab === 'achievements' ? '🏆 Achievements' : '🎮 Challenge'}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('lab')}
            className={`tab-btn ${activeTab === 'lab' ? 'tab-btn--lab' : ''}`}
          >
            🧬 MiMo Lab
          </button>
          <div className="tab-spacer" />
          <div className="quick-links">
            <Link href="/skins" className="quick-link quick-link--gold">🎨 Paint</Link>
            <Link href="/dashboard/battles" className="quick-link quick-link--orange">⚔️ Duels</Link>
            <Link href="/dashboard/friends" className="quick-link quick-link--cyan">👥 Friends</Link>
            <Link href="/guild" className="quick-link quick-link--purple">🏰 Squad</Link>
            <Link href="/guild-wars" className="quick-link quick-link--pink">🏆 Squad Wars</Link>
            <Link href="/leaderboard" className="quick-link quick-link--lime">📊 Board</Link>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="dashboard-grid">
            {/* Left column: Pet + Actions */}
            <div className="col-stack">
              {/* Pet card */}
              <div className="card-glass card-entrance" style={{ padding: 24 }}>
                {/* Pet name - clickable to rename */}
                <div className="pet-name">
                  {editingName ? (
                    <div className="rename-form">
                      <input
                        value={botName}
                        onChange={(e) => { setBotName(e.target.value); setRenameError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
                        maxLength={20}
                        autoFocus
                        className="rename-input"
                      />
                      <div className="rename-actions">
                        <button onClick={handleRename} className="rename-btn-ok">OK</button>
                        <button onClick={() => setEditingName(false)} className="rename-btn-cancel">X</button>
                      </div>
                      {renameError && <span className="rename-error">{renameError}</span>}
                    </div>
                  ) : (
                    <span
                      onClick={() => { setBotName(pet.name); setEditingName(true); setRenameError(''); }}
                      className="pet-name-text"
                      title="Click to rename your bot"
                    >
                      {pet.name} ✏️
                    </span>
                  )}
                </div>
                <div className="mood-area">
                  <MoodBadge hunger={pet.hunger} happiness={pet.happiness} level={pet.level} />
                </div>

                {/* Pet display */}
                <div className="pet-display">
                  <PixelPet stage={stage} mood={mood} level={pet.level} size="lg"
                    skin={pet.equippedSkin ? {
                      palette: pet.equippedSkin.palette as any,
                      accessory: pet.equippedAccessory?.accessory ?? pet.equippedSkin.accessory,
                      animation: pet.equippedAccessory?.animation ?? pet.equippedSkin.animation,
                    } : undefined}
                  />

                  {/* XP popup */}
                  {xpPopup && (
                    <div className="xp-popup">
                      {xpPopup}
                    </div>
                  )}
                </div>

                {/* XP Bar */}
                <div className="xp-pulse-wrap" style={{ marginTop: 16 }}>
                  <XPBar current={xp.current} max={xp.max} level={pet.level} />
                </div>

                {/* Action buttons */}
                <div className="action-btns">
                  <button
                    className="btn-pixel btn-pixel-lime"
                    onClick={handleFeed}
                    disabled={feedCooldown}
                    style={{
                      opacity: feedCooldown ? 0.4 : 1,
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
                      opacity: petCooldown ? 0.4 : 1,
                      cursor: petCooldown ? 'not-allowed' : 'pointer',
                    }}
                  >
                    🔧 Boost {petCooldown && '(15s)'}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="card-glass card-entrance" style={{ padding: 20 }}>
                <h3 className="section-title">STATS</h3>
                <div className="stats-grid">
                  <StatCard label="HP" value={pet.hp} icon="❤️" color="#ff2d78" />
                  <StatCard label="ATK" value={pet.atk} icon="⚔️" color="#ffd700" />
                  <StatCard label="DEF" value={pet.def} icon="🛡️" color="#00ffd5" />
                  <StatCard label="SPD" value={pet.spd} icon="💨" color="#b44dff" />
                </div>
                <div className="stats-grid--wide" style={{ marginTop: 8 }}>
                  <StatCard label="Power" value={`${pet.hunger}%`} icon="⚡" color="#ff2d78" />
                  <StatCard label="Morale" value={`${pet.happiness}%`} icon="😊" color="#39ff14" />
                  <StatCard label="Commits" value={pet.totalCommits} icon="💻" color="#00ffd5" />
                </div>
              </div>
            </div>

            {/* Right column: Build Phase + Activity */}
            <div className="col-stack">
              {/* Evolution Timeline */}
              <div className="card-glass card-entrance" style={{ padding: 20 }}>
                <EvolutionTimeline stage={stage} level={pet.level} />
              </div>

              {/* Activity Feed */}
              <div className="card-glass card-entrance" style={{ padding: 20, flex: 1 }}>
                <h3 className="section-title">ACTIVITY</h3>
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        ) : activeTab === 'achievements' ? (
          /* Achievements tab */
          <div className="card-glass card-entrance" style={{ padding: 24 }}>
            <Achievements pet={petState} />
          </div>
        ) : activeTab === 'lab' ? (
          /* MiMo Lab tab */
          <div className="card-glass card-entrance" style={{ padding: 24 }}>
            <h3 className="lab-title">🧬 MiMo Fusion Lab</h3>
            <p className="lab-desc">
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
          <div className="card-glass card-entrance" style={{ padding: 24 }}>
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
