'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({ users: 0, battles: 0, guilds: 0, tokens_today: 0, tokens_month: 0 });

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

      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`particle particle--${i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'pink' : 'lime'}`}
            style={{
              left: `${(i * 4.2) % 100}%`,
              width: i % 3 === 0 ? 4 : 3,
              height: i % 3 === 0 ? 4 : 3,
              animationDuration: `${6 + (i * 1.3) % 10}s`,
              animationDelay: `${(i * 0.7) % 8}s`,
            }}
          />
        ))}
      </div>

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

      {/* ==================== HERO SECTION ==================== */}
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
          Build. Train. Battle. Evolve.
        </p>

        {/* MiMo badge */}
        <div
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 9,
            color: '#ffd700',
            marginTop: 12,
            padding: '6px 18px',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 4,
            background: 'rgba(255,215,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            opacity: loaded ? 1 : 0,
            transition: 'all 0.8s ease 0.5s',
          }}
        >
          <span style={{ fontSize: 14 }}>⚡</span>
          Powered by Xiaomi MiMo V2.5 Pro
        </div>

        {/* MiMo Token Usage */}
        {stats.tokens_month > 0 && (
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: loaded ? 1 : 0,
              transition: 'all 0.8s ease 0.8s',
            }}
          >
            <div style={{
              background: 'rgba(0,255,213,0.08)',
              border: '1px solid rgba(0,255,213,0.2)',
              borderRadius: 8,
              padding: '12px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 18, color: '#00ffd5', marginBottom: 4 }}>
                {(stats.tokens_today / 1000).toFixed(0)}K
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Tokens Today</div>
            </div>
            <div style={{
              background: 'rgba(180,77,255,0.08)',
              border: '1px solid rgba(180,77,255,0.2)',
              borderRadius: 8,
              padding: '12px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 18, color: '#b44dff', marginBottom: 4 }}>
                {(stats.tokens_month / 1000000).toFixed(1)}M
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Tokens This Month</div>
            </div>
          </div>
        )}

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
          Build a mech that grows with every line of code. Train with MiMo-powered AI challenges,
          duel rivals in turn-based combat, and evolve from scrap Frame to legendary Titan.
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

      {/* ==================== EVOLUTION SHOWCASE ==================== */}
      <section style={{
        padding: '80px 20px 100px',
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 'clamp(14px, 2.5vw, 22px)',
          color: '#00ffd5',
          marginBottom: 8,
        }} className="text-gradient-rainbow">
          Evolution Path
        </h2>
        <p style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 9,
          color: '#666',
          marginBottom: 60,
          lineHeight: 2,
        }}>
          Your mech evolves as you code. 5 stages from scrap to legend.
        </p>

        {/* Evolution timeline - horizontal on desktop, grid on mobile */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 0,
          maxWidth: 1100,
          margin: '0 auto',
          flexWrap: 'wrap',
        }}>
          {evolutionStages.map((stage, i) => (
            <div key={stage.name} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <EvolutionStage stage={stage} index={i} />
              {i < evolutionStages.length - 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center',
                  height: 120,
                  padding: '0 4px',
                }}>
                  <svg width="40" height="20" viewBox="0 0 40 20" style={{ marginTop: 40 }}>
                    <defs>
                      <linearGradient id={`arrow-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={evolutionStages[i].color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={evolutionStages[i + 1].color} stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="10" x2="28" y2="10" stroke={`url(#arrow-grad-${i})`} strokeWidth="2" strokeDasharray="4 3" />
                    <polygon points="28,4 40,10 28,16" fill={evolutionStages[i + 1].color} opacity="0.7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
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
            description="Chat with your bot's AI-powered engineer, powered by Xiaomi MiMo V2.5 Pro. Get coding advice, debug help, and personalized training recommendations."
            color="#00ffd5"
          />
          <FeatureCard
            icon="⚔️"
            title="Mech Duels"
            description="Challenge other developers to turn-based mech combat! Use your bot's ATK, DEF, and SPD stats. Win duels to earn Parts + Tokens."
            color="#ff2d78"
          />
          <FeatureCard
            icon="🏰"
            title="Squad Wars"
            description="Join or create a squad with fellow developers. Compete in team-based squad wars and climb the leaderboard together!"
            color="#b44dff"
          />
          <FeatureCard
            icon="🧬"
            title="Evolution System"
            description="Your bot evolves through 5 stages as you code — from a humble Frame to a mighty Legend. Watch it grow with every commit."
            color="#39ff14"
          />
          <FeatureCard
            icon="🎨"
            title="Paint Shop"
            description="Customize your mech with unique skins, colors, and accessories. Stand out on the battlefield with your signature look."
            color="#ffd700"
          />
          <FeatureCard
            icon="🏆"
            title="Leaderboard"
            description="Global rankings across all builders. Compete for the top spot in XP, duel wins, and squad strength. Glory awaits!"
            color="#ff9800"
          />
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section style={{
        padding: '80px 20px',
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 'clamp(14px, 2.5vw, 20px)',
          color: '#00ffd5',
          marginBottom: 60,
        }}>
          How It Works
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 0,
          maxWidth: 900,
          margin: '0 auto',
          flexWrap: 'wrap',
        }}>
          {howItWorksSteps.map((step, i) => (
            <div key={step.title} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{
                flex: 1,
                minWidth: 200,
                maxWidth: 260,
                padding: '0 16px',
                opacity: 1,
              }}>
                {/* Step number */}
                <div style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 28,
                  color: step.color,
                  textShadow: `0 0 20px ${step.color}44`,
                  marginBottom: 16,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                {/* Step icon */}
                <div style={{ fontSize: 40, marginBottom: 16 }}>{step.icon}</div>
                {/* Step title */}
                <h3 style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 11,
                  color: step.color,
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}>
                  {step.title}
                </h3>
                {/* Step desc */}
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
              {/* Arrow connector */}
              {i < howItWorksSteps.length - 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center',
                  paddingTop: 28,
                  color: '#333',
                  fontSize: 24,
                }}>
                  <span style={{ fontFamily: "var(--font-pixel)" }}>→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
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

      {/* ==================== FOOTER ==================== */}
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

/* ==================== EVOLUTION STAGES DATA ==================== */
const evolutionStages = [
  { name: 'Frame', level: 'Lv 1', color: '#666', desc: 'Basic chassis' },
  { name: 'Chassis', level: 'Lv 5', color: '#00ffd5', desc: 'Arms & legs' },
  { name: 'Armor', level: 'Lv 15', color: '#b44dff', desc: 'Armored up' },
  { name: 'Full Mech', level: 'Lv 25', color: '#ff2d78', desc: 'Battle ready' },
  { name: 'Legend', level: 'Lv 40', color: '#ffd700', desc: 'Titan class' },
];

const howItWorksSteps = [
  { icon: '🤖', title: 'Create Your Bot', desc: 'Register and spawn your unique mech from a basic Frame chassis.', color: '#00ffd5' },
  { icon: '⌨️', title: 'Code & Commit', desc: 'Write code, push commits, solve AI challenges to earn XP and level up.', color: '#39ff14' },
  { icon: '⚔️', title: 'Evolve & Battle', desc: 'Your bot evolves as you level up. Duel rivals and conquer squad wars.', color: '#ff2d78' },
];

/* ==================== EVOLUTION STAGE COMPONENT ==================== */
function EvolutionStage({ stage, index }: { stage: typeof evolutionStages[number]; index: number }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 130,
      padding: '0 8px',
      animation: `card-slide-in 0.6s ease ${0.2 + index * 0.15}s both`,
    }}>
      {/* Robot SVG per stage */}
      <div style={{
        marginBottom: 16,
        filter: `drop-shadow(0 0 12px ${stage.color}44)`,
        animation: `bounce-soft ${2.5 + index * 0.3}s ease-in-out infinite`,
        animationDelay: `${index * 0.2}s`,
      }}>
        <EvolutionBotSVG stage={index} color={stage.color} />
      </div>
      {/* Stage name */}
      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 9,
        color: stage.color,
        marginBottom: 4,
        lineHeight: 1.6,
        textShadow: `0 0 8px ${stage.color}44`,
      }}>
        {stage.name}
      </div>
      {/* Level badge */}
      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 7,
        color: '#555',
        padding: '3px 10px',
        border: `1px solid ${stage.color}33`,
        borderRadius: 3,
        background: `${stage.color}0a`,
      }}>
        {stage.level}
      </div>
    </div>
  );
}

