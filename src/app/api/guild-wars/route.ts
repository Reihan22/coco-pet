import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    // Get user's guild membership
    const membership = await prisma.guildMember.findUnique({
      where: { userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ wars: [] });
    }

    const guildId = membership.guildId;

    const wars = await prisma.guildWar.findMany({
      where: {
        OR: [
          { guild1Id: guildId },
          { guild2Id: guildId },
        ],
      },
      include: {
        guild1: { select: { id: true, name: true } },
        guild2: { select: { id: true, name: true } },
        winnerGuild: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ wars });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { defenderGuildId, scheduledAt, champions, bestOf } = body;

    if (!defenderGuildId || !scheduledAt) {
      return NextResponse.json({ error: 'defenderGuildId and scheduledAt required' }, { status: 400 });
    }

    const bo = typeof bestOf === 'number' && bestOf >= 3 && bestOf <= 5 ? bestOf : 3;

    // Validate user is leader/officer of a guild
    const membership = await prisma.guildMember.findUnique({
      where: { userId: user.id },
    });

    if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) {
      return NextResponse.json({ error: 'Must be guild leader or officer to schedule wars' }, { status: 403 });
    }

    const challengerGuildId = membership.guildId;

    if (challengerGuildId === defenderGuildId) {
      return NextResponse.json({ error: 'Cannot challenge your own guild' }, { status: 400 });
    }

    // Validate defender guild exists
    const defenderGuild = await prisma.guild.findUnique({ where: { id: defenderGuildId } });
    if (!defenderGuild) {
      return NextResponse.json({ error: 'Defender guild not found' }, { status: 404 });
    }

    // Check no active/scheduled war between these guilds
    const existingWar = await prisma.guildWar.findFirst({
      where: {
        OR: [
          { guild1Id: challengerGuildId, guild2Id: defenderGuildId },
          { guild1Id: defenderGuildId, guild2Id: challengerGuildId },
        ],
        status: { in: ['scheduled', 'active'] },
      },
    });
    if (existingWar) {
      return NextResponse.json({ error: 'Active or scheduled war already exists between these guilds' }, { status: 400 });
    }

    // Validate and store champion user IDs
    const championIds: string[] = Array.isArray(champions) ? champions.slice(0, 5) : [];
    if (championIds.length < 1) {
      return NextResponse.json({ error: 'At least 1 champion required' }, { status: 400 });
    }

    // Validate champions are guild members
    const validMembers = await prisma.guildMember.findMany({
      where: {
        guildId: challengerGuildId,
        userId: { in: championIds },
      },
    });
    if (validMembers.length !== championIds.length) {
      return NextResponse.json({ error: 'Some champions are not guild members' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt date' }, { status: 400 });
    }

    const war = await prisma.guildWar.create({
      data: {
        guild1Id: challengerGuildId,
        guild2Id: defenderGuildId,
        champions1: championIds,
        champions2: [],
        bestOf: bo,
        scheduledAt: scheduledDate,
      },
      include: {
        guild1: { select: { id: true, name: true } },
        guild2: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ war }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
