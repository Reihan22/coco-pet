'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';

interface WarSummary {
  id: string;
  status: string;
  score1: number;
  score2: number;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  guild1: { id: string; name: string };
  guild2: { id: string; name: string };
  winnerGuild?: { id: string; name: string } | null;
}

export default function GuildWarHistory() {
  const [wars, setWars] = useState<WarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [guildFilter, setGuildFilter] = useState('all');

  const fetchWars = useCallback(async () => {
    try {
      const res = await fetch('/api/guild-wars');
      if (res.ok) {
        const data = await res.json();
        setWars(data.wars || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWars(); }, [fetchWars]);

  const guildOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const war of wars) {
      map.set(war.guild1.id, war.guild1.name);
      map.set(war.guild2.id, war.guild2.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [wars]);

  const filteredWars = wars.filter(w => {
    const statusOk = statusFilter === 'all' || w.status === statusFilter;
    const guildOk = guildFilter === 'all' || w.guild1.id === guildFilter || w.guild2.id === guildFilter;
    return statusOk && guildOk;
  });

  function winnerName(war: WarSummary) {
    if (war.status !== 'finished') return '—';
    if (!war.winnerGuild) return 'Draw';
    return war.winnerGuild.name;
  }

  const colorForStatus: Record<string, string> = {
    scheduled: '#ff6b35',
    active: '#39ff14',
    finished: '#ffd700',
    cancelled: '#ff2d78',
  };

  if (loading) {
    return <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: '#666' }}>Loading war history...</div>;
  }

  return (
    <div className="card-retro" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: '#ff6b35' }}>
          WAR HISTORY
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 10px', background: '#111', color: '#fff', border: '1px solid #333' }}>
            <option value="all">All status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="finished">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={guildFilter} onChange={e => setGuildFilter(e.target.value)} style={{ padding: '8px 10px', background: '#111', color: '#fff', border: '1px solid #333' }}>
            <option value="all">All guilds</option>
            {guildOptions.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredWars.length === 0 ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: '#555', padding: 12 }}>
            No wars match filters.
          </div>
        ) : filteredWars.map(war => (
          <a
            key={war.id}
            href={`/guild-wars/${war.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: '12px 14px',
              border: '1px solid #222',
              background: 'rgba(255,255,255,0.02)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: '#888', marginBottom: 4 }}>
                {war.guild1.name} vs {war.guild2.name}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: '#aaa' }}>
                {new Date(war.scheduledAt).toLocaleDateString()} • {war.score1}-{war.score2}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: colorForStatus[war.status] || '#888', marginBottom: 4 }}>
                {war.status}
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: '#ffd700' }}>
                {winnerName(war)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
