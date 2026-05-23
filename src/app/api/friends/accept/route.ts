import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const { friendshipId } = body as { friendshipId?: string };

    if (!friendshipId || typeof friendshipId !== 'string') {
      return NextResponse.json({ error: 'friendshipId is required' }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });

    if (!friendship || friendship.addresseeId !== user.id || friendship.status !== 'pending') {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'accepted' },
      include: {
        requester: { select: { id: true, username: true } },
        addressee: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ friendship: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 });
  }
}
