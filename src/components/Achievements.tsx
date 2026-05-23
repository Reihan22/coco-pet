'use client';

import { PetState } from '@/lib/pet';

interface AchievementsProps {
  pet: PetState;
}

const ACHIEVEMENTS = [
  { id: 'first_feed', name: 'First Charge', icon: '⚡', desc: 'Charge your bot for the first time', check: (p: PetState) => p.activities.some(a => a.type === 'feed'), color: '#ff2d78', goal: 1, getVal: (p: PetState) => p.activities.filter(a => a.type === 'feed').length },
  { id: 'level_5', name: 'Level 5', icon: '🐣', desc: 'Reach level 5', check: (p: PetState) => p.level >= 5, color: '#00ffd5', goal: 5, getVal: (p: PetState) => p.level },
  { id: 'level_10', name: 'Level 10', icon: '⭐', desc: 'Reach level 10', check: (p: PetState) => p.level >= 10, color: '#00ffd5', goal: 10, getVal: (p: PetState) => p.level },
  { id: 'level_50', name: 'Half Century', icon: '💯', desc: 'Reach level 50', check: (p: PetState) => p.level >= 50, color: '#ffd700', goal: 50, getVal: (p: PetState) => p.level },
  { id: 'legend', name: 'Legend!', icon: '👑', desc: 'Reach Legend build phase', check: (p: PetState) => p.stage === 'legend', color: '#ffd700', goal: 51, getVal: (p: PetState) => p.level },
  { id: 'well_fed', name: 'Fully Charged', icon: '⚡', desc: 'Power above 80%', check: (p: PetState) => p.hunger >= 80, color: '#ff2d78', goal: 80, getVal: (p: PetState) => p.hunger },
  { id: 'happy_pet', name: 'High Morale', icon: '😊', desc: 'Morale above 90%', check: (p: PetState) => p.happiness >= 90, color: '#39ff14', goal: 90, getVal: (p: PetState) => p.happiness },
  { id: 'first_evo', name: 'Upgrade!', icon: '🔧', desc: 'Witness first build phase upgrade', check: (p: PetState) => p.activities.some(a => a.type === 'evolution'), color: '#b44dff', goal: 1, getVal: (p: PetState) => p.activities.filter(a => a.type === 'evolution').length },
  { id: 'battle_vet', name: 'Battle Veteran', icon: '⚔️', desc: 'Win a battle', check: (p: PetState) => p.activities.some(a => a.type === 'battle'), color: '#ff9500', goal: 1, getVal: (p: PetState) => p.activities.filter(a => a.type === 'battle').length },
  { id: 'guild_warrior', name: 'Guild Warrior', icon: '🏰', desc: 'Participate in a guild war', check: (p: PetState) => p.activities.some(a => a.type === 'guild_war'), color: '#ffd700', goal: 1, getVal: (p: PetState) => p.activities.filter(a => a.type === 'guild_war').length },
];

export default function Achievements({ pet }: AchievementsProps) {
  const unlocked = ACHIEVEMENTS.filter(a => a.check(pet)).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9, color: '#ffd700',
          letterSpacing: 1,
        }}>
          ACHIEVEMENTS
        </h3>
        <span style={{
          fontSize: 10, color: '#888',
          background: 'rgba(255,215,0,0.1)',
          border: '1px solid rgba(255,215,0,0.2)',
          padding: '2px 8px',
          fontFamily: "'Press Start 2P', monospace",
        }}>
          {unlocked}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = ach.check(pet);
          const currentVal = ach.getVal(pet);
          const progress = Math.min(100, Math.round((currentVal / ach.goal) * 100));

          return (
            <div
              key={ach.id}
              style={{
                padding: '14px',
                background: isUnlocked ? `${ach.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isUnlocked ? `${ach.color}44` : '#1a1a2e'}`,
                opacity: isUnlocked ? 1 : 0.5,
                filter: isUnlocked ? 'none' : 'grayscale(0.8)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 24, filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                  {isUnlocked ? ach.icon : '🔒'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8,
                    color: isUnlocked ? ach.color : '#555',
                    marginBottom: 6,
                  }}>
                    {ach.name}
                  </div>
                  <div style={{ fontSize: 11, color: isUnlocked ? '#aaa' : '#444', lineHeight: 1.4 }}>
                    {ach.desc}
                  </div>
                </div>
                {isUnlocked && (
                  <span style={{ color: '#39ff14', fontSize: 16, flexShrink: 0 }}>✅</span>
                )}
              </div>

              {!isUnlocked && (
                <div style={{ marginTop: 8, height: 4, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progress}%`,
                    background: `linear-gradient(90deg, ${ach.color}66, ${ach.color})`,
                    borderRadius: 2, transition: 'width 0.5s ease',
                  }} />
                </div>
              )}

              {isUnlocked && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: `linear-gradient(90deg, transparent 0%, ${ach.color}08 50%, transparent 100%)`,
                  backgroundSize: '200% 100%',
                  animation: 'pixel-shimmer 3s linear infinite',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
