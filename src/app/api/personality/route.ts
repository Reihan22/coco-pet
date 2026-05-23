import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PERSONALITY_COST = 300;

const PERSONALITY_TYPES = {
  aggressive: { name: 'Aggressive', desc: '+15% ATK, -10% DEF in duels', atkMult: 1.15, defMult: 0.90, icon: '🔴' },
  defensive: { name: 'Defensive', desc: '+15% DEF, -10% ATK in duels', atkMult: 0.90, defMult: 1.15, icon: '🔵' },
  balanced: { name: 'Balanced', desc: '+10% all stats in duels', atkMult: 1.10, defMult: 1.10, icon: '🟡' },
  chaotic: { name: 'Chaotic', desc: 'Random stat boosts (0-25%) each duel', atkMult: 1.125, defMult: 1.125, icon: '🟣' },
} as const;

export async function GET() {
  const user = await requireUser();
  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  return NextResponse.json({
    balance: user.tokens,
    personality: pet.personality,
    unlocked: pet.personalityUnlocked,
    cost: PERSONALITY_COST,
    options: PERSONALITY_TYPES,
  });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const { action, personalityType } = await req.json() as {
    action?: 'unlock' | 'change';
    personalityType?: keyof typeof PERSONALITY_TYPES;
  };

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
  if (!pet) return NextResponse.json({ error: 'No bot found' }, { status: 404 });

  if (action === 'unlock') {
    if (pet.personalityUnlocked) {
      return NextResponse.json({ error: 'Already unlocked' }, { status: 400 });
    }
    if (user.tokens < PERSONALITY_COST) {
      return NextResponse.json({ error: 'Not enough tokens', required: PERSONALITY_COST, balance: user.tokens }, { status: 400 });
    }
    if (!personalityType || !PERSONALITY_TYPES[personalityType]) {
      return NextResponse.json({ error: 'Invalid personality type' }, { status: 400 });
    }

    const [updatedUser, updatedPet] = await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { tokens: { decrement: PERSONALITY_COST } } }),
      prisma.pet.update({
        where: { userId: user.id },
        data: { personalityUnlocked: true, personality: personalityType },
      }),
      prisma.tokenTransaction.create({
        data: { userId: user.id, amount: -PERSONALITY_COST, type: 'personality', description: `Unlocked ${PERSONALITY_TYPES[personalityType].name} personality` },
      }),
      prisma.activity.create({
        data: { userId: user.id, type: 'personality', description: `Unlocked ${PERSONALITY_TYPES[personalityType].name} personality`, xpEarned: 30 },
      }),
    ]);

    return NextResponse.json({
      success: true,
      balance: updatedUser.tokens,
      personality: updatedPet.personality,
      unlocked: true,
      message: `Unlocked ${PERSONALITY_TYPES[personalityType].name} personality!`,
    });
  }

  if (action === 'change') {
    const changeCost = 150;
    if (!pet.personalityUnlocked) {
      return NextResponse.json({ error: 'Personality not unlocked yet' }, { status: 400 });
    }
    if (!personalityType || !PERSONALITY_TYPES[personalityType]) {
      return NextResponse.json({ error: 'Invalid personality type' }, { status: 400 });
    }
    if (pet.personality === personalityType) {
      return NextResponse.json({ error: 'Already this personality' }, { status: 400 });
    }
    if (user.tokens < changeCost) {
      return NextResponse.json({ error: 'Not enough tokens', required: changeCost, balance: user.tokens }, { status: 400 });
    }

    const [updatedUser, updatedPet] = await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { tokens: { decrement: changeCost } } }),
      prisma.pet.update({ where: { userId: user.id }, data: { personality: personalityType } }),
      prisma.tokenTransaction.create({
        data: { userId: user.id, amount: -changeCost, type: 'personality', description: `Changed to ${PERSONALITY_TYPES[personalityType].name}` },
      }),
    ]);

    return NextResponse.json({
      success: true,
      balance: updatedUser.tokens,
      personality: updatedPet.personality,
      message: `Changed to ${PERSONALITY_TYPES[personalityType].name}!`,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
