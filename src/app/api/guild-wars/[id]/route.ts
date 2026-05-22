import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
    const { id } = await params;

    const war = await prisma.guildWar.findUnique({
      where: { id },
      include: {
        guild1: {
          select: { id: true, name: true, level: true, xp: true, memberCount: true },
        },
        guild2: {
          select: { id: true, name: true, level: true, xp: true, memberCount: true },
        },
        winnerGuild: { select: { id: true, name: true } },
      },
    });

    if (!war) {
      return NextResponse.json({ error: 'War not found' }, { status: 404 });
    }

    return NextResponse.json({ war });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const war = await prisma.guildWar.findUnique({ where: { id } });
    if (!war) {
      return NextResponse.json({ error: 'War not found' }, { status: 404 });
    }

    // Check user is leader/officer of guild1 (challenger)
    const membership = await prisma.guildMember.findUnique({
      where: { userId: user.id },
    });

    if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) {
      return NextResponse.json({ error: 'Must be guild leader or officer' }, { status: 403 });
    }

    if (membership.guildId !== war.guild1Id && membership.guildId !== war.guild2Id) {
      return NextResponse.json({ error: 'Not a participant guild' }, { status: 403 });
    }

    if (action === 'start') {
      if (war.status !== 'scheduled') {
        return NextResponse.json({ error: 'War is not scheduled' }, { status: 400 });
      }

      // Defender guild needs champions set
      const champions2 = war.champions2 as string[];
      if (!champions2 || champions2.length === 0) {
        return NextResponse.json({ error: 'Defender guild has not set champions yet' }, { status: 400 });
      }

      const updated = await prisma.guildWar.update({
        where: { id },
        data: { status: 'active', startedAt: new Date() },
      });

      return NextResponse.json({ war: updated });
    }

    if (action === 'cancel') {
      if (war.status === 'finished' || war.status === 'cancelled') {
        return NextResponse.json({ error: 'Cannot cancel a finished or already cancelled war' }, { status: 400 });
      }

      const updated = await prisma.guildWar.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      return NextResponse.json({ war: updated });
    }

    if (action === 'join') {
      // Defender guild sets their champions
      if (membership.guildId !== war.guild2Id) {
        return NextResponse.json({ error: 'Only defender guild can join with champions' }, { status: 403 });
      }
      if (war.status !== 'scheduled') {
        return NextResponse.json({ error: 'War is not scheduled' }, { status: 400 });
      }

      const { champions } = body;
      if (!Array.isArray(champions) || champions.length < 1) {
        return NextResponse.json({ error: 'At least 1 champion required' }, { status: 400 });
      }

      // Validate champions are members of defender guild
      const validMembers = await prisma.guildMember.findMany({
        where: {
          guildId: war.guild2Id,
          userId: { in: champions },
        },
      });
      if (validMembers.length !== champions.length) {
        return NextResponse.json({ error: 'Some champions are not guild members' }, { status: 400 });
      }

      const updated = await prisma.guildWar.update({
        where: { id },
        data: { champions2: champions },
      });

      return NextResponse.json({ war: updated });
    }

    return NextResponse.json({ error: 'Invalid action. Use start, cancel, or join' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
