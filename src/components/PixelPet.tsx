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
          fontFamily: "'Press Start 2P', monospace",
          fontSize: Math.max(7, 9 * scale),
          padding: `${2 * scale}px ${6 * scale}px`,
          fontWeight: 'bold',
          zIndex: 10,
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
    case 'glasses':
      return (
        <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
          <div style={{ width: 16, height: 12, borderRadius: 4, border: '2px solid #0a0a0f', background: 'rgba(0,0,0,0.2)' }} />
          <div style={{ width: 4, height: 2, background: '#0a0a0f', alignSelf: 'center' }} />
          <div style={{ width: 16, height: 12, borderRadius: 4, border: '2px solid #0a0a0f', background: 'rgba(0,0,0,0.2)' }} />
        </div>
      );
    case 'hat':
      return (
        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 50, height: 4, background: '#39ff14', borderRadius: 2 }} />
          <div style={{ width: 30, height: 20, background: '#39ff14', margin: '0 auto', borderRadius: '4px 4px 0 0' }} />
        </div>
      );
    case 'wings':
      return (
        <>
          <div style={{ position: 'absolute', top: 0, left: -35, zIndex: -1 }}>
            <div style={{
              width: 30, height: 45,
              background: 'linear-gradient(135deg, #00ffd5, #b44dff)',
              borderRadius: '50% 0 0 50%',
              opacity: 0.7,
              animation: 'wing-flap 0.6s ease-in-out infinite',
              transformOrigin: 'right center',
            }} />
          </div>
          <div style={{ position: 'absolute', top: 0, right: -35, zIndex: -1 }}>
            <div style={{
              width: 30, height: 45,
              background: 'linear-gradient(225deg, #39ff14, #ff2d78)',
              borderRadius: '0 50% 50% 0',
              opacity: 0.7,
              animation: 'wing-flap 0.6s ease-in-out infinite 0.3s',
              transformOrigin: 'left center',
            }} />
          </div>
        </>
      );
    case 'aura':
      return (
        <div style={{
          position: 'absolute', inset: -20, borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #00ffd5, #39ff14, #ffd700, #ff2d78, #b44dff, #00ffd5)',
          opacity: 0.15, animation: 'rainbow 3s linear infinite', filter: 'blur(12px)',
          pointerEvents: 'none',
        }} />
      );
    default:
      return null;
  }
}

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
  const glowColor = isHeavyHatch ? '255,215,0' : '0,255,213';
  const bodyGrad = skin?.palette?.body
    ? `linear-gradient(135deg, ${skin.palette.body}, ${skin.palette.body}99)`
    : isHeavyHatch
      ? 'linear-gradient(135deg, #3d3d6b, #5a4a2a)'
      : isHatching
        ? 'linear-gradient(135deg, #2a2a4a, #4a3a5a)'
        : 'linear-gradient(135deg, #2a2a4a, #3d3d6b)';
  const borderColor = skin?.palette?.accent ?? (isHeavyHatch ? '#ffd700' : '#555580');
  const glowVar = skin?.palette?.glow ?? `rgba(${glowColor}, ${glowIntensity})`;
  const spot1 = skin?.palette?.accent ?? '#00ffd5';
  const spot2 = skin?.palette?.glow ?? '#ff2d78';

  return (
    <div
      style={{
        width: 80, height: 100,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        background: bodyGrad,
        border: `3px solid ${borderColor}`,
        position: 'relative',
        ...shakeStyle,
        boxShadow: `0 0 ${20 + level * 10}px ${glowVar}, 0 0 ${40 + level * 15}px ${glowVar}`,
        overflow: 'visible',
      }}
    >
      <div style={{ position: 'absolute', top: 20, left: 15, width: 12, height: 12, borderRadius: '50%', background: spot1, opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 40, right: 18, width: 8, height: 8, borderRadius: '50%', background: spot2, opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: 30, left: 25, width: 10, height: 10, borderRadius: '50%', background: skin?.palette?.accent ?? '#39ff14', opacity: 0.4 }} />

      {isHatching && (
        <>
          <div style={{ position: 'absolute', top: '25%', left: '30%', width: isHeavyHatch ? 30 : 18, height: 2, background: isHeavyHatch ? '#ffd700' : '#aaa', transform: 'rotate(35deg)', opacity: crackIntensity, boxShadow: isHeavyHatch ? '0 0 8px #ffd700' : 'none', animation: isHeavyHatch ? 'crack-glow 0.5s ease-in-out infinite' : 'none' }} />
          <div style={{ position: 'absolute', top: '45%', left: '20%', width: isHeavyHatch ? 35 : 15, height: 2, background: isHeavyHatch ? '#ffd700' : '#999', transform: 'rotate(-15deg)', opacity: crackIntensity, boxShadow: isHeavyHatch ? '0 0 8px #ffd700' : 'none', animation: isHeavyHatch ? 'crack-glow 0.5s ease-in-out infinite 0.2s' : 'none' }} />
          <div style={{ position: 'absolute', top: '35%', right: '25%', width: 2, height: isHeavyHatch ? 25 : 12, background: isHeavyHatch ? '#ffd700' : '#aaa', opacity: crackIntensity * 0.8, boxShadow: isHeavyHatch ? '0 0 8px #ffd700' : 'none' }} />
        </>
      )}

      {isHeavyHatch && (
        <>
          <div style={{ position: 'absolute', top: '55%', left: '35%', width: 25, height: 2, background: '#ffd700', transform: 'rotate(60deg)', boxShadow: '0 0 10px #ffd700', animation: 'crack-glow 0.4s ease-in-out infinite 0.3s' }} />
          <div style={{ position: 'absolute', top: '20%', right: '30%', width: 20, height: 2, background: '#ffd700', transform: 'rotate(-45deg)', boxShadow: '0 0 10px #ffd700', animation: 'crack-glow 0.4s ease-in-out infinite 0.1s' }} />
          <div style={{ position: 'absolute', top: '30%', left: '40%', width: 6, height: 6, borderRadius: '50%', background: '#ffd700', boxShadow: '0 0 12px #ffd700', animation: 'sparkle 1s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '50%', left: '55%', width: 4, height: 4, borderRadius: '50%', background: '#ffd700', boxShadow: '0 0 8px #ffd700', animation: 'sparkle 1s ease-in-out infinite 0.5s' }} />
        </>
      )}

      {mood === 'happy' && !isHatching && (
        <div style={{ position: 'absolute', top: '30%', left: '35%', color: '#ffd700', fontSize: 24, animation: 'sparkle 2s ease-in-out infinite' }}>✨</div>
      )}

      {isHeavyHatch && (
        <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)', animation: 'pulse-glow 1s ease-in-out infinite', pointerEvents: 'none' }} />
      )}
    </div>
  );
}

function BabyPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const eyes = mood === 'sleepy' ? '−' : '●';
  const bodyTop = skin?.palette?.body ?? '#00ffd5';
  const bodyBottom = skin?.palette?.accent ?? '#00b89c';
  const mouthColor = mood === 'happy' ? '#39ff14' : (skin?.palette?.glow ?? '#ffd700');
  const blush = skin?.palette?.glow ?? 'rgba(255,45,120,0.3)';
  const feetColor = skin?.palette?.accent ?? '#008a72';

  return (
    <div style={{ position: 'relative', animation: 'bounce-soft 2s ease-in-out infinite' }}>
      <div
        style={{
          width: 80, height: 70,
          borderRadius: '40% 40% 50% 50%',
          background: `linear-gradient(180deg, ${bodyTop}, ${bodyBottom})`,
          border: `3px solid ${bodyTop}`,
          position: 'relative',
          boxShadow: `0 8px 25px ${bodyTop}40`,
        }}
      >
        <div style={{ position: 'absolute', top: 18, left: 16, width: 14, height: 14, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
          <div className="animate-blink" style={{ color: skin?.palette?.eye ?? '#0a0a0f' }}>{eyes}</div>
        </div>
        <div style={{ position: 'absolute', top: 18, right: 16, width: 14, height: 14, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
          <div className="animate-blink" style={{ color: skin?.palette?.eye ?? '#0a0a0f' }}>{eyes}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: mood === 'happy' ? 20 : 10, height: mood === 'happy' ? 10 : 4, borderRadius: mood === 'happy' ? '0 0 50% 50%' : '0', background: mouthColor }} />
        <div style={{ position: 'absolute', top: 28, left: 6, width: 12, height: 6, borderRadius: '50%', background: blush }} />
        <div style={{ position: 'absolute', top: 28, right: 6, width: 12, height: 6, borderRadius: '50%', background: blush }} />
      </div>
      <div style={{ position: 'absolute', bottom: -8, left: 12, width: 20, height: 10, borderRadius: '50%', background: feetColor }} />
      <div style={{ position: 'absolute', bottom: -8, right: 12, width: 20, height: 10, borderRadius: '50%', background: feetColor }} />
    </div>
  );
}

function JuniorPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const eyes = mood === 'sleepy' ? '−' : '★';
  const bodyColor = skin?.palette?.body ?? '#b44dff';
  const bodyDark = skin?.palette?.accent ?? '#7a2db8';

  return (
    <div style={{ position: 'relative', animation: 'walk 1.5s ease-in-out infinite' }}>
      <div style={{ position: 'absolute', top: 35, left: -18, width: 20, height: 8, borderRadius: 4, background: bodyColor, transform: 'rotate(-20deg)', transformOrigin: 'right center', animation: 'wiggle 0.8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 35, right: -18, width: 20, height: 8, borderRadius: 4, background: bodyColor, transform: 'rotate(20deg)', transformOrigin: 'left center', animation: 'wiggle 0.8s ease-in-out infinite 0.4s' }} />
      <div
        style={{
          width: 100, height: 90,
          borderRadius: '45% 45% 40% 40%',
          background: `linear-gradient(180deg, ${bodyColor}, ${bodyDark})`,
          border: `3px solid ${bodyColor}`,
          position: 'relative',
          boxShadow: `0 8px 30px ${bodyColor}33`,
        }}
      >
        <div style={{ position: 'absolute', top: 22, left: 20, width: 18, height: 18, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
          <div className="animate-blink" style={{ color: skin?.palette?.eye ?? '#0a0a0f', fontWeight: 'bold' }}>{eyes}</div>
        </div>
        <div style={{ position: 'absolute', top: 22, right: 20, width: 18, height: 18, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
          <div className="animate-blink" style={{ color: skin?.palette?.eye ?? '#0a0a0f', fontWeight: 'bold' }}>{eyes}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
          {mood === 'happy' ? (
            <div style={{ width: 24, height: 12, borderRadius: '0 0 50% 50%', background: skin?.palette?.eye ?? '#0a0a0f', border: `2px solid ${bodyColor}` }} />
          ) : (
            <div style={{ width: 20, height: 3, background: skin?.palette?.eye ?? '#0a0a0f', borderRadius: 2 }} />
          )}
        </div>
        <div style={{ position: 'absolute', top: -14, left: '20%', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `16px solid ${bodyColor}` }} />
        <div style={{ position: 'absolute', top: -20, left: '42%', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: `22px solid ${bodyColor}` }} />
        <div style={{ position: 'absolute', top: -14, right: '20%', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `16px solid ${bodyColor}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: -4 }}>
        <div style={{ width: 22, height: 12, borderRadius: '50%', background: bodyDark }} />
        <div style={{ width: 22, height: 12, borderRadius: '50%', background: bodyDark }} />
      </div>
    </div>
  );
}

function SeniorPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const eyes = mood === 'sleepy' ? '−' : '◆';
  const bodyTop = skin?.palette?.body ?? '#ff2d78';
  const bodyBottom = skin?.palette?.accent ?? '#cc1155';
  const glow = skin?.palette?.glow ?? '#ff2d78';

  return (
    <div style={{ position: 'relative', animation: 'float 3s ease-in-out infinite' }}>
      <div style={{
        position: 'absolute', top: 10, left: -10, width: 130, height: 120,
        background: `linear-gradient(180deg, ${bodyTop}, ${skin?.palette?.accent ?? '#b44dff'})`,
        borderRadius: '30% 30% 50% 50%', opacity: 0.7,
        clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 80% 90%, 60% 100%, 40% 90%, 20% 100%, 0% 90%)',
      }} />
      <div
        style={{
          width: 110, height: 100,
          borderRadius: '45% 45% 42% 42%',
          background: `linear-gradient(180deg, ${bodyTop}, ${bodyBottom})`,
          border: `3px solid ${bodyTop}`,
          position: 'relative', zIndex: 2,
          boxShadow: `0 0 30px ${glow}44, 0 0 60px ${glow}22`,
        }}
      >
        <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
          <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `18px solid ${skin?.palette?.accent ?? '#ffd700'}` }} />
          <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: `24px solid ${skin?.palette?.accent ?? '#ffd700'}`, marginTop: -6 }} />
          <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `18px solid ${skin?.palette?.accent ?? '#ffd700'}` }} />
        </div>
        <div style={{ position: 'absolute', top: 26, left: 22, width: 22, height: 22, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
          <div className="animate-blink" style={{ color: skin?.palette?.eye ?? '#0a0a0f', fontWeight: 'bold' }}>{eyes}</div>
        </div>
        <div style={{ position: 'absolute', top: 26, right: 22, width: 22, height: 22, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
          <div className="animate-blink" style={{ color: skin?.palette?.eye ?? '#0a0a0f', fontWeight: 'bold' }}>{eyes}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: mood === 'happy' ? 30 : 20,
            height: mood === 'happy' ? 14 : 4,
            borderRadius: mood === 'happy' ? '0 0 50% 50%' : 2,
            background: skin?.palette?.eye ?? '#0a0a0f', border: `2px solid ${skin?.palette?.accent ?? '#ffd700'}`,
          }} />
        </div>
        <div style={{ position: 'absolute', top: 40, left: -16, width: 18, height: 30, borderRadius: 8, background: bodyBottom, border: `2px solid ${bodyTop}`, transform: 'rotate(-15deg)' }} />
        <div style={{ position: 'absolute', top: 40, right: -16, width: 18, height: 30, borderRadius: 8, background: bodyBottom, border: `2px solid ${bodyTop}`, transform: 'rotate(15deg)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: -4, position: 'relative', zIndex: 2 }}>
        <div style={{ width: 26, height: 14, borderRadius: '50%', background: bodyBottom, border: `2px solid ${bodyTop}` }} />
        <div style={{ width: 26, height: 14, borderRadius: '50%', background: bodyBottom, border: `2px solid ${bodyTop}` }} />
      </div>
    </div>
  );
}

function LegendPet({ mood, skin }: { mood: PetMood; skin?: SkinData }) {
  const bodyTop = skin?.palette?.body ?? '#ffd700';
  const bodyBottom = skin?.palette?.accent ?? '#ff9500';

  return (
    <div style={{ position: 'relative', animation: 'float 3s ease-in-out infinite' }}>
      <div style={{ position: 'absolute', top: -10, left: -40, zIndex: 0 }}>
        <div style={{
          width: 40, height: 60,
          background: `linear-gradient(135deg, ${skin?.palette?.body ?? '#00ffd5'}, ${skin?.palette?.accent ?? '#b44dff'})`,
          borderRadius: '50% 0 0 50%', opacity: 0.7,
          animation: 'wing-flap 0.6s ease-in-out infinite',
          transformOrigin: 'right center',
        }} />
      </div>
      <div style={{ position: 'absolute', top: -10, right: -40, zIndex: 0 }}>
        <div style={{
          width: 40, height: 60,
          background: `linear-gradient(225deg, ${skin?.palette?.accent ?? '#39ff14'}, ${skin?.palette?.glow ?? '#ff2d78'})`,
          borderRadius: '0 50% 50% 0', opacity: 0.7,
          animation: 'wing-flap 0.6s ease-in-out infinite 0.3s',
          transformOrigin: 'left center',
        }} />
      </div>
      <div style={{
        position: 'absolute', inset: -15, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #00ffd5, #39ff14, #ffd700, #ff2d78, #b44dff, #00ffd5)',
        opacity: 0.2, animation: 'rainbow 3s linear infinite', filter: 'blur(8px)',
      }} />
      <div
        style={{
          width: 120, height: 110,
          borderRadius: '45% 45% 42% 42%',
          background: `linear-gradient(135deg, ${bodyTop}, ${bodyBottom})`,
          border: `3px solid ${bodyTop}`,
          position: 'relative', zIndex: 2,
          boxShadow: `0 0 40px ${bodyTop}66, 0 0 80px ${bodyTop}33`,
        }}
      >
        <div style={{
          position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 20, borderRadius: '50%',
          border: `3px solid ${bodyTop}`,
          boxShadow: `0 0 15px ${bodyTop}80`,
          animation: 'float 2s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', top: 28, left: 24, fontSize: 24, animation: 'blink 4s ease-in-out infinite' }}>
          {mood === 'sleepy' ? '−' : '★'}
        </div>
        <div style={{ position: 'absolute', top: 28, right: 24, fontSize: 24, animation: 'blink 4s ease-in-out infinite 0.1s' }}>
          {mood === 'sleepy' ? '−' : '★'}
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: mood === 'happy' ? 36 : 24,
            height: mood === 'happy' ? 16 : 5,
            borderRadius: mood === 'happy' ? '0 0 50% 50%' : 3,
            background: skin?.palette?.eye ?? '#0a0a0f',
          }} />
        </div>
        <div style={{ position: 'absolute', top: 42, left: -20, width: 22, height: 34, borderRadius: 10, background: bodyBottom, border: `2px solid ${bodyTop}`, transform: 'rotate(-20deg)' }} />
        <div style={{ position: 'absolute', top: 42, right: -20, width: 22, height: 34, borderRadius: 10, background: bodyBottom, border: `2px solid ${bodyTop}`, transform: 'rotate(20deg)' }} />
        <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 20 }}>⚡</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: -4, position: 'relative', zIndex: 2 }}>
        <div style={{ width: 28, height: 16, borderRadius: '50%', background: bodyBottom, border: `2px solid ${bodyTop}` }} />
        <div style={{ width: 28, height: 16, borderRadius: '50%', background: bodyBottom, border: `2px solid ${bodyTop}` }} />
      </div>
    </div>
  );
}

function Particles({ scale }: { scale: number }) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    delay: i * 0.4,
    x: Math.cos((i / 8) * Math.PI * 2) * 60,
    y: Math.sin((i / 8) * Math.PI * 2) * 60,
    color: ['#00ffd5', '#39ff14', '#ffd700', '#ff2d78', '#b44dff'][i % 5],
  }));

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            transform: `translate(${p.x * scale}px, ${p.y * scale}px)`,
            animation: `sparkle 2s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}
