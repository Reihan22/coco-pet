import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function normalizeSlot(slot: string): 'palette' | 'accessory' {
  if (slot === 'skin' || slot === 'palette') return 'palette';
  return 'accessory';
}

function slotMatchesCategory(normalizedSlot: string, category: string) {
  if (category === 'both') return true;
  if (normalizedSlot === 'palette') return category === 'palette';
  if (normalizedSlot === 'accessory') return category === 'accessory';
  return false;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { skinId, slot } = body;

    if (!skinId || !slot) {
      return NextResponse.json({ error: 'Invalid skinId or slot' }, { status: 400 });
    }

    const normalizedSlot = normalizeSlot(slot);

    // Look up the skin
    const skin = await prisma.skin.findUnique({ where: { id: skinId } });
    if (!skin) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
    }

    // BUG FIX 5: Auto-unlock if skin meets unlock requirements
    let ownedSkin = await prisma.userSkin.findUnique({
      where: { userId_skinId: { userId: user.id, skinId } },
      include: { skin: true },
    });

    if (!ownedSkin) {
      // Check if user qualifies for auto-unlock
      const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
      if (!pet) {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
      }

      let canAutoUnlock = false;
      switch (skin.unlockType) {
        case 'level':
          canAutoUnlock = pet.level >= skin.unlockValue;
          break;
        case 'streak':
          canAutoUnlock = pet.streakDays >= skin.unlockValue;
          break;
        case 'achievement':
          canAutoUnlock = pet.challengesCompleted >= skin.unlockValue;
          break;
        case 'battle':
          const battleWins = await prisma.battle.count({ where: { winnerId: user.id } });
          canAutoUnlock = battleWins >= skin.unlockValue;
          break;
      }

      if (!canAutoUnlock) {
        return NextResponse.json({ error: 'Skin not unlocked' }, { status: 403 });
      }

      // Auto-create UserSkin record
      ownedSkin = await prisma.userSkin.create({
        data: { userId: user.id, skinId: skin.id },
        include: { skin: true },
      });
    }

    if (!slotMatchesCategory(normalizedSlot, ownedSkin.skin.category)) {
      return NextResponse.json({ error: 'Skin category cannot be equipped in this slot' }, { status: 400 });
    }

    const pet = await prisma.pet.update({
      where: { userId: user.id },
      data: normalizedSlot === 'palette'
        ? { equippedSkinId: skinId }
        : { equippedAccessoryId: skinId },
      include: { equippedSkin: true, equippedAccessory: true },
    });

    return NextResponse.json({ pet, equipped: ownedSkin.skin });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to equip skin' }, { status: 500 });
  }
}
