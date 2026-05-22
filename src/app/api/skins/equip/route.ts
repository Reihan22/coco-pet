import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function slotMatchesCategory(slot: string, category: string) {
  if (category === 'both') return true;
  if (slot === 'palette') return category === 'palette';
  if (slot === 'accessory') return category === 'accessory';
  return false;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { skinId, slot } = await req.json();

    if (!skinId || (slot !== 'palette' && slot !== 'accessory')) {
      return NextResponse.json({ error: 'Invalid skinId or slot' }, { status: 400 });
    }

    const ownedSkin = await prisma.userSkin.findUnique({
      where: { userId_skinId: { userId: user.id, skinId } },
      include: { skin: true },
    });

    if (!ownedSkin) {
      return NextResponse.json({ error: 'Skin not unlocked' }, { status: 403 });
    }

    if (!slotMatchesCategory(slot, ownedSkin.skin.category)) {
      return NextResponse.json({ error: 'Skin category cannot be equipped in this slot' }, { status: 400 });
    }

    const pet = await prisma.pet.update({
      where: { userId: user.id },
      data: slot === 'palette'
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
