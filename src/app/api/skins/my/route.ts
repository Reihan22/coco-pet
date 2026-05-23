import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    const userSkins = await prisma.userSkin.findMany({
      where: { userId: user.id },
      include: { skin: true },
    });

    return NextResponse.json({ skins: userSkins.map(us => us.skin) });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch skins' }, { status: 500 });
  }
}
