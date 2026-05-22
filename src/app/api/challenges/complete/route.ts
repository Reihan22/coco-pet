import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateLevel, calculateStage, calculateStats } from '@/lib/pet';

export async function POST() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    const xpGain = 50;
    const newXp = pet.xp + xpGain;
    const newLevel = calculateLevel(newXp);
    const newStage = calculateStage(newLevel);
    const stats = calculateStats(newLevel, newStage);
    const oldStage = pet.stage;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.pet.update({
        where: { userId: user.id },
        data: {
          xp: newXp,
          level: newLevel,
          stage: newStage,
          challengesCompleted: pet.challengesCompleted + 1,
          happiness: Math.min(100, pet.happiness + 10),
          hp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          spd: stats.spd,
        },
      });

      await tx.activity.create({
        data: {
          userId: user.id,
          type: 'challenge',
          description: `${pet.name} completed a coding challenge!`,
          xpEarned: xpGain,
        },
      });

      if (oldStage !== newStage) {
        await tx.activity.create({
          data: {
            userId: user.id,
            type: 'evolution',
            description: `${pet.name} evolved to ${newStage}!`,
            xpEarned: 0,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ pet: result, xpGained: xpGain });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
