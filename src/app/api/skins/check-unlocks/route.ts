import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await requireUser();

    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });

    const battleWins = await prisma.battle.count({ where: { winnerId: user.id } });
    const guildWarCount = await prisma.guildWar.count({
      where: {
        OR: [
          { guild1: { members: { some: { userId: user.id } } } },
          { guild2: { members: { some: { userId: user.id } } } },
        ],
      },
    });

    const alreadyUnlocked = await prisma.userSkin.findMany({
      where: { userId: user.id },
      select: { skinId: true },
    });
    const unlockedIds = new Set(alreadyUnlocked.map(us => us.skinId));

    const allSkins = await prisma.skin.findMany();

    const newlyUnlocked: typeof allSkins = [];

    for (const skin of allSkins) {
      if (unlockedIds.has(skin.id)) continue;

      let unlocked = false;
      switch (skin.unlockType) {
        case 'level':
          unlocked = pet.level >= skin.unlockValue;
          break;
        case 'streak':
          unlocked = pet.streakDays >= skin.unlockValue;
          break;
        case 'achievement':
          unlocked = pet.challengesCompleted >= skin.unlockValue;
          break;
        case 'battle':
          unlocked = battleWins >= skin.unlockValue;
          break;
        case 'guild_war':
          unlocked = guildWarCount >= skin.unlockValue;
          break;
        case 'special':
          continue;
      }

      if (unlocked) {
        await prisma.userSkin.create({
          data: { userId: user.id, skinId: skin.id },
        });
        newlyUnlocked.push(skin);
      }
    }

    return NextResponse.json({ newlyUnlocked });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to check unlocks' }, { status: 500 });
  }
}
