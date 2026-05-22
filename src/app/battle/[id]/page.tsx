'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BattleArena from '@/components/BattleArena';

interface UserData {
  id: string;
  username: string;
}

export default function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [battleId, setBattleId] = useState<string>('');

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
    params.then(p => setBattleId(p.id));
  }, [checkAuth, params]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#ff6b35', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          ⚔️ Entering Battle...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)',
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
            🐣 CodePet
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#666' }}>@{user.username}</span>
          <Link href="/dashboard/battles" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: '#ff6b35', textDecoration: 'none', padding: '6px 12px',
            border: '1px solid #ff6b35',
          }}>
            ← BATTLES
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '24px 20px 60px',
        position: 'relative',
        zIndex: 1,
      }}>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 14,
          color: '#ff6b35', marginBottom: 24, textAlign: 'center',
          textShadow: '0 0 20px rgba(255,107,53,0.3)',
        }}>
          ⚔️ BATTLE ARENA
        </h1>
        {battleId && <BattleArena battleId={battleId} />}
      </main>
    </div>
  );
}
