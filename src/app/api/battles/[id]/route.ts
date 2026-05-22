import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            pet: { select: { name: true, level: true, stage: true, hp: true, atk: true, def: true, spd: true } },
          },
        },
        opponent: {
          select: {
            id: true,
            username: true,
            pet: { select: { name: true, level: true, stage: true, hp: true, atk: true, def: true, spd: true } },
          },
        },
        winner: { select: { id: true, username: true } },
      },
    });

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Only participants can view
    if (battle.challengerId !== user.id && battle.opponentId !== user.id) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    return NextResponse.json({ battle });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
