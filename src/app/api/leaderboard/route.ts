import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      take: 100,
      orderBy: { xp: 'desc' },
      include: { user: { select: { username: true } } },
    });

    const leaderboard = pets.map((p, i) => ({
      rank: i + 1,
      username: p.user.username,
      level: p.level,
      xp: p.xp,
      stage: p.stage,
      petName: p.name,
    }));

    return NextResponse.json({ leaderboard });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
