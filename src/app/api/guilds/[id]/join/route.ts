import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Check if already in any guild
    const existingMember = await prisma.guildMember.findUnique({ where: { userId: user.id } });
    if (existingMember) {
      return NextResponse.json({ error: 'Already in a guild' }, { status: 400 });
    }

    // Check guild exists and not full
    const guild = await prisma.guild.findUnique({ where: { id } });
    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }
    if (guild.memberCount >= 50) {
      return NextResponse.json({ error: 'Guild is full (50 members max)' }, { status: 400 });
    }

    // Auto-join (MVP: skip approval flow)
    await prisma.$transaction(async (tx) => {
      await tx.guildMember.create({
        data: {
          guildId: id,
          userId: user.id,
          role: 'member',
        },
      });

      await tx.guild.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
