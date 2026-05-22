import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const battle = await prisma.battle.findUnique({ where: { id } });
    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    if (battle.opponentId !== user.id) {
      return NextResponse.json({ error: 'Only the challenged player can accept' }, { status: 403 });
    }

    if (battle.status !== 'waiting') {
      return NextResponse.json({ error: 'Battle is not in waiting state' }, { status: 400 });
    }

    const updated = await prisma.battle.update({
      where: { id },
      data: { status: 'active' },
      include: {
        challenger: { select: { id: true, username: true } },
        opponent: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ battle: updated });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
