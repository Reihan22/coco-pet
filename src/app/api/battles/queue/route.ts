import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    const waitingBattles = await prisma.battle.findMany({
      where: {
        status: 'waiting',
        opponentId: user.id,
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

    // BUG FIX 3: Real matchmaking — find another user already in queue (waiting battle)
    const queuedBattle = await prisma.battle.findFirst({
      where: {
        status: 'waiting',
        challengerId: { not: user.id },
      },
      include: {
        challenger: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (queuedBattle) {
      // BUG FIX 4: Update matched battle to "active" and set current user as opponent
      const battle = await prisma.battle.update({
        where: { id: queuedBattle.id },
        data: {
          opponentId: user.id,
          status: 'active',
        },
        include: {
          challenger: { select: { id: true, username: true } },
          opponent: { select: { id: true, username: true } },
        },
      });

      return NextResponse.json({ battle, message: 'Matched with another player!' });
    }

    // Fallback: find any opponent and create a waiting battle
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

    // Create battle as "active" directly when matching with a bot
    const battle = await prisma.battle.create({
      data: {
        challengerId: user.id,
        opponentId: opponent.id,
        status: 'active',
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

// BUG FIX 11: DELETE handler to leave queue
export async function DELETE() {
  try {
    const user = await requireUser();

    // Remove any waiting battles where this user is the challenger
    const deleted = await prisma.battle.deleteMany({
      where: {
        challengerId: user.id,
        status: 'waiting',
      },
    });

    return NextResponse.json({ success: true, removed: deleted.count });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
