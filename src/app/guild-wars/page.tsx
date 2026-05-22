'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuildWarScheduler from '@/components/GuildWarScheduler';
import GuildWarHistory from '@/components/GuildWarHistory';

interface UserData {
  id: string;
  username: string;
}

export default function GuildWarsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'schedule'>('history');

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#ff6b35', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)',
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
            🐣 CodePet
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#666' }}>@{user.username}</span>
          <Link href="/dashboard" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#00ffd5', textDecoration: 'none', padding: '6px 12px',
            border: '1px solid #00ffd5',
          }}>
            ← DASHBOARD
          </Link>
        </div>
      </nav>

      <main style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 20px 60px',
        position: 'relative', zIndex: 1,
      }}>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 14,
          color: '#ff6b35', marginBottom: 24,
        }}>
          ⚔️ GUILD WARS
        </h1>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['history', 'schedule'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9, padding: '8px 16px',
                border: `2px solid ${activeTab === tab ? '#ff6b35' : '#333'}`,
                background: activeTab === tab ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: activeTab === tab ? '#ff6b35' : '#666',
                cursor: 'pointer', textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'history' ? '📜 History' : '⚔️ Schedule War'}
            </button>
          ))}
        </div>

        {activeTab === 'history' ? (
          <GuildWarHistory />
        ) : (
          <GuildWarScheduler onCreated={() => setActiveTab('history')} />
        )}
      </main>
    </div>
  );
}
