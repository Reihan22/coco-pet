'use client';

import { Activity, ActivityType } from '@/lib/pet';

interface ActivityFeedProps {
  activities: Activity[];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityIcon(type: ActivityType): string {
  switch (type) {
    case 'commit': return '💻';
    case 'challenge': return '🧠';
    case 'evolution': return '🌟';
    case 'login': return '👋';
    case 'feed': return '🍕';
    case 'pet': return '💖';
    case 'battle': return '⚔️';
    case 'guild_war': return '🏰';
    default: return '📌';
  }
}

function activityColor(type: ActivityType): string {
  switch (type) {
    case 'commit': return '#00ffd5';
    case 'challenge': return '#39ff14';
    case 'evolution': return '#ffd700';
    case 'login': return '#b44dff';
    case 'feed': return '#ff2d78';
    case 'pet': return '#ff69b4';
    case 'battle': return '#ff9500';
    case 'guild_war': return '#ffd700';
    default: return '#888';
  }
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: '#555', fontSize: 13 }}>
        <p style={{ marginBottom: 8 }}>No activities yet</p>
        <p style={{ fontSize: 11 }}>Charge or boost your bot to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {activities.slice(0, 10).map((a, i) => (
        <div
          key={a.id}
          className="activity-item"
          style={{
            animationDelay: `${i * 0.1}s`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.02)',
            borderLeft: `3px solid ${activityColor(a.type)}`,
          }}
        >
          <span style={{ fontSize: 18 }}>{activityIcon(a.type)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {a.description}
            </div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
              {timeAgo(a.timestamp)}
            </div>
          </div>
          {a.xpEarned > 0 && (
            <span style={{
              fontSize: 11,
              fontFamily: "'Press Start 2P', monospace",
              color: '#39ff14',
              whiteSpace: 'nowrap',
            }}>
              +{a.xpEarned}XP
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
