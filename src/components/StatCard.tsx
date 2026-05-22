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
      background: `${color}06`,
      border: `1px solid ${color}25`,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color }}>{value}</div>
        <div style={{ fontSize: 11, color: '#777', marginTop: 3 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}
