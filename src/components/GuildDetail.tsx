'use client';

import { useState, useEffect, useCallback } from 'react';
import GuildChat from './GuildChat';

interface MemberUser {
  id: string;
  username: string;
  pet?: { level: number; stage: string; xp: number } | null;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: MemberUser;
}

interface GuildData {
  id: string;
  name: string;
  description: string | null;
  level: number;
  xp: number;
  memberCount: number;
  leaderId: string;
  leader: { id: string; username: string };
  members: Member[];
  _count: { messages: number };
}

function roleIcon(role: string) {
  if (role === 'leader') return '👑';
  if (role === 'officer') return '🛡️';
  return '👤';
}

function roleColor(role: string) {
  if (role === 'leader') return '#ffd700';
  if (role === 'officer') return '#b44dff';
  return '#666';
}

function stageEmoji(stage: string) {
  const map: Record<string, string> = { egg: '🥚', baby: '🐣', teen: '🐥', adult: '🦅', legendary: '🐉' };
  return map[stage] || '🐣';
}

export default function GuildDetail({ guildId, currentUserId }: { guildId: string; currentUserId: string }) {
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'chat'>('members');

  const fetchGuild = useCallback(async () => {
    try {
      const res = await fetch(`/api/guilds/${guildId}`);
      if (res.ok) {
        const data = await res.json();
        setGuild(data.guild);
      }
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchGuild();
  }, [fetchGuild]);

  const myMembership = guild?.members.find(m => m.userId === currentUserId);
  const isLeader = guild?.leader.id === currentUserId;
  const isOfficer = myMembership?.role === 'officer';
  const canManage = isLeader || isOfficer;

  async function handleKick(userId: string) {
    setActionLoading(userId);
    setMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/members/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: 'Member kicked', ok: true });
        fetchGuild();
      } else {
        setMsg({ text: data.error || 'Failed', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error', ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleChangeRole(userId: string, role: string) {
    setActionLoading(userId);
    setMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: 'Role updated', ok: true });
        fetchGuild();
      } else {
        setMsg({ text: data.error || 'Failed', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error', ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeave() {
    if (!confirm('Leave this guild?')) return;
    setMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/members/${currentUserId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/guild';
      } else {
        setMsg({ text: data.error || 'Failed to leave', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error', ok: false });
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#b44dff', fontFamily: "'Press Start 2P', monospace", fontSize: 12 }}>
        Loading guild...
      </div>
    );
  }

  if (!guild) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ff2d78', fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
        Guild not found
      </div>
    );
  }

  const levelProgress = guild.xp % 5000;
  const xpForNext = 5000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Guild Header */}
      <div className="card-retro" style={{ padding: 24, background: 'rgba(180,77,255,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 16,
              color: '#b44dff', margin: '0 0 8px 0',
            }}>
              🏰 {guild.name}
            </h2>
            {guild.description && (
              <p style={{ color: '#888', fontSize: 10, margin: '0 0 12px 0', maxWidth: 500 }}>
                {guild.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#666', fontFamily: "'Press Start 2P', monospace" }}>
              <span style={{ color: '#ffd700' }}>Lv.{guild.level}</span>
              <span>👥 {guild.memberCount}/50</span>
              <span>💬 {guild._count.messages} msgs</span>
            </div>
          </div>
          {myMembership && (
            <button
              onClick={handleLeave}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '8px 16px', cursor: 'pointer',
                background: 'transparent', border: '1px solid #ff2d78',
                color: '#ff2d78',
              }}
            >
              LEAVE GUILD
            </button>
          )}
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#555', fontFamily: "'Press Start 2P', monospace", marginBottom: 4 }}>
            <span>GUILD XP</span>
            <span>{levelProgress}/{xpForNext}</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid #333', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(levelProgress / xpForNext) * 100}%`,
              background: 'linear-gradient(90deg, #b44dff, #7c3aed)',
              transition: 'width 0.5s',
            }} />
          </div>
        </div>
      </div>

      {msg && (
        <p style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: msg.ok ? '#39ff14' : '#ff2d78', textAlign: 'center',
        }}>
          {msg.ok ? '✓' : '⚠'} {msg.text}
        </p>
      )}

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['members', 'chat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9, padding: '8px 16px',
              border: `2px solid ${activeTab === tab ? '#b44dff' : '#333'}`,
              background: activeTab === tab ? 'rgba(180,77,255,0.1)' : 'transparent',
              color: activeTab === tab ? '#b44dff' : '#666',
              cursor: 'pointer', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'members' ? `👥 Members (${guild.members.length})` : '💬 Chat'}
          </button>
        ))}
      </div>

      {activeTab === 'members' ? (
        <div className="card-retro" style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {guild.members.map(member => (
              <div key={member.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', flexWrap: 'wrap', gap: 8,
                background: member.userId === guild.leader.id
                  ? 'rgba(255,215,0,0.05)' : member.role === 'officer'
                  ? 'rgba(180,77,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${member.userId === guild.leader.id ? 'rgba(255,215,0,0.2)' : member.role === 'officer' ? 'rgba(180,77,255,0.15)' : '#222'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 150 }}>
                  <span style={{ fontSize: 14 }}>{roleIcon(member.role)}</span>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 9,
                    color: roleColor(member.role),
                  }}>
                    {member.user.username}
                  </span>
                  {member.user.pet && (
                    <span style={{ fontSize: 8, color: '#555' }}>
                      {stageEmoji(member.user.pet.stage)} Lv.{member.user.pet.level}
                    </span>
                  )}
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    color: '#444', marginLeft: 4,
                  }}>
                    {member.role.toUpperCase()}
                  </span>
                </div>

                {canManage && member.userId !== currentUserId && member.userId !== guild.leader.id && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isLeader && member.role === 'member' && (
                      <button
                        onClick={() => handleChangeRole(member.userId, 'officer')}
                        disabled={actionLoading === member.userId}
                        style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                          padding: '5px 10px', cursor: 'pointer',
                          background: 'rgba(180,77,255,0.1)', border: '1px solid #b44dff',
                          color: '#b44dff', opacity: actionLoading === member.userId ? 0.5 : 1,
                        }}
                      >
                        PROMOTE
                      </button>
                    )}
                    {isLeader && member.role === 'officer' && (
                      <button
                        onClick={() => handleChangeRole(member.userId, 'member')}
                        disabled={actionLoading === member.userId}
                        style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                          padding: '5px 10px', cursor: 'pointer',
                          background: 'transparent', border: '1px solid #555',
                          color: '#888', opacity: actionLoading === member.userId ? 0.5 : 1,
                        }}
                      >
                        DEMOTE
                      </button>
                    )}
                    <button
                      onClick={() => handleKick(member.userId)}
                      disabled={actionLoading === member.userId}
                      style={{
                        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                        padding: '5px 10px', cursor: 'pointer',
                        background: 'transparent', border: '1px solid #ff2d78',
                        color: '#ff2d78', opacity: actionLoading === member.userId ? 0.5 : 1,
                      }}
                    >
                      KICK
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-retro" style={{ padding: 20 }}>
          <GuildChat guildId={guildId} />
        </div>
      )}
    </div>
  );
}
