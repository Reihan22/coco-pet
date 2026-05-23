import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateStats, calculateLevel, calculateStage } from '@/lib/pet';
import bcrypt from 'bcryptjs';
import {
  resolveTurn,
  initFighterState,
  type BattleAction,
  type FighterState,
  type TurnResult,
  MAX_TURNS,
} from '@/lib/battle';

const AI_USERNAME = 'MiMo Bot';
const AI_EMAIL = 'ai@codebot.internal';

const PERSONALITY_MULTS: Record<string, { atkMult: number; defMult: number }> = {
  aggressive: { atkMult: 1.15, defMult: 0.90 },
  defensive: { atkMult: 0.90, defMult: 1.15 },
  balanced: { atkMult: 1.10, defMult: 1.10 },
  chaotic: { atkMult: 1.0, defMult: 1.0 },
};

function applyModifiers(baseStats: { hp: number; atk: number; def: number; spd: number }, pet: any) {
  let { hp, atk, def, spd } = baseStats;
  const skills = Array.isArray(pet.skills) ? pet.skills as any[] : [];
  const active = Array.isArray(pet.activeSkills) ? pet.activeSkills as string[] : [];
  for (const skill of skills) {
    if (!active.includes(skill.id)) continue;
    if (skill.stat === 'atk') atk += skill.boost;
    else if (skill.stat === 'def') def += skill.boost;
    else if (skill.stat === 'spd') spd += skill.boost;
    else if (skill.stat === 'hp') hp += skill.boost;
  }
  const personality = pet.personality as string | null;
  if (personality) {
    const mults = PERSONALITY_MULTS[personality];
    if (mults) {
      if (personality === 'chaotic') {
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

function pickAIAction(): BattleAction {
  const r = Math.random();
  if (r < 0.55) return 'attack';
  if (r < 0.80) return 'defend';
  if (r < 0.95) return 'special';
  return 'attack'; // AI rarely flees
}

// Get or create the AI bot user + pet
async function getOrCreateAIUser() {
  const existing = await prisma.user.findUnique({
    where: { email: AI_EMAIL },
    include: { pet: true },
  });

  if (existing) return existing;

  const hashedPassword = await bcrypt.hash('ai-bot-no-login', 10);
  const created = await prisma.user.create({
    data: {
      username: AI_USERNAME,
      email: AI_EMAIL,
        passwordHash: hashedPassword,
      pet: {
        create: {
            name: AI_USERNAME,
            level: 5,
            stage: 'baby',
            xp: 100,
            hp: 120,
            atk: 18,
            def: 12,
            spd: 10,
            hunger: 80,
            happiness: 80,
          },
      },
    },
    include: { pet: true },
  });

  return created;
}

export async function POST() {
  try {
    const user = await requireUser();

    // Check for existing active battle
    const existing = await prisma.battle.findFirst({
      where: {
        status: { in: ['waiting', 'active'] },
        OR: [{ challengerId: user.id }, { opponentId: user.id }],
      },
    });
    if (existing) {
      return NextResponse.json({ battle: existing, message: 'Already in a battle' });
    }

    const aiUser = await getOrCreateAIUser();

    // Create battle — immediately active since AI is always ready
    const battle = await prisma.battle.create({
      data: {
        challengerId: user.id,
        opponentId: aiUser.id,
        status: 'active',
        turns: [],
      },
      include: {
        challenger: { select: { id: true, username: true, pet: true } },
        opponent: { select: { id: true, username: true, pet: true } },
      },
    });

    return NextResponse.json({ battle, message: 'Battle started vs MiMo Bot!' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
