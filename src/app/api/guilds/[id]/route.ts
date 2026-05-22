import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;

    const guild = await prisma.guild.findUnique({
      where: { id },
      include: {
        leader: { select: { id: true, username: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                pet: { select: { level: true, stage: true, xp: true } },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    return NextResponse.json({ guild });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
