import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Public: list all skins (no auth required)
  if (searchParams.get('mine') !== 'true') {
    const skins = await prisma.skin.findMany({
      orderBy: [{ category: 'asc' }, { rarity: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ skins });
  }

  // Private: list user's unlocked skins
  try {
    const user = await requireUser();
    const userSkins = await prisma.userSkin.findMany({
      where: { userId: user.id },
      include: { skin: true },
    });
    return NextResponse.json({ skins: userSkins.map(us => us.skin) });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
