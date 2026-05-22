import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;

    const messages = await prisma.guildMessage.findMany({
      where: { guildId: id },
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message max 1000 characters' }, { status: 400 });
    }

    // Must be guild member
    const membership = await prisma.guildMember.findFirst({
      where: { guildId: id, userId: user.id },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Not a guild member' }, { status: 403 });
    }

    const message = await prisma.guildMessage.create({
      data: {
        guildId: id,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
