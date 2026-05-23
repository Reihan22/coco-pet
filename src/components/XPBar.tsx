'use client';

interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export default function XPBar({ current, max, level }: XPBarProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontFamily: "var(--font-pixel)" }}>
        <span style={{ color: '#00ffd5' }}>LV.{level}</span>
        <span style={{ color: '#888' }}>{current}/{max} XP</span>
      </div>
      <div className="xp-bar-track" style={{ borderRadius: 4 }}>
        <div className="xp-bar-fill" style={{ width: `${pct}%`, borderRadius: 2 }} />
      </div>
    </div>
  );
}
