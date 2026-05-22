import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Group battles by winner and count wins
    const wins = await prisma.battle.groupBy({
      by: ['winnerId'],
      where: { winnerId: { not: null } },
      _count: { winnerId: true },
      orderBy: { _count: { winnerId: 'desc' } },
      take: 50,
    });

    // Fetch user + pet info for each winner
    const leaderboard = await Promise.all(
      wins
        .filter((w) => w.winnerId !== null)
        .map(async (w, i) => {
          const user = await prisma.user.findUnique({
            where: { id: w.winnerId! },
            select: {
              username: true,
              pet: { select: { level: true, stage: true } },
            },
          });
          return {
            rank: i + 1,
            username: user?.username ?? 'Unknown',
            wins: w._count.winnerId,
            level: user?.pet?.level ?? 0,
            stage: user?.pet?.stage ?? 'egg',
          };
        })
    );

    return NextResponse.json({ leaderboard });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch battle leaderboard' }, { status: 500 });
  }
}
