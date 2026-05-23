'use client';

import { EvolutionStage, PetMood } from '@/lib/pet';

export interface SkinData {
  palette?: { body?: string; eye?: string; accent?: string; glow?: string };
  accessory?: string | null;
  animation?: string | null;
}

interface PixelPetProps {
  stage: EvolutionStage;
  mood: PetMood;
  level: number;
  size?: 'sm' | 'md' | 'lg';
  skin?: SkinData;
}

export default function PixelPet({ stage, mood, level, size = 'lg', skin }: PixelPetProps) {
  const sizeMap = { sm: 80, md: 120, lg: 180 };
  const s = sizeMap[size];
  const scale = s / 180;

  const animationClass = skin?.animation ? `skin-anim-${skin.animation}` : '';

  return (
    <div
      className={animationClass}
      style={{
        width: s,
        height: s,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {stage === 'legend' && <Particles scale={scale} />}

      <div
        style={{
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {stage === 'egg' && <EggPet mood={mood} level={level} skin={skin} />}
        {stage === 'baby' && <BabyPet mood={mood} skin={skin} />}
        {stage === 'junior' && <JuniorPet mood={mood} skin={skin} />}
        {stage === 'senior' && <SeniorPet mood={mood} skin={skin} />}
        {stage === 'legend' && <LegendPet mood={mood} skin={skin} />}

        {skin?.accessory && <Accessory type={skin.accessory} />}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -8 * scale,
          right: 4 * scale,
          background: 'linear-gradient(135deg, #ffd700, #ff9500)',
          color: '#0a0a0f',
          fontFamily: "var(--font-pixel)",
          fontSize: Math.max(7, 9 * scale),
          padding: `${2 * scale}px ${6 * scale}px`,
          borderRadius: 4 * scale,
          fontWeight: 'bold',
          letterSpacing: 1,
          boxShadow: '0 0 8px rgba(255,215,0,0.4)',
        }}
      >
        LV.{level}
      </div>
    </div>
  );
}

function Accessory({ type }: { type: string }) {
  switch (type) {
    case 'crown':
      return (
        <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '16px solid #ffd700' }} />
            <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '22px solid #ffd700', marginTop: -6 }} />
            <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '16px solid #ffd700' }} />
          </div>
          <div style={{ width: 36, height: 6, background: '#ffd700', margin: '0 auto' }} />
        </div>
      );
    case 'halo':
      return (
        <div style={{
          position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
          width: 50, height: 16, borderRadius: '50%',
          border: '3px solid #ffd700',
          boxShadow: '0 0 10px rgba(255,215,0,0.6)',
          animation: 'float 2s ease-in-out infinite',
        }} />
      );
    case 'cape':
      return (
        <div style={{
          position: 'absolute', top: 20, right: -30,
          width: 0, height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '30px solid #cc1155',
          borderRight: '25px solid transparent',
          borderLeft: '10px solid #cc1155',
          opacity: 0.8,
        }} />
      );
    case 'scarf':
      return (
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          width: 70, height: 12, borderRadius: 6,
          background: 'linear-gradient(90deg, #ff2d78, #ff6b9d)',
          border: '1px solid #ff2d78',
        }} />
      );
    default:
      return null;
  }
}

