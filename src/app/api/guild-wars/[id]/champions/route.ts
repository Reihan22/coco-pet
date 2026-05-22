import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    const membership = await prisma.guildMember.findUnique({
      where: { userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not in a guild' }, { status: 400 });
    }

    const members = await prisma.guildMember.findMany({
      where: { guildId: membership.guildId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            pet: {
              select: { level: true, stage: true, hp: true, atk: true, def: true, spd: true },
            },
          },
        },
      },
      orderBy: { user: { pet: { level: 'desc' } } },
    });

    const champions = members
      .filter(m => m.user.pet !== null)
      .map(m => ({
        userId: m.userId,
        username: m.user.username,
        role: m.role,
        level: m.user.pet!.level,
        stage: m.user.pet!.stage,
        hp: m.user.pet!.hp,
        atk: m.user.pet!.atk,
        def: m.user.pet!.def,
        spd: m.user.pet!.spd,
      }));

    return NextResponse.json({ guildId: membership.guildId, champions });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
