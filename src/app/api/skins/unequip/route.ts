import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { slot } = await req.json();

    if (slot !== 'palette' && slot !== 'accessory') {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    const pet = await prisma.pet.update({
      where: { userId: user.id },
      data: slot === 'palette'
        ? { equippedSkinId: null }
        : { equippedAccessoryId: null },
    });

    return NextResponse.json({ pet });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to unequip skin' }, { status: 500 });
  }
}
