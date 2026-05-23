'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({ users: 0, battles: 0, guilds: 0 });

  useEffect(() => {
    setLoaded(true);
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.users !== undefined) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,213,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 100,
      }}>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: '#00ffd5' }}>
          🤖 CodeBot
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/leaderboard" style={{
            fontFamily: "var(--font-pixel)", fontSize: 9,
            color: '#ffd700', textDecoration: 'none',
            border: '2px solid #ffd700', padding: '8px 16px',
            transition: 'all 0.2s',
          }}>
            🏆 Leaderboard
          </Link>
          <Link href="/login" style={{
            fontFamily: "var(--font-pixel)", fontSize: 9,
            color: '#666', textDecoration: 'none',
            border: '2px solid #333', padding: '8px 16px',
            transition: 'all 0.2s',
          }}>
            Login
          </Link>
          <Link href="/register" style={{
            fontFamily: "var(--font-pixel)", fontSize: 9,
            color: '#00ffd5', textDecoration: 'none',
            border: '2px solid #00ffd5', padding: '8px 16px',
            transition: 'all 0.2s',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px 40px',
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        {/* Animated pixel bot hero */}
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          <HeroPet />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 'clamp(20px, 4vw, 36px)',
            lineHeight: 1.4,
            marginTop: 32,
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.2s',
          }}
          className="text-gradient-rainbow"
        >
          CodeBot
        </h1>

        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 'clamp(8px, 1.5vw, 12px)',
            color: '#888',
            marginTop: 16,
            lineHeight: 2,
            opacity: loaded ? 1 : 0,
            transition: 'all 0.8s ease 0.4s',
          }}
        >
          Your AI-Powered Mech Builder
        </p>

        <p
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 'clamp(7px, 1.2vw, 10px)',
            color: '#ffd700',
            marginTop: 8,
            opacity: loaded ? 0.8 : 0,
            transition: 'all 0.8s ease 0.5s',
          }}
        >
          Powered by Xiaomi MiMo V2.5 Pro
        </p>

        <p
          style={{
            maxWidth: 500,
            fontSize: 14,
            color: '#666',
            marginTop: 20,
            lineHeight: 1.7,
            opacity: loaded ? 1 : 0,
            transition: 'all 0.8s ease 0.6s',
          }}
        >
          A robot that grows with your coding activity. Train your bot with AI-powered challenges,
          duel friends in turn-based mech combat, and join squad wars. Build it from Frame to Legend.
        </p>

        <div style={{
          marginTop: 40,
          opacity: loaded ? 1 : 0,
          transition: 'all 0.8s ease 0.7s',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-pixel" style={{ fontSize: 11, padding: '16px 40px' }}>
              🤖 Create Your Bot
            </button>
          </Link>
          <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
            <button className="btn-pixel btn-pixel-pink" style={{ fontSize: 11, padding: '16px 40px' }}>
              🏆 Leaderboard
            </button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 30,
          opacity: loaded ? 0.5 : 0,
          transition: 'all 0.8s ease 1s',
          animation: 'bounce-soft 2s ease-in-out infinite',
          fontSize: 20,
        }}>
          ↓
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 'clamp(14px, 2.5vw, 20px)',
          textAlign: 'center',
          marginBottom: 60,
          color: '#00ffd5',
        }}>
          Features
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          <FeatureCard
            icon="🤖"
            title="MiMo Engineer"
            description="Chat with your bot's AI-powered engineer, powered by Xiaomi MiMo V2.5 Pro. Get coding advice, debug help, and personalized training recommendations. Your bot learns from your coding style!"
            color="#00ffd5"
          />
          <FeatureCard
            icon="⚔️"
            title="Mech Duels"
            description="Challenge other developers to turn-based mech combat! Use your bot's ATK, DEF, and SPD stats. Win duels to climb the leaderboard and earn Parts + Tokens."
            color="#ff2d78"
          />
          <FeatureCard
            icon="🏰"
            title="Squad Wars"
            description="Join or create a squad with fellow developers. Compete in team-based squad wars. Coordinate strategies with squad chat and climb the leaderboard together!"
            color="#b44dff"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 20px 80px',
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap',
          maxWidth: 700, margin: '0 auto',
        }}>
          <StatBox label={stats.users === 1 ? 'Builder' : 'Builders'} value={stats.users} color="#00ffd5" />
          <StatBox label={stats.battles === 1 ? 'Duel' : 'Duels'} value={stats.battles} color="#ff2d78" />
          <StatBox label={stats.guilds === 1 ? 'Squad' : 'Squads'} value={stats.guilds} color="#b44dff" />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '30px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: 11,
        color: '#444',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: '#00ffd5', marginBottom: 8 }}>
          🤖 CodeBot
        </p>
        <p>Build. Code. Battle. • Powered by Xiaomi MiMo V2.5 Pro</p>
      </footer>
    </main>
  );
}

