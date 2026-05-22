import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const guilds = await prisma.guild.findMany({
      take: 50,
      orderBy: { xp: 'desc' },
      include: { leader: { select: { username: true } } },
    });

    const leaderboard = guilds.map((g, i) => ({
      rank: i + 1,
      name: g.name,
      xp: g.xp,
      level: g.level,
      memberCount: g.memberCount,
      leader: g.leader.username,
      description: g.description,
    }));

    return NextResponse.json({ leaderboard });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch guild leaderboard' }, { status: 500 });
  }
}
