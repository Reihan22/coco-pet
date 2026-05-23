import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    const waitingBattles = await prisma.battle.findMany({
      where: {
        status: 'waiting',
        challengerId: user.id,
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

export async function POST() {
  try {
    const user = await requireUser();

    // 1. Clean up stale waiting battles (>2 min old)
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    await prisma.battle.deleteMany({
      where: { status: 'waiting', createdAt: { lt: twoMinAgo } },
    });

    // 2. Remove own stale waiting battles (prevent double-queue)
    await prisma.battle.deleteMany({
      where: { challengerId: user.id, status: 'waiting' },
    });

    // 3. Check if user already has an active battle
    const activeBattle = await prisma.battle.findFirst({
      where: {
        status: 'active',
        OR: [{ challengerId: user.id }, { opponentId: user.id }],
      },
      include: {
        challenger: { select: { id: true, username: true } },
        opponent: { select: { id: true, username: true } },
      },
    });

    if (activeBattle) {
      return NextResponse.json({ battle: activeBattle, message: 'Already in a battle' });
    }

    // 4. Try to match with another player's waiting battle
    const queuedBattle = await prisma.battle.findFirst({
      where: {
        status: 'waiting',
        challengerId: { not: user.id },
        createdAt: { gte: twoMinAgo },
      },
      include: {
        challenger: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (queuedBattle) {
      // Match found! Update to active with current user as opponent
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

    // 5. No match — create a waiting battle for others to find
    const battle = await prisma.battle.create({
      data: {
        challengerId: user.id,
        status: 'waiting',
        turns: [],
      },
      include: {
        challenger: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ battle, message: 'Waiting for opponent...' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();

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
