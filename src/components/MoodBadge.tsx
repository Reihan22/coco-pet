'use client';

import { PetMood, EvolutionStage, getEvolutionStage, getStageInfo, getPetMood } from '@/lib/pet';

interface MoodBadgeProps {
  hunger: number;
  happiness: number;
  level: number;
}

export default function MoodBadge({ hunger, happiness, level }: MoodBadgeProps) {
  const mood: PetMood = getPetMood({ hunger, happiness });
  const stage: EvolutionStage = getEvolutionStage(level);
  const stageInfo = getStageInfo(stage);

  const moodConfig: Record<PetMood, { emoji: string; label: string; color: string }> = {
    happy: { emoji: '😊', label: 'Happy', color: '#39ff14' },
    neutral: { emoji: '😐', label: 'Neutral', color: '#ffd700' },
    sad: { emoji: '😢', label: 'Sad', color: '#ff2d78' },
    sleepy: { emoji: '😴', label: 'Sleepy', color: '#b44dff' },
  };

  const { emoji, label, color } = moodConfig[mood];

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: `${color}18`, border: `1px solid ${color}44`,
        padding: '4px 10px', fontSize: 12, color,
      }}>
        {emoji} {label}
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        padding: '4px 10px', fontSize: 12, color: '#ccc',
      }}>
        🧬 {stageInfo.label}
      </span>
    </div>
  );
}