/* ==================== EVOLUTION BOT SVGs ==================== */
function EvolutionBotSVG({ stage, color }: { stage: number; color: string }) {
  if (stage === 0) {
    // Frame: tiny simple bot (head + body only)
    return (
      <svg width="80" height="100" viewBox="0 0 80 100" style={{ imageRendering: 'pixelated' }}>
        {/* Head */}
        <rect x="20" y="10" width="40" height="30" rx="4" fill="#3a3f5c" />
        <rect x="24" y="14" width="32" height="22" rx="3" fill="#5a6080" />
        {/* Eyes */}
        <rect x="30" y="20" width="8" height="6" rx="1" fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="42" y="20" width="8" height="6" rx="1" fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </rect>
        {/* Body */}
        <rect x="22" y="44" width="36" height="40" rx="4" fill="#3a3f5c" />
        <rect x="26" y="48" width="28" height="32" rx="3" fill="#5a6080" />
        {/* Center light */}
        <circle cx="40" cy="64" r="4" fill={color} opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (stage === 1) {
    // Chassis: add arms and basic legs
    return (
      <svg width="90" height="120" viewBox="0 0 90 120" style={{ imageRendering: 'pixelated' }}>
        {/* Head */}
        <rect x="25" y="8" width="40" height="28" rx="4" fill="#3a3f5c" />
        <rect x="29" y="12" width="32" height="20" rx="3" fill="#5a6080" />
        {/* Eyes */}
        <rect x="34" y="16" width="8" height="6" rx="1" fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="48" y="16" width="8" height="6" rx="1" fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </rect>
        {/* Mouth */}
        <rect x="36" y="26" width="18" height="3" fill="#0a0e1a" />
        {/* Neck */}
        <rect x="38" y="36" width="14" height="6" fill="#1a1e30" />
        {/* Body */}
        <rect x="22" y="42" width="46" height="36" rx="4" fill="#3a3f5c" />
        <rect x="26" y="46" width="38" height="28" rx="3" fill="#5a6080" />
        <circle cx="45" cy="60" r="5" fill={color} opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* Left arm */}
        <rect x="8" y="44" width="10" height="28" rx="3" fill="#3a3f5c" />
        <rect x="8" y="72" width="14" height="8" rx="3" fill="#5a6080" />
        {/* Right arm */}
        <rect x="72" y="44" width="10" height="28" rx="3" fill="#3a3f5c" />
        <rect x="68" y="72" width="14" height="8" rx="3" fill="#5a6080" />
        {/* Left leg */}
        <rect x="28" y="78" width="14" height="20" rx="3" fill="#3a3f5c" />
        <rect x="24" y="98" width="20" height="8" rx="3" fill="#5a6080" />
        {/* Right leg */}
        <rect x="48" y="78" width="14" height="20" rx="3" fill="#3a3f5c" />
        <rect x="46" y="98" width="20" height="8" rx="3" fill="#5a6080" />
      </svg>
    );
  }

  if (stage === 2) {
    // Armor: shoulder pads and visor
    return (
      <svg width="100" height="120" viewBox="0 0 100 120" style={{ imageRendering: 'pixelated' }}>
        {/* Antenna */}
        <rect x="47" y="2" width="6" height="10" fill="#5a6080" />
        <circle cx="50" cy="4" r="3" fill={color} opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Head */}
        <rect x="25" y="12" width="50" height="30" rx="5" fill="#3a3f5c" />
        <rect x="29" y="16" width="42" height="22" rx="3" fill="#5a6080" />
        {/* Visor */}
        <rect x="30" y="20" width="40" height="12" rx="3" fill="#0a0e1a" />
        <rect x="32" y="22" width="36" height="8" rx="2" fill={color} opacity="0.15" />
        {/* Eyes behind visor */}
        <rect x="36" y="23" width="8" height="6" rx="1" fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="56" y="23" width="8" height="6" rx="1" fill={color}>
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </rect>
        {/* Neck */}
        <rect x="40" y="42" width="20" height="6" fill="#1a1e30" />
        {/* Body */}
        <rect x="22" y="48" width="56" height="38" rx="5" fill="#3a3f5c" />
        <rect x="26" y="52" width="48" height="30" rx="4" fill="#5a6080" />
        <circle cx="50" cy="67" r="6" fill={color} opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* Shoulder pads */}
        <rect x="8" y="46" width="22" height="14" rx="5" fill="#4a5070" />
        <rect x="70" y="46" width="22" height="14" rx="5" fill="#4a5070" />
        {/* Left arm */}
        <rect x="10" y="60" width="12" height="24" rx="4" fill="#3a3f5c" />
        <rect x="8" y="84" width="16" height="8" rx="3" fill="#5a6080" />
        {/* Right arm */}
        <rect x="78" y="60" width="12" height="24" rx="4" fill="#3a3f5c" />
        <rect x="76" y="84" width="16" height="8" rx="3" fill="#5a6080" />
        {/* Legs */}
        <rect x="30" y="86" width="16" height="16" rx="4" fill="#3a3f5c" />
        <rect x="26" y="102" width="22" height="8" rx="4" fill="#5a6080" />
        <rect x="54" y="86" width="16" height="16" rx="4" fill="#3a3f5c" />
        <rect x="52" y="102" width="22" height="8" rx="4" fill="#5a6080" />
      </svg>
    );
  }

  if (stage === 3) {
    // Full Mech: chest reactor, larger
    return (
      <svg width="110" height="130" viewBox="0 0 110 130" style={{ imageRendering: 'pixelated' }}>
        {/* Antenna */}
        <rect x="51" y="0" width="8" height="12" fill="#5a6080" />
        <rect x="47" y="0" width="16" height="5" rx="2" fill="#ff3d00" />
        <circle cx="55" cy="4" r="3" fill="#ff3d00" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Head */}
        <rect x="28" y="12" width="54" height="32" rx="5" fill="#3a3f5c" />
        <rect x="32" y="16" width="46" height="24" rx="4" fill="#5a6080" />
        {/* Visor */}
        <rect x="33" y="20" width="44" height="14" rx="4" fill="#0a0e1a" />
        <rect x="35" y="22" width="40" height="10" rx="3" fill={color} opacity="0.15" />
        {/* Eyes */}
        <rect x="39" y="24" width="12" height="8" rx="2" fill={color}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="59" y="24" width="12" height="8" rx="2" fill={color}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </rect>
        {/* Mouth grill */}
        <rect x="42" y="38" width="26" height="3" fill="#0a0e1a" />
        <rect x="42" y="42" width="26" height="3" fill="#0a0e1a" />
        {/* Neck */}
        <rect x="44" y="44" width="22" height="6" fill="#1a1e30" />
        {/* Torso */}
        <rect x="22" y="50" width="66" height="44" rx="6" fill="#3a3f5c" />
        <rect x="26" y="54" width="58" height="36" rx="5" fill="#5a6080" />
        {/* Chest reactor - big */}
        <circle cx="55" cy="72" r="10" fill="#0a0e1a" />
        <circle cx="55" cy="72" r="7" fill={color} opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="r" values="7;5;7" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="72" r="3" fill="white" opacity="0.4" />
        {/* Chest lines */}
        <rect x="30" y="84" width="50" height="3" fill="#1a1e30" />
        {/* Shoulder pads - large */}
        <rect x="4" y="48" width="26" height="16" rx="6" fill="#4a5070" />
        <rect x="80" y="48" width="26" height="16" rx="6" fill="#4a5070" />
        {/* Shoulder accents */}
        <rect x="8" y="52" width="8" height="3" rx="1" fill={color} opacity="0.3" />
        <rect x="94" y="52" width="8" height="3" rx="1" fill={color} opacity="0.3" />
        {/* Left arm */}
        <rect x="8" y="64" width="14" height="28" rx="4" fill="#3a3f5c" />
        <rect x="6" y="92" width="18" height="10" rx="4" fill="#5a6080" />
        {/* Right arm */}
        <rect x="88" y="64" width="14" height="28" rx="4" fill="#3a3f5c" />
        <rect x="86" y="92" width="18" height="10" rx="4" fill="#5a6080" />
        {/* Legs */}
        <rect x="30" y="94" width="18" height="18" rx="4" fill="#3a3f5c" />
        <rect x="24" y="112" width="26" height="10" rx="5" fill="#5a6080" />
        <rect x="62" y="94" width="18" height="18" rx="4" fill="#3a3f5c" />
        <rect x="60" y="112" width="26" height="10" rx="5" fill="#5a6080" />
        {/* Visor glow */}
        <rect x="33" y="20" width="44" height="14" rx="4" fill={color} opacity="0.06">
          <animate attributeName="opacity" values="0.06;0.15;0.06" dur="2s" repeatCount="indefinite" />
        </rect>
      </svg>
    );
  }

  // stage === 4: Legend - large robot with crown/horns, dual reactors
  return (
    <svg width="120" height="140" viewBox="0 0 120 140" style={{ imageRendering: 'pixelated' }}>
      {/* Crown / Horns */}
      <rect x="35" y="0" width="8" height="16" rx="2" fill="#ffd700" />
      <rect x="56" y="0" width="8" height="16" rx="2" fill="#ffd700" />
      <rect x="77" y="0" width="8" height="16" rx="2" fill="#ffd700" />
      <rect x="31" y="0" width="58" height="5" rx="2" fill="#ffd700" />
      {/* Crown gems */}
      <circle cx="39" cy="8" r="2" fill={color}>
        <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="8" r="2" fill={color}>
        <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
      </circle>
      <circle cx="81" cy="8" r="2" fill={color}>
        <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
      </circle>
      {/* Antenna */}
      <rect x="57" y="12" width="6" height="8" fill="#5a6080" />
      <circle cx="60" cy="12" r="4" fill={color} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="4;3;4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Head */}
      <rect x="30" y="20" width="60" height="36" rx="6" fill="#3a3f5c" />
      <rect x="34" y="24" width="52" height="28" rx="5" fill="#5a6080" />
      {/* Visor */}
      <rect x="35" y="28" width="50" height="16" rx="4" fill="#0a0e1a" />
      <rect x="37" y="30" width="46" height="12" rx="3" fill={color} opacity="0.15" />
      {/* Eyes */}
      <rect x="41" y="32" width="14" height="8" rx="2" fill={color}>
        <animate attributeName="opacity" values="1;0.6;1" dur="1.8s" repeatCount="indefinite" />
      </rect>
      <rect x="65" y="32" width="14" height="8" rx="2" fill={color}>
        <animate attributeName="opacity" values="1;0.6;1" dur="1.8s" repeatCount="indefinite" begin="0.25s" />
      </rect>
      {/* Visor glow */}
      <rect x="35" y="28" width="50" height="16" rx="4" fill={color} opacity="0.06">
        <animate attributeName="opacity" values="0.06;0.2;0.06" dur="2s" repeatCount="indefinite" />
      </rect>
      {/* Mouth */}
      <rect x="45" y="46" width="30" height="3" fill="#0a0e1a" />
      <rect x="45" y="50" width="30" height="3" fill="#0a0e1a" />
      {/* Neck */}
      <rect x="48" y="56" width="24" height="8" fill="#1a1e30" />
      {/* Torso */}
      <rect x="22" y="64" width="76" height="48" rx="7" fill="#3a3f5c" />
      <rect x="26" y="68" width="68" height="40" rx="6" fill="#5a6080" />
      {/* Dual chest reactors */}
      <circle cx="44" cy="86" r="8" fill="#0a0e1a" />
      <circle cx="44" cy="86" r="6" fill={color} opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="6;4;6" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="44" cy="86" r="2" fill="white" opacity="0.5" />
      <circle cx="76" cy="86" r="8" fill="#0a0e1a" />
      <circle cx="76" cy="86" r="6" fill={color} opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.4s" repeatCount="indefinite" begin="0.7s" />
        <animate attributeName="r" values="6;4;6" dur="1.4s" repeatCount="indefinite" begin="0.7s" />
      </circle>
      <circle cx="76" cy="86" r="2" fill="white" opacity="0.5" />
      {/* Chest detail lines */}
      <rect x="30" y="100" width="60" height="3" fill="#1a1e30" />
      {/* Shoulder pads - extra large */}
      <rect x="2" y="62" width="28" height="18" rx="7" fill="#4a5070" />
      <rect x="90" y="62" width="28" height="18" rx="7" fill="#4a5070" />
      {/* Shoulder horn accents */}
      <rect x="6" y="58" width="6" height="8" rx="2" fill="#ffd700" opacity="0.7" />
      <rect x="108" y="58" width="6" height="8" rx="2" fill="#ffd700" opacity="0.7" />
      {/* Shoulder glow */}
      <rect x="6" y="66" width="8" height="3" rx="1" fill={color} opacity="0.3" />
      <rect x="106" y="66" width="8" height="3" rx="1" fill={color} opacity="0.3" />
      {/* Left arm */}
      <rect x="4" y="80" width="16" height="30" rx="5" fill="#3a3f5c" />
      <rect x="2" y="110" width="20" height="12" rx="5" fill="#5a6080" />
      {/* Right arm */}
      <rect x="100" y="80" width="16" height="30" rx="5" fill="#3a3f5c" />
      <rect x="98" y="110" width="20" height="12" rx="5" fill="#5a6080" />
      {/* Legs */}
      <rect x="32" y="112" width="20" height="16" rx="5" fill="#3a3f5c" />
      <rect x="26" y="128" width="28" height="10" rx="5" fill="#5a6080" />
      <rect x="68" y="112" width="20" height="16" rx="5" fill="#3a3f5c" />
      <rect x="66" y="128" width="28" height="10" rx="5" fill="#5a6080" />
      {/* Particle effects - floating dots */}
      <circle cx="20" cy="50" r="2" fill={color} opacity="0">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;30;10" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="55" r="2" fill={color} opacity="0">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="cy" values="55;35;15" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="15" cy="75" r="1.5" fill="#ffd700" opacity="0">
        <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" begin="1s" />
        <animate attributeName="cy" values="75;50;25" dur="3s" repeatCount="indefinite" begin="1s" />
      </circle>
      <circle cx="105" cy="70" r="1.5" fill="#ffd700" opacity="0">
        <animate attributeName="opacity" values="0;0.6;0" dur="2.8s" repeatCount="indefinite" begin="1.5s" />
        <animate attributeName="cy" values="70;45;20" dur="2.8s" repeatCount="indefinite" begin="1.5s" />
      </circle>
    </svg>
  );
}

/* ==================== HERO PET COMPONENT ==================== */
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

/* ==================== FEATURE CARD ==================== */
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

/* ==================== STAT BOX ==================== */
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
