import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateLevel, calculateStage, calculateStats } from '@/lib/pet';

export async function POST() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

    // Cooldown: 30 seconds
    const now = new Date();
    const diff = now.getTime() - new Date(pet.lastFed).getTime();
    if (diff < 30_000) {
      return NextResponse.json({ error: 'Too soon! Wait 30 seconds.' }, { status: 429 });
    }

    const xpGain = 10;
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
          hunger: Math.min(100, pet.hunger + 20),
          hp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          spd: stats.spd,
          lastFed: now,
        },
      });

      await tx.activity.create({
        data: {
          userId: user.id,
          type: 'feed',
          description: `Fed ${pet.name}`,
          xpEarned: xpGain,
        },
      });

      // Log evolution if stage changed
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
