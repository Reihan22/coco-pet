import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    const battles = await prisma.battle.findMany({
      where: {
        OR: [{ challengerId: user.id }, { opponentId: user.id }],
        status: { in: ['finished', 'cancelled'] },
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
        winner: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ battles });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
