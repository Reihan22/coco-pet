import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    // Find waiting battles (not created by this user, level range handled client-side for MVP)
    const waitingBattles = await prisma.battle.findMany({
      where: {
        status: 'waiting',
        opponentId: user.id, // Only battles where this user is challenged
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            pet: { select: { name: true, level: true, stage: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Also find any active battles for this user
    const activeBattles = await prisma.battle.findMany({
      where: {
        status: 'active',
        OR: [{ challengerId: user.id }, { opponentId: user.id }],
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            pet: { select: { name: true, level: true, stage: true } },
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            pet: { select: { name: true, level: true, stage: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ waiting: waitingBattles, active: activeBattles });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    // Find another user with pet who is not self, pick first available
    const opponent = await prisma.user.findFirst({
      where: {
        id: { not: user.id },
        pet: { isNot: null },
      },
      include: { pet: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!opponent) {
      return NextResponse.json({ error: 'No opponents available' }, { status: 404 });
    }

    // Check for existing battle
    const existing = await prisma.battle.findFirst({
      where: {
        OR: [
          { challengerId: user.id, opponentId: opponent.id },
          { challengerId: opponent.id, opponentId: user.id },
        ],
        status: { in: ['waiting', 'active'] },
      },
    });

    if (existing) {
      return NextResponse.json({ battle: existing, message: 'Existing battle found' });
    }

    const battle = await prisma.battle.create({
      data: {
        challengerId: user.id,
        opponentId: opponent.id,
        status: 'waiting',
        turns: [],
      },
      include: {
        challenger: { select: { id: true, username: true } },
        opponent: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ battle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