/* Hero animated bot */
function HeroPet() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -20, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
        animation: 'pulse-glow 3s ease-in-out infinite',
      }} />
      <div style={{ animation: 'bounce-soft 2s ease-in-out infinite' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ imageRendering: 'pixelated' }}>
          {/* Antenna */}
          <rect x="86" y="12" width="8" height="16" fill="#5a6080" />
          <rect x="82" y="8" width="16" height="8" rx="2" fill="#ff3d00" />
          <circle cx="90" cy="12" r="3" fill="#ff3d00" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Head */}
          <rect x="50" y="28" width="80" height="52" rx="6" fill="#3a3f5c" />
          <rect x="54" y="32" width="72" height="44" rx="4" fill="#5a6080" />
          <rect x="62" y="34" width="56" height="8" rx="2" fill="#4a5070" />
          {/* Visor */}
          <rect x="58" y="44" width="64" height="20" rx="4" fill="#0a0e1a" />
          <rect x="60" y="46" width="60" height="16" rx="3" fill="#00e5ff" opacity="0.15" />
          {/* Eyes */}
          <rect x="66" y="50" width="16" height="12" rx="2" fill="#ff3d00">
            <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="98" y="50" width="16" height="12" rx="2" fill="#ff3d00">
            <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
          </rect>
          <rect x="62" y="47" width="20" height="3" rx="1" fill="white" opacity="0.25" />
          {/* Mouth grill */}
          <rect x="72" y="68" width="36" height="4" fill="#0a0e1a" />
          <rect x="72" y="74" width="36" height="4" fill="#0a0e1a" />
          {/* Neck */}
          <rect x="78" y="80" width="24" height="8" fill="#1a1e30" />
          {/* Torso */}
          <rect x="42" y="88" width="96" height="52" rx="6" fill="#3a3f5c" />
          <rect x="46" y="92" width="88" height="44" rx="4" fill="#5a6080" />
          <rect x="62" y="96" width="56" height="24" rx="4" fill="#4a5070" />
          <circle cx="90" cy="108" r="8" fill="#76ff03" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="r" values="8;6;8" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <rect x="66" y="124" width="48" height="3" fill="#1a1e30" />
          {/* Arms */}
          <rect x="22" y="92" width="16" height="40" rx="4" fill="#3a3f5c" />
          <rect x="24" y="94" width="12" height="36" rx="3" fill="#5a6080" />
          <rect x="22" y="132" width="16" height="8" rx="3" fill="#1a1e30" />
          <rect x="20" y="140" width="20" height="14" rx="4" fill="#3a3f5c" />
          <rect x="142" y="92" width="16" height="40" rx="4" fill="#3a3f5c" />
          <rect x="144" y="94" width="12" height="36" rx="3" fill="#5a6080" />
          <rect x="142" y="132" width="16" height="8" rx="3" fill="#1a1e30" />
          <rect x="140" y="140" width="20" height="14" rx="4" fill="#3a3f5c" />
          {/* Shoulders */}
          <rect x="36" y="86" width="22" height="12" rx="4" fill="#4a5070" />
          <rect x="122" y="86" width="22" height="12" rx="4" fill="#4a5070" />
          {/* Legs */}
          <rect x="54" y="140" width="24" height="20" rx="4" fill="#3a3f5c" />
          <rect x="46" y="160" width="32" height="10" rx="4" fill="#4a5070" />
          <rect x="102" y="140" width="24" height="20" rx="4" fill="#3a3f5c" />
          <rect x="102" y="160" width="32" height="10" rx="4" fill="#4a5070" />
          {/* Visor glow */}
          <rect x="58" y="44" width="64" height="20" rx="4" fill="#00e5ff" opacity="0.08">
            <animate attributeName="opacity" values="0.08;0.2;0.08" dur="2s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>
      {/* Code symbol */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        fontSize: 28, animation: 'float 3s ease-in-out infinite',
      }}>
        {'</>'}
      </div>
      {/* Lightning */}
      <div style={{
        position: 'absolute', top: 0, left: -16,
        fontSize: 18, animation: 'sparkle 2s ease-in-out infinite',
      }}>
        ⚡
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: string; title: string; description: string; color: string;
}) {
  return (
    <div className="card-retro" style={{
      padding: 24,
      transition: 'all 0.3s',
      cursor: 'default',
    }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
      <h3 style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 11,
        color,
        marginBottom: 14,
        lineHeight: 1.6,
      }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>{description}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 28,
        color,
        textShadow: `0 0 20px ${color}44`,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>{label}</div>
    </div>
  );
}
