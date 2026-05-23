import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  resolveTurn,
  initFighterState,
  type BattleAction,
  type FighterState,
  type TurnResult,
  MAX_TURNS,
} from '@/lib/battle';
import { calculateLevel, calculateStage, calculateStats } from '@/lib/pet';

// Personality multipliers for combat
const PERSONALITY_MULTS: Record<string, { atkMult: number; defMult: number }> = {
  aggressive: { atkMult: 1.15, defMult: 0.90 },
  defensive: { atkMult: 0.90, defMult: 1.15 },
  balanced: { atkMult: 1.10, defMult: 1.10 },
  chaotic: { atkMult: 1.0, defMult: 1.0 }, // applied randomly per turn
};

// Apply skill boosts + personality multipliers to base stats
function applyModifiers(baseStats: { hp: number; atk: number; def: number; spd: number }, pet: any) {
  let { hp, atk, def, spd } = baseStats;

  // Apply active skill boosts
  const skills = Array.isArray(pet.skills) ? pet.skills as any[] : [];
  const active = Array.isArray(pet.activeSkills) ? pet.activeSkills as string[] : [];
  for (const skill of skills) {
    if (!active.includes(skill.id)) continue;
    if (skill.stat === 'atk') atk += skill.boost;
    else if (skill.stat === 'def') def += skill.boost;
    else if (skill.stat === 'spd') spd += skill.boost;
    else if (skill.stat === 'hp') hp += skill.boost;
  }

  // Apply personality multipliers
  const personality = pet.personality as string | null;
  if (personality) {
    const mults = PERSONALITY_MULTS[personality];
    if (mults) {
      if (personality === 'chaotic') {
        // Random 0-25% boost each battle
        const chaos = 1 + Math.random() * 0.25;
        atk = Math.round(atk * chaos);
        def = Math.round(def * chaos);
      } else {
        atk = Math.round(atk * mults.atkMult);
        def = Math.round(def * mults.defMult);
      }
    }
  }

  return { hp, atk, def, spd };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { action } = await request.json();

    const validActions: BattleAction[] = ['attack', 'defend', 'special', 'flee'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use: attack, defend, special, flee' }, { status: 400 });
    }

    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        challenger: { include: { pet: true } },
        opponent: { include: { pet: true } },
      },
    });

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    if (battle.status !== 'active') {
      return NextResponse.json({ error: 'Battle is not active' }, { status: 400 });
    }

    // Determine if user is challenger or opponent
    const isChallenger = battle.challengerId === user.id;
    const isOpponent = battle.opponentId === user.id;

    if (!isChallenger && !isOpponent) {
      return NextResponse.json({ error: 'Not a participant in this battle' }, { status: 403 });
    }

    if (!battle.challenger.pet || !battle.opponent?.pet) {
      return NextResponse.json({ error: 'Pet data missing' }, { status: 500 });
    }

    const turns = (battle.turns as any[]) || [];
    const turnNumber = turns.length + 1;

    if (turnNumber > MAX_TURNS) {
      return NextResponse.json({ error: 'Battle has already ended (turn limit)' }, { status: 400 });
    }

    // Get stats for both pets using the battle engine's calculateStats
    const cStage = battle.challenger.pet.stage;
    const oStage = battle.opponent.pet.stage;
    const challengerStats = applyModifiers(calculateStats(battle.challenger.pet.level, cStage), battle.challenger.pet);
    const opponentStats = applyModifiers(calculateStats(battle.opponent.pet.level, oStage), battle.opponent.pet);

    // Rebuild fighter states from turn history
    let cState: FighterState = initFighterState(challengerStats.hp);
    let oState: FighterState = initFighterState(opponentStats.hp);

    for (const turn of turns) {
      if (turn.challengerState) cState = turn.challengerState;
      if (turn.opponentState) oState = turn.opponentState;
    }

    // For MVP: single-player action per turn
    // If the action field comes from the current player, we store it as a pending action
    // and resolve the turn with a random AI action for the other player (or wait for them)
    // Simple approach: each POST resolves a full turn

    // Determine actions — current player picks, other player gets AI action for MVP
    const aiActions: BattleAction[] = ['attack', 'attack', 'attack', 'defend', 'special'];
    const aiAction = aiActions[Math.floor(Math.random() * aiActions.length)];

    let challengerAction: BattleAction;
    let opponentAction: BattleAction;

    if (isChallenger) {
      challengerAction = action as BattleAction;
      opponentAction = aiAction;
    } else {
      challengerAction = aiAction;
      opponentAction = action as BattleAction;
    }

    const result: TurnResult = resolveTurn({
      challengerStats,
      opponentStats,
      challengerAction,
      opponentAction,
      challengerState: cState,
      opponentState: oState,
      turn: turnNumber,
    });

    // Build turn record
    const turnRecord = {
      turn: turnNumber,
      challengerAction,
      opponentAction,
      events: result.events,
      challengerState: result.challengerState,
      opponentState: result.opponentState,
      ended: result.ended,
    };

    const newTurns = [...turns, turnRecord];

    if (result.ended) {
      // Determine winner user ID
      let winnerId: string | null = null;
      let xpAwarded = 0;

      if (result.winnerId === 'challenger') {
        winnerId = battle.challengerId;
      } else if (result.winnerId === 'opponent') {
        winnerId = battle.opponentId;
      } else if (result.winnerId === 'draw') {
        winnerId = null; // draw
      }
      // If flee, the fleeing player loses (winner is the other)
      if (result.fleeSuccess) {
        // Challenger fled if challenger used flee, opponent wins
        const lastEvent = result.events.find(e => e.action === 'flee');
        if (lastEvent?.actor === 'challenger') {
          winnerId = battle.opponentId;
        } else {
          winnerId = battle.challengerId;
        }
      }

      // Award XP in transaction
      await prisma.$transaction(async (tx) => {
        // Winner gets 50 XP, loser gets 20 XP
        if (winnerId) {
          const loserId = winnerId === battle.challengerId ? battle.opponentId : battle.challengerId;
          if (!loserId) return;
          
          const winnerPet = await tx.pet.findUnique({ where: { userId: winnerId } });
          const loserPet = await tx.pet.findUnique({ where: { userId: loserId } });

          if (winnerPet) {
            const newLevel = calculateLevel(winnerPet.xp + 50);
            const newStage = calculateStage(newLevel);
            const stats = calculateStats(newLevel, newStage);
            await tx.pet.update({
              where: { userId: winnerId },
              data: {
                xp: { increment: 50 },
                level: newLevel,
                stage: newStage,
                hp: stats.hp,
                atk: stats.atk,
                def: stats.def,
                spd: stats.spd,
              },
            });
            await tx.activity.create({
              data: { userId: winnerId, type: 'battle', description: 'Won a battle!', xpEarned: 50 },
            });
          }

          if (loserPet) {
            const newLevel = calculateLevel(loserPet.xp + 20);
            const newStage = calculateStage(newLevel);
            const stats = calculateStats(newLevel, newStage);
            await tx.pet.update({
              where: { userId: loserId },
              data: {
                xp: { increment: 20 },
                level: newLevel,
                stage: newStage,
                hp: stats.hp,
                atk: stats.atk,
                def: stats.def,
                spd: stats.spd,
              },
            });
            await tx.activity.create({
              data: { userId: loserId, type: 'battle', description: 'Lost a battle. +20 XP for trying!', xpEarned: 20 },
            });
          }

          xpAwarded = 70; // 50 + 20
        }

        await tx.battle.update({
          where: { id },
          data: {
            turns: newTurns,
            status: 'finished',
            winnerId,
            xpAwarded,
            finishedAt: new Date(),
          },
        });
      });

      return NextResponse.json({
        turn: turnRecord,
        battle: { status: 'finished', winnerId, xpAwarded },
        result: { ended: true, winnerId },
      });
    }

    // Not ended — update turns
    await prisma.battle.update({
      where: { id },
      data: { turns: newTurns },
    });

    return NextResponse.json({
      turn: turnRecord,
      result: { ended: false, winnerId: null },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
