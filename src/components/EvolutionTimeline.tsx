'use client';

import { EvolutionStage, STAGES } from '@/lib/pet';

interface EvolutionTimelineProps {
  stage: EvolutionStage;
  level: number;
}

const STAGE_ICONS: Record<string, string> = {
  egg: '🥚',
  baby: '🐣',
  junior: '🧒',
  senior: '🦸',
  legend: '⭐',
};

const STAGE_COLORS: Record<string, string> = {
  egg: '#b44dff',
  baby: '#00ffd5',
  junior: '#39ff14',
  senior: '#ff2d78',
  legend: '#ffd700',
};

export default function EvolutionTimeline({ stage, level }: EvolutionTimelineProps) {
  const currentIdx = STAGES.findIndex(s => s.name === stage);

  return (
    <div style={{ padding: '12px 0' }}>
      <h3 style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 8, color: '#b44dff',
        marginBottom: 16, letterSpacing: 1,
      }}>
        EVOLUTION
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0 10px',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: 30, right: 30,
          height: 2, background: '#222',
          transform: 'translateY(-50%)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: 30,
          width: `${(currentIdx / (STAGES.length - 1)) * (100 - 10)}%`,
          height: 2,
          background: 'linear-gradient(90deg, #b44dff, #00ffd5, #39ff14, #ff2d78, #ffd700)',
          transform: 'translateY(-50%)', zIndex: 1,
          transition: 'width 0.8s ease',
        }} />

        {STAGES.map((s, idx) => {
          const isCurrent = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          const isFuture = idx > currentIdx;
          const circleSize = isCurrent ? 42 : isCompleted ? 30 : 24;
          const color = isCurrent || isCompleted ? STAGE_COLORS[s.name] : '#333';
          const glow = isCurrent ? `0 0 12px ${color}66, 0 0 24px ${color}33` : 'none';

          return (
            <div
              key={s.name}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, zIndex: 2, position: 'relative',
              }}
            >
              <div style={{
                width: circleSize, height: circleSize, borderRadius: '50%',
                background: isFuture ? '#1a1a2e' : `${color}18`,
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isCurrent ? 20 : isCompleted ? 16 : 12,
                boxShadow: glow, transition: 'all 0.4s ease',
                opacity: isFuture ? 0.4 : 1,
              }}>
                {STAGE_ICONS[s.name]}
              </div>

              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: isCurrent ? 7 : 6,
                color: isCurrent ? color : isCompleted ? '#888' : '#444',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>

              {isCurrent && (
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 6, color: '#666',
                }}>
                  LV.{level}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
