// Guild war pure helpers — no DB calls

import { calculateStats } from './pet';

export interface ChampionPick {
  userId: string;
  username: string;
  level: number;
  stage: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface WarMatchResult {
  matchIndex: number;
  champion1: ChampionPick;
  champion2: ChampionPick;
  winner: 1 | 2;
  champion1RemainingHp: number;
  champion2RemainingHp: number;
  rounds: Array<{
    round: number;
    action1: string;
    action2: string;
    dmg1to2: number;
    dmg2to1: number;
    hp1: number;
    hp2: number;
  }>;
}

export interface WarRewardPlan {
  guildId: string;
  guildXp: number;
  mvpUserId: string;
  mvpXp: number;
  participantXp: number;
  participantUserIds: string[];
}

/**
 * Select top N members by level as champions.
 */
export function selectChampions(
  members: Array<{
    userId: string;
    username: string;
    user: { pet: { level: number; stage: string; hp: number; atk: number; def: number; spd: number } | null };
  }>,
  count: number,
): ChampionPick[] {
  return members
    .filter(m => m.user.pet !== null)
    .sort((a, b) => (b.user.pet!.level) - (a.user.pet!.level))
    .slice(0, count)
    .map(m => ({
      userId: m.userId,
      username: m.username,
      level: m.user.pet!.level,
      stage: m.user.pet!.stage,
      hp: m.user.pet!.hp,
      atk: m.user.pet!.atk,
      def: m.user.pet!.def,
      spd: m.user.pet!.spd,
    }));
}

/**
 * Resolve a single war battle between two champions using simplified turn-based combat.
 * Returns winner side (1 or 2) and remaining HP for both.
 */
export function resolveWarBattle(
  champion1: ChampionPick,
  champion2: ChampionPick,
): { winner: 1 | 2; c1Hp: number; c2Hp: number; rounds: WarMatchResult['rounds'] } {
  const stats1 = calculateStats(champion1.level, champion1.stage);
  const stats2 = calculateStats(champion2.level, champion2.stage);

  let hp1 = stats1.hp;
  let hp2 = stats2.hp;
  const maxHp1 = hp1;
  const maxHp2 = hp2;
  const rounds: WarMatchResult['rounds'] = [];
  let round = 0;
  const maxRounds = 20;

  while (hp1 > 0 && hp2 > 0 && round < maxRounds) {
    round++;
    const actions = ['attack', 'attack', 'special', 'defend'] as const;

    // Faster pet goes first
    const firstIsOne = stats1.spd >= stats2.spd;

    const [firstStats, secondStats, firstIdx] = firstIsOne
      ? [stats1, stats2, 1]
      : [stats2, stats1, 2];

    // Pick action — special if HP > 40%, else attack
    const firstHp = firstIsOne ? hp1 : hp2;
    const secondHp = firstIsOne ? hp2 : hp1;
    const firstAction = firstHp / (firstIsOne ? maxHp1 : maxHp2) > 0.4 ? 'attack' : 'attack';
    const secondAction = secondHp / (firstIsOne ? maxHp2 : maxHp1) > 0.4 ? 'attack' : 'attack';

    // First attacks
    const dmg1to2_raw = Math.max(1, firstStats.atk - secondStats.def * 0.5);
    const dmg1to2 = Math.round(dmg1to2_raw * (0.85 + Math.random() * 0.3));
    const dmg2to1_raw = Math.max(1, secondStats.atk - firstStats.def * 0.5);
    const dmg2to1 = Math.round(dmg2to1_raw * (0.85 + Math.random() * 0.3));

    if (firstIsOne) {
      hp2 = Math.max(0, hp2 - dmg1to2);
      if (hp2 > 0) hp1 = Math.max(0, hp1 - dmg2to1);
    } else {
      hp1 = Math.max(0, hp1 - dmg1to2);
      if (hp1 > 0) hp2 = Math.max(0, hp2 - dmg2to1);
    }

    rounds.push({
      round,
      action1: firstIsOne ? firstAction : secondAction,
      action2: firstIsOne ? secondAction : firstAction,
      dmg1to2: firstIsOne ? dmg1to2 : dmg2to1,
      dmg2to1: firstIsOne ? dmg2to1 : dmg1to2,
      hp1,
      hp2,
    });
  }

  // Determine winner
  let winner: 1 | 2;
  if (hp1 <= 0 && hp2 <= 0) {
    winner = hp1 >= hp2 ? 1 : 2; // tie: higher remaining = winner (both 0 -> champion1)
  } else if (hp1 <= 0) {
    winner = 2;
  } else if (hp2 <= 0) {
    winner = 1;
  } else {
    // Rounds exhausted — higher HP% wins
    const pct1 = hp1 / maxHp1;
    const pct2 = hp2 / maxHp2;
    winner = pct1 >= pct2 ? 1 : 2;
  }

  return { winner, c1Hp: hp1, c2Hp: hp2, rounds };
}

/**
 * Calculate war winner from all match results.
 * Winner = most match wins. Tiebreak = total remaining HP across champions.
 */
export function calculateWarWinner(
  results: WarMatchResult[],
): { winner: 1 | 2; score1: number; score2: number; totalHp1: number; totalHp2: number } {
  let score1 = 0;
  let score2 = 0;
  let totalHp1 = 0;
  let totalHp2 = 0;

  for (const r of results) {
    if (r.winner === 1) score1++;
    else score2++;
    totalHp1 += r.champion1RemainingHp;
    totalHp2 += r.champion2RemainingHp;
  }

  let winner: 1 | 2;
  if (score1 > score2) winner = 1;
  else if (score2 > score1) winner = 2;
  else winner = totalHp1 >= totalHp2 ? 1 : 2; // tiebreak

  return { winner, score1, score2, totalHp1, totalHp2 };
}

/**
 * Build XP reward distribution plan.
 * Winner guild: +1000 XP. MVP: +100 XP. Participants: +50 XP each.
 */
export function awardWarRewards(
  warId: string,
  winningGuildId: string,
  mvpUserId: string,
  participantUserIds: string[],
): WarRewardPlan {
  return {
    guildId: winningGuildId,
    guildXp: 1000,
    mvpUserId,
    mvpXp: 100,
    participantXp: 50,
    participantUserIds,
  };
}

/**
 * Find MVP from match results — champion with most remaining HP ratio.
 */
export function findMvp(results: WarMatchResult[]): { userId: string; username: string } | null {
  let bestRatio = -1;
  let mvp: { userId: string; username: string } | null = null;

  for (const r of results) {
    // Check champion 1
    const c1Stats = calculateStats(r.champion1.level, r.champion1.stage);
    const c1Ratio = r.champion1RemainingHp / c1Stats.hp;
    if (c1Ratio > bestRatio) {
      bestRatio = c1Ratio;
      mvp = { userId: r.champion1.userId, username: r.champion1.username };
    }

    // Check champion 2
    const c2Stats = calculateStats(r.champion2.level, r.champion2.stage);
    const c2Ratio = r.champion2RemainingHp / c2Stats.hp;
    if (c2Ratio > bestRatio) {
      bestRatio = c2Ratio;
      mvp = { userId: r.champion2.userId, username: r.champion2.username };
    }
  }

  return mvp;
}
