import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; uid: string }> }
) {
  try {
    const user = await requireUser();
    const { id, uid } = await params;

    // Check requester is in guild with appropriate role
    const requesterMember = await prisma.guildMember.findFirst({
      where: { guildId: id, userId: user.id },
    });
    if (!requesterMember) {
      return NextResponse.json({ error: 'Not in this guild' }, { status: 403 });
    }

    // Can't kick yourself — use leave instead
    if (user.id === uid) {
      return NextResponse.json({ error: 'Cannot kick yourself, use leave' }, { status: 400 });
    }

    const targetMember = await prisma.guildMember.findFirst({
      where: { guildId: id, userId: uid },
    });
    if (!targetMember) {
      return NextResponse.json({ error: 'Target not in guild' }, { status: 404 });
    }

    // Permission check: leader can kick anyone, officers can kick members
    if (requesterMember.role === 'leader') {
      // can kick anyone
    } else if (requesterMember.role === 'officer') {
      if (targetMember.role !== 'member') {
        return NextResponse.json({ error: 'Officers can only kick members' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Only leader/officer can kick' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.guildMember.delete({ where: { id: targetMember.id } });
      await tx.guild.update({
        where: { id },
        data: { memberCount: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; uid: string }> }
) {
  try {
    const user = await requireUser();
    const { id, uid } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !['officer', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Role must be officer or member' }, { status: 400 });
    }

    // Only leader can change roles
    const guild = await prisma.guild.findUnique({ where: { id } });
    if (!guild || guild.leaderId !== user.id) {
      return NextResponse.json({ error: 'Only leader can change roles' }, { status: 403 });
    }

    const targetMember = await prisma.guildMember.findFirst({
      where: { guildId: id, userId: uid },
    });
    if (!targetMember) {
      return NextResponse.json({ error: 'Target not in guild' }, { status: 404 });
    }

    // Can't demote yourself
    if (user.id === uid) {
      return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 });
    }

    // Max 3 officers
    if (role === 'officer') {
      const officerCount = await prisma.guildMember.count({
        where: { guildId: id, role: 'officer' },
      });
      if (officerCount >= 3) {
        return NextResponse.json({ error: 'Max 3 officers' }, { status: 400 });
      }
    }

    const updated = await prisma.guildMember.update({
      where: { id: targetMember.id },
      data: { role },
    });

    return NextResponse.json({ member: updated });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
