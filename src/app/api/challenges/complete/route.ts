import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    const XP_REWARD = 50;
    const newTotalXp = pet.xp + XP_REWARD;
    const newLevel = Math.floor(1 + Math.sqrt(newTotalXp / 50));
    const challengesCompleted = (pet.challengesCompleted ?? 0) + 1;

    const updated = await prisma.pet.update({
      where: { userId: user.id },
      data: {
        xp: { increment: XP_REWARD },
        level: newLevel,
        challengesCompleted,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Challenge completed!',
      xpEarned: XP_REWARD,
      totalXp: updated.xp,
      level: updated.level,
      challengesCompleted: updated.challengesCompleted,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
