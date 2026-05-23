'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sublabel?: string;
}

export default function StatCard({ label, value, icon, color, sublabel }: StatCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
      border: `1px solid ${color}30`,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderRadius: 8,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}20, 0 0 15px ${color}10`;
        e.currentTarget.style.borderColor = `${color}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${color}30`;
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.5,
      }} />
      <span style={{ fontSize: 22, filter: `drop-shadow(0 0 4px ${color}40)` }}>{icon}</span>
      <div>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color, textShadow: `0 0 10px ${color}30` }}>{value}</div>
        <div style={{ fontSize: 11, color: '#777', marginTop: 3 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}