function Particles({ scale }: { scale: number }) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    x: Math.cos((i * Math.PI * 2) / 8) * 60,
    y: Math.sin((i * Math.PI * 2) / 8) * 60,
    delay: i * 0.15,
    color: ['#00e5ff', '#76ff03', '#ffd700', '#ff3d00'][i % 4],
  }));

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 6 * scale,
            height: 6 * scale,
            borderRadius: '50%',
            background: p.color,
            transform: `translate(${p.x}px, ${p.y}px)`,
            animation: `legendParticle 1.5s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </>
  );
}

/* ──────────────────── EGG = ROBOT CAPSULE ──────────────────── */
function EggPet({ mood, level, skin }: { mood: PetMood; level: number; skin?: SkinData }) {
  const isHatching = level >= 4;
  const isHeavyHatch = level >= 5;
  const crackIntensity = level >= 5 ? 1 : (level - 3) * 0.5;

  const shakeStyle = isHeavyHatch
    ? { animation: 'egg-shake-heavy 0.3s ease-in-out infinite' }
    : isHatching
      ? { animation: 'egg-shake-light 0.6s ease-in-out infinite' }
      : { animation: 'egg-rock 1.5s ease-in-out infinite' };

  const glowIntensity = isHeavyHatch ? 0.6 : isHatching ? 0.3 : 0.15;
  const glowColor = isHeavyHatch ? '255,215,0' : '0,229,255';

  const body = skin?.palette?.body ?? '#3a3f5c';
  const accent = skin?.palette?.accent ?? '#5a6080';
  const visor = skin?.palette?.glow ?? '#00e5ff';

  return (
    <div style={{ position: 'relative', ...shakeStyle }}>
      <svg width="140" height="170" viewBox="0 0 140 170" style={{ imageRendering: 'pixelated' }}>
        {/* Base capsule */}
        <rect x="30" y="30" width="80" height="110" rx="20" fill={body} />
        <rect x="36" y="36" width="68" height="98" rx="16" fill={accent} />
        {/* Visor slit */}
        <rect x="45" y="70" width="50" height="16" rx="4" fill={visor} opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </rect>
        {/* Panel lines */}
        <rect x="50" y="50" width="40" height="4" rx="2" fill={body} opacity="0.6" />
        <rect x="50" y="120" width="40" height="4" rx="2" fill={body} opacity="0.6" />
        {/* Antenna nub */}
        <rect x="64" y="18" width="12" height="16" rx="3" fill={accent} />
        <circle cx="70" cy="18" r="5" fill={visor} opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
        </circle>
        {/* Cracks */}
        {isHatching && (
          <g opacity={crackIntensity}>
            <line x1="38" y1="60" x2="55" y2="80" stroke={visor} strokeWidth="2" />
            <line x1="55" y1="80" x2="48" y2="100" stroke={visor} strokeWidth="2" />
            {isHeavyHatch && (
              <>
                <line x1="90" y1="55" x2="78" y2="75" stroke={visor} strokeWidth="2" />
                <line x1="78" y1="75" x2="88" y2="95" stroke={visor} strokeWidth="2" />
              </>
            )}
          </g>
        )}
        {/* Glow */}
        <rect x="30" y="30" width="80" height="110" rx="20" fill={visor} opacity={glowIntensity}>
          <animate attributeName="opacity" values={`${glowIntensity};${glowIntensity * 0.5};${glowIntensity}`} dur="2s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

/* ──────────────────── BABY = SMALL ROBOT ──────────────────── */
function BabyPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const eyes = mood === 'sleepy' ? '−' : '●';
  const body = skin?.palette?.body ?? '#3a3f5c';
  const accent = skin?.palette?.accent ?? '#5a6080';
  const visor = skin?.palette?.glow ?? '#00e5ff';
  const eyeColor = skin?.palette?.eye ?? '#ff3d00';

  return (
    <div style={{
      animation: mood === 'happy' ? 'float 2s ease-in-out infinite' : undefined,
    }}>
      <svg width="140" height="170" viewBox="0 0 140 170" style={{ imageRendering: 'pixelated' }}>
        {/* Antenna */}
        <rect x="64" y="14" width="12" height="14" rx="3" fill={accent} />
        <circle cx="70" cy="14" r="5" fill={visor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Head */}
        <rect x="38" y="28" width="64" height="48" rx="10" fill={body} />
        <rect x="42" y="32" width="56" height="40" rx="8" fill={accent} />
        {/* Visor */}
        <rect x="46" y="40" width="48" height="18" rx="4" fill="#0a0e1a" />
        {/* Eyes */}
        <text x="58" y="55" fill={eyeColor} fontSize="14" fontFamily="monospace" textAnchor="middle">{eyes}</text>
        <text x="82" y="55" fill={eyeColor} fontSize="14" fontFamily="monospace" textAnchor="middle">{eyes}</text>
        {/* Mouth grill */}
        <rect x="56" y="62" width="28" height="3" fill="#0a0e1a" />
        <rect x="56" y="67" width="28" height="3" fill="#0a0e1a" />
        {/* Body */}
        <rect x="42" y="80" width="56" height="44" rx="8" fill={body} />
        <rect x="46" y="84" width="48" height="36" rx="6" fill={accent} />
        {/* Chest light */}
        <circle cx="70" cy="102" r="6" fill="#76ff03" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* Arms */}
        <rect x="24" y="84" width="14" height="32" rx="4" fill={body} />
        <rect x="26" y="86" width="10" height="28" rx="3" fill={accent} />
        <rect x="102" y="84" width="14" height="32" rx="4" fill={body} />
        <rect x="104" y="86" width="10" height="28" rx="3" fill={accent} />
        {/* Legs */}
        <rect x="48" y="124" width="18" height="24" rx="4" fill={body} />
        <rect x="50" y="126" width="14" height="20" rx="3" fill={accent} />
        <rect x="74" y="124" width="18" height="24" rx="4" fill={body} />
        <rect x="76" y="126" width="14" height="20" rx="3" fill={accent} />
        {/* Feet */}
        <rect x="44" y="148" width="26" height="10" rx="4" fill={accent} />
        <rect x="70" y="148" width="26" height="10" rx="4" fill={accent} />
      </svg>
    </div>
  );
}

/* ──────────────────── JUNIOR = MEDIUM MECH ──────────────────── */
function JuniorPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const eyes = mood === 'sleepy' ? '−' : '★';
  const body = skin?.palette?.body ?? '#4a2f8c';
  const accent = skin?.palette?.accent ?? '#6b42b8';
  const visor = skin?.palette?.glow ?? '#00e5ff';
  const eyeColor = skin?.palette?.eye ?? '#76ff03';

  return (
    <div style={{
      animation: mood === 'happy' ? 'float 2s ease-in-out infinite' : undefined,
    }}>
      <svg width="160" height="180" viewBox="0 0 160 180" style={{ imageRendering: 'pixelated' }}>
        {/* Antenna array */}
        <rect x="72" y="6" width="4" height="18" fill={accent} />
        <rect x="84" y="6" width="4" height="18" fill={accent} />
        <rect x="74" y="2" width="12" height="8" rx="2" fill={eyeColor} opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" />
        </rect>
        {/* Head — angular */}
        <polygon points="80,20 120,36 120,68 40,68 40,36" fill={body} />
        <polygon points="80,24 114,38 114,64 46,64 46,38" fill={accent} />
        {/* Visor */}
        <rect x="48" y="40" width="64" height="16" rx="3" fill="#0a0e1a" />
        <rect x="50" y="42" width="60" height="12" rx="2" fill={visor} opacity="0.12" />
        {/* Eyes — wider */}
        <rect x="54" y="44" width="18" height="8" rx="2" fill={eyeColor}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="88" y="44" width="18" height="8" rx="2" fill={eyeColor}>
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </rect>
        {/* Jaw grill */}
        <rect x="56" y="60" width="48" height="3" fill="#0a0e1a" />
        <rect x="60" y="64" width="40" height="2" fill="#0a0e1a" />
        {/* Neck */}
        <rect x="70" y="68" width="20" height="8" fill="#1a1e30" />
        {/* Torso */}
        <rect x="36" y="76" width="88" height="50" rx="6" fill={body} />
        <rect x="40" y="80" width="80" height="42" rx="4" fill={accent} />
        {/* Chest plate */}
        <rect x="54" y="84" width="52" height="20" rx="4" fill={body} />
        <circle cx="80" cy="94" r="7" fill="#76ff03" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="r" values="7;5;7" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* Chest detail */}
        <rect x="58" y="108" width="44" height="3" fill="#1a1e30" />
        {/* Shoulder pads */}
        <rect x="20" y="74" width="22" height="14" rx="4" fill={accent} />
        <rect x="118" y="74" width="22" height="14" rx="4" fill={accent} />
        <circle cx="26" cy="81" r="3" fill="#1a1e30" />
        <circle cx="134" cy="81" r="3" fill="#1a1e30" />
        {/* Arms */}
        <rect x="16" y="88" width="18" height="36" rx="4" fill={body} />
        <rect x="18" y="90" width="14" height="32" rx="3" fill={accent} />
        <rect x="126" y="88" width="18" height="36" rx="4" fill={body} />
        <rect x="128" y="90" width="14" height="32" rx="3" fill={accent} />
        {/* Hands */}
        <rect x="14" y="124" width="22" height="12" rx="4" fill={body} />
        <rect x="124" y="124" width="22" height="12" rx="4" fill={body} />
        {/* Legs */}
        <rect x="46" y="126" width="24" height="28" rx="4" fill={body} />
        <rect x="48" y="128" width="20" height="24" rx="3" fill={accent} />
        <rect x="90" y="126" width="24" height="28" rx="4" fill={body} />
        <rect x="92" y="128" width="20" height="24" rx="3" fill={accent} />
        {/* Feet */}
        <rect x="40" y="154" width="34" height="12" rx="4" fill={accent} />
        <rect x="86" y="154" width="34" height="12" rx="4" fill={accent} />
      </svg>
    </div>
  );
}

/* ──────────────────── SENIOR = ADVANCED MECH ──────────────────── */
function SeniorPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const eyes = mood === 'sleepy' ? '−' : '◆';
  const body = skin?.palette?.body ?? '#8b1a1a';
  const accent = skin?.palette?.accent ?? '#cc2244';
  const visor = skin?.palette?.glow ?? '#ff3d00';
  const eyeColor = skin?.palette?.eye ?? '#00e5ff';

  return (
    <div style={{
      animation: mood === 'happy' ? 'float 2s ease-in-out infinite' : undefined,
    }}>
      <svg width="170" height="185" viewBox="0 0 170 185" style={{ imageRendering: 'pixelated' }}>
        {/* Horns / antenna */}
        <polygon points="50,30 44,8 58,22" fill={accent} />
        <polygon points="120,30 126,8 112,22" fill={accent} />
        {/* Central antenna */}
        <rect x="82" y="4" width="6" height="20" fill={body} />
        <circle cx="85" cy="4" r="4" fill={visor}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
        {/* Head — V-shaped */}
        <polygon points="85,22 130,40 130,72 40,72 40,40" fill={body} />
        <polygon points="85,26 126,42 126,68 44,68 44,42" fill={accent} />
        {/* Face plate */}
        <rect x="48" y="42" width="74" height="22" rx="3" fill="#0a0e1a" />
        <rect x="50" y="44" width="70" height="18" rx="2" fill={visor} opacity="0.1" />
        {/* Eyes — sharp diamonds */}
        <polygon points="62,53 70,45 78,53 70,61" fill={eyeColor}>
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </polygon>
        <polygon points="92,53 100,45 108,53 100,61" fill={eyeColor}>
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
        </polygon>
        {/* Jaw */}
        <rect x="52" y="66" width="66" height="4" fill="#0a0e1a" />
        {/* Neck — thick */}
        <rect x="70" y="72" width="30" height="10" fill="#1a1e30" />
        {/* Torso — wide */}
        <polygon points="30,82 140,82 148,136 22,136" fill={body} />
        <polygon points="34,86 136,86 142,132 28,132" fill={accent} />
        {/* Core reactor */}
        <circle cx="85" cy="106" r="10" fill={visor} opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="10;7;10" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="85" cy="106" r="5" fill="white" opacity="0.4" />
        {/* Chest lines */}
        <rect x="50" y="90" width="30" height="3" fill="#1a1e30" />
        <rect x="90" y="90" width="30" height="3" fill="#1a1e30" />
        <rect x="55" y="122" width="60" height="3" fill="#1a1e30" />
        {/* Shoulder armor — large */}
        <polygon points="8,76 36,76 40,98 12,94" fill={accent} />
        <polygon points="134,76 162,76 158,98 128,94" fill={accent} />
        <circle cx="20" cy="86" r="4" fill="#1a1e30" />
        <circle cx="150" cy="86" r="4" fill="#1a1e30" />
        {/* Arms — segmented */}
        <rect x="10" y="98" width="20" height="18" rx="3" fill={body} />
        <rect x="12" y="100" width="16" height="14" rx="2" fill={accent} />
        <rect x="140" y="98" width="20" height="18" rx="3" fill={body} />
        <rect x="142" y="100" width="16" height="14" rx="2" fill={accent} />
        <rect x="8" y="116" width="24" height="14" rx="3" fill={body} />
        <rect x="138" y="116" width="24" height="14" rx="3" fill={body} />
        {/* Fists */}
        <rect x="6" y="130" width="28" height="16" rx="5" fill={accent} />
        <rect x="136" y="130" width="28" height="16" rx="5" fill={accent} />
        {/* Legs — thick */}
        <rect x="38" y="136" width="28" height="24" rx="4" fill={body} />
        <rect x="40" y="138" width="24" height="20" rx="3" fill={accent} />
        <rect x="104" y="136" width="28" height="24" rx="4" fill={body} />
        <rect x="106" y="138" width="24" height="20" rx="3" fill={accent} />
        {/* Knee joints */}
        <circle cx="52" cy="160" r="4" fill="#1a1e30" />
        <circle cx="118" cy="160" r="4" fill="#1a1e30" />
        {/* Feet — armored */}
        <rect x="32" y="160" width="40" height="14" rx="5" fill={accent} />
        <rect x="98" y="160" width="40" height="14" rx="5" fill={accent} />
        {/* Foot glow */}
        <rect x="36" y="170" width="32" height="3" rx="1" fill={visor} opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
        </rect>
        <rect x="102" y="170" width="32" height="3" rx="1" fill={visor} opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

/* ──────────────────── LEGEND = EPIC TITAN MECH ──────────────────── */
function LegendPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const body = skin?.palette?.body ?? '#1a1a2e';
  const accent = skin?.palette?.accent ?? '#ffd700';
  const visor = skin?.palette?.glow ?? '#00e5ff';
  const eyeColor = skin?.palette?.eye ?? '#ff3d00';

  return (
    <div style={{
      animation: 'float 2s ease-in-out infinite',
    }}>
      <svg width="180" height="190" viewBox="0 0 180 190" style={{ imageRendering: 'pixelated' }}>
        {/* Crown / crest */}
        <polygon points="90,0 100,16 80,16" fill={accent} />
        <polygon points="70,8 80,20 60,20" fill={accent} />
        <polygon points="110,8 120,20 100,20" fill={accent} />
        <rect x="56" y="16" width="68" height="6" rx="2" fill={accent} />

        {/* Head — wide angular */}
        <polygon points="90,22 140,42 140,76 40,76 40,42" fill={body} />
        <polygon points="90,26 136,44 136,72 44,72 44,44" fill="#2a2e45" />
        {/* Visor — full width */}
        <rect x="44" y="44" width="92" height="20" rx="4" fill="#0a0e1a" />
        <rect x="46" y="46" width="88" height="16" rx="3" fill={visor} opacity="0.15" />
        {/* Eyes — glowing bars */}
        <rect x="52" y="50" width="28" height="10" rx="2" fill={eyeColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <rect x="100" y="50" width="28" height="10" rx="2" fill={eyeColor}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
        </rect>
        {/* Visor reflection */}
        <rect x="48" y="47" width="40" height="4" rx="2" fill="white" opacity="0.15" />
        {/* Jaw grill */}
        <rect x="56" y="68" width="68" height="3" fill="#0a0e1a" />
        <rect x="60" y="73" width="60" height="2" fill="#0a0e1a" />

        {/* Neck */}
        <rect x="72" y="76" width="36" height="10" fill="#1a1e30" />

        {/* Torso — massive */}
        <polygon points="24,86 156,86 164,148 16,148" fill={body} />
        <polygon points="28,90 152,90 158,144 22,144" fill="#2a2e45" />
        {/* Core — double reactor */}
        <circle cx="70" cy="114" r="10" fill={accent} opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="110" cy="114" r="10" fill={visor} opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <rect x="78" y="110" width="24" height="8" rx="2" fill="white" opacity="0.2" />
        {/* Chest insignia */}
        <polygon points="90,96 96,106 84,106" fill={accent} opacity="0.6" />
        {/* Chest lines */}
        <rect x="36" y="94" width="28" height="3" fill="#1a1e30" />
        <rect x="116" y="94" width="28" height="3" fill="#1a1e30" />
        <rect x="30" y="134" width="120" height="3" fill="#1a1e30" />

        {/* Shoulder armor — massive with glow */}
        <polygon points="2,78 32,78 38,106 6,100" fill={accent} />
        <polygon points="148,78 178,78 174,100 142,106" fill={accent} />
        <circle cx="16" cy="90" r="5" fill={visor} opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="164" cy="90" r="5" fill={visor} opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>

        {/* Arms — armored */}
        <rect x="4" y="106" width="24" height="20" rx="4" fill={body} />
        <rect x="152" y="106" width="24" height="20" rx="4" fill={body} />
        <rect x="2" y="126" width="28" height="16" rx="4" fill={body} />
        <rect x="150" y="126" width="28" height="16" rx="4" fill={body} />
        {/* Fists with glow */}
        <rect x="0" y="142" width="32" height="18" rx="6" fill={accent} />
        <rect x="148" y="142" width="32" height="18" rx="6" fill={accent} />
        <rect x="4" y="152" width="24" height="4" rx="2" fill={visor} opacity="0.3" />
        <rect x="152" y="152" width="24" height="4" rx="2" fill={visor} opacity="0.3" />

        {/* Legs — heavy */}
        <rect x="32" y="148" width="32" height="18" rx="4" fill={body} />
        <rect x="116" y="148" width="32" height="18" rx="4" fill={body} />
        <rect x="28" y="166" width="36" height="14" rx="5" fill={accent} />
        <rect x="116" y="166" width="36" height="14" rx="5" fill={accent} />
        {/* Foot thrusters */}
        <rect x="32" y="178" width="28" height="6" rx="2" fill={visor} opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="0.8s" repeatCount="indefinite" />
        </rect>
        <rect x="120" y="178" width="28" height="6" rx="2" fill={visor} opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
        </rect>
      </svg>
    </div>
  );
}
