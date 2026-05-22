import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

    // Cooldown: 15 seconds
    const now = new Date();
    const diff = now.getTime() - new Date(pet.lastPetted).getTime();
    if (diff < 15_000) {
      return NextResponse.json({ error: 'Too soon! Wait 15 seconds.' }, { status: 429 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.pet.update({
        where: { userId: user.id },
        data: {
          happiness: Math.min(100, pet.happiness + 15),
          lastPetted: now,
        },
      });

      await tx.activity.create({
        data: {
          userId: user.id,
          type: 'pet',
          description: `Petted ${pet.name}`,
          xpEarned: 0,
        },
      });

      return updated;
    });

    return NextResponse.json({ pet: result });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
