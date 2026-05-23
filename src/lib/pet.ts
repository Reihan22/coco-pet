// Pet utility functions for DB-backed CodeBot system

export type EvolutionStage = 'egg' | 'baby' | 'junior' | 'senior' | 'legend';
export type PetMood = 'happy' | 'neutral' | 'sad' | 'sleepy';
export type ActivityType = 'feed' | 'pet' | 'battle' | 'evolution' | 'login' | 'commit' | 'challenge' | 'guild_war';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  xpEarned: number;
  timestamp: number;
}

export interface PetState {
  name: string;
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  stage: EvolutionStage;
  totalCommits: number;
  streakDays: number;
  challengesCompleted: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  activities: Activity[];
}

export interface StageInfo {
  name: EvolutionStage;
  label: string;
  minLevel: number;
  icon: string;
  color: string;
}

export const STAGES: StageInfo[] = [
  { name: 'egg', label: 'Frame', minLevel: 1, icon: '🔧', color: '#b44dff' },
  { name: 'baby', label: 'Chassis', minLevel: 5, icon: '⚙️', color: '#00ffd5' },
  { name: 'junior', label: 'Armor', minLevel: 15, icon: '🛡️', color: '#39ff14' },
  { name: 'senior', label: 'Full Mech', minLevel: 30, icon: '🤖', color: '#ff2d78' },
  { name: 'legend', label: 'Legend', minLevel: 50, icon: '⭐', color: '#ffd700' },
];

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * 100;
}

export function xpProgress(xp: number): { current: number; max: number } {
  const level = calculateLevel(xp);
  const prevThreshold = (level - 1) * 100;
  const nextThreshold = level * 100;
  return { current: xp - prevThreshold, max: nextThreshold - prevThreshold };
}

export function calculateStage(level: number): EvolutionStage {
  if (level >= 50) return 'legend';
  if (level >= 30) return 'senior';
  if (level >= 15) return 'junior';
  if (level >= 5) return 'baby';
  return 'egg';
}

export function getEvolutionStage(level: number): EvolutionStage {
  return calculateStage(level);
}

export function getStageInfo(stage: EvolutionStage): StageInfo {
  return STAGES.find(s => s.name === stage) ?? STAGES[0];
}

export function stageBonus(stage: string): number {
  const bonuses: Record<string, number> = { egg: 0, baby: 2, junior: 5, senior: 10, legend: 20 };
  return bonuses[stage] ?? 0;
}

export function calculateStats(level: number, stage: string) {
  const bonus = stageBonus(stage);
  return {
    hp: 50 + level * 10,
    atk: 5 + level * 2 + bonus,
    def: Math.floor(3 + level * 1.5 + bonus),
    spd: 5 + level,
  };
}

export function getPetMood(state: { hunger: number; happiness: number }): PetMood {
  const avg = (state.hunger + state.happiness) / 2;
  if (avg >= 70) return 'happy';
  if (avg >= 40) return 'neutral';
  if (avg >= 20) return 'sad';
  return 'sleepy';
}

export function calculateMood(hunger: number, happiness: number): PetMood {
  return getPetMood({ hunger, happiness });
}

export function needsDecayCheck(lastTime: Date): { decayMinutes: number } {
  const now = new Date();
  const diffMs = now.getTime() - lastTime.getTime();
  const decayMinutes = Math.floor(diffMs / (1000 * 60 * 30));
  return { decayMinutes };
}
