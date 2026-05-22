import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { opponentId } = await request.json();

    if (!opponentId || typeof opponentId !== 'string') {
      return NextResponse.json({ error: 'opponentId required' }, { status: 400 });
    }

    if (opponentId === user.id) {
      return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 });
    }

    // Check opponent exists and has pet
    const opponent = await prisma.user.findUnique({
      where: { id: opponentId },
      include: { pet: true },
    });
    if (!opponent || !opponent.pet) {
      return NextResponse.json({ error: 'Opponent not found' }, { status: 404 });
    }

    // Check for existing active battle between these two
    const existingBattle = await prisma.battle.findFirst({
      where: {
        OR: [
          { challengerId: user.id, opponentId },
          { challengerId: opponentId, opponentId: user.id },
        ],
        status: { in: ['waiting', 'active'] },
      },
    });

    if (existingBattle) {
      return NextResponse.json({ error: 'Active battle already exists with this player' }, { status: 400 });
    }

    const battle = await prisma.battle.create({
      data: {
        challengerId: user.id,
        opponentId,
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
