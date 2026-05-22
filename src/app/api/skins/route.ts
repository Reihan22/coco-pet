import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);

    if (searchParams.get('mine') === 'true') {
      const userSkins = await prisma.userSkin.findMany({
        where: { userId: user.id },
        include: { skin: true },
      });
      return NextResponse.json({ skins: userSkins.map(us => us.skin) });
    }

    const skins = await prisma.skin.findMany({
      orderBy: [{ category: 'asc' }, { rarity: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ skins });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
