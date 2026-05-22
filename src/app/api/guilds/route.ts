import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireUser();

    const guilds = await prisma.guild.findMany({
      include: {
        leader: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ guilds });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json({ error: 'Guild name must be 2-50 characters' }, { status: 400 });
    }

    if (description && typeof description === 'string' && description.length > 500) {
      return NextResponse.json({ error: 'Description max 500 characters' }, { status: 400 });
    }

    // Check if user already in a guild
    const existing = await prisma.guildMember.findUnique({ where: { userId: user.id } });
    if (existing) {
      return NextResponse.json({ error: 'Already in a guild' }, { status: 400 });
    }

    // Check pet XP
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }
    if (pet.xp < 500) {
      return NextResponse.json({ error: 'Need 500 XP to create guild' }, { status: 400 });
    }

    // Check guild name uniqueness
    const nameTaken = await prisma.guild.findUnique({ where: { name: name.trim() } });
    if (nameTaken) {
      return NextResponse.json({ error: 'Guild name already taken' }, { status: 400 });
    }

    const guild = await prisma.$transaction(async (tx) => {
      // Deduct 500 XP
      await tx.pet.update({
        where: { userId: user.id },
        data: { xp: pet.xp - 500 },
      });

      const g = await tx.guild.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          leaderId: user.id,
        },
      });

      await tx.guildMember.create({
        data: {
          guildId: g.id,
          userId: user.id,
          role: 'leader',
        },
      });

      return g;
    });

    return NextResponse.json({ guild }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
