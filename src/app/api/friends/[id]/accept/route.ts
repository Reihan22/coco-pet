import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const friendship = await prisma.friendship.findFirst({
      where: {
        requesterId: id,
        addresseeId: user.id,
        status: 'pending',
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'accepted' },
    });

    return NextResponse.json({ friendship: updated });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
