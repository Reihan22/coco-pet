import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    const [acceptedFriendships, pendingReceived, pendingSent] = await Promise.all([
      prisma.friendship.findMany({
        where: {
          status: 'accepted',
          OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        },
        include: {
          requester: { select: { id: true, username: true, pet: { select: { level: true, stage: true, lastFed: true, lastPetted: true } } } },
          addressee: { select: { id: true, username: true, pet: { select: { level: true, stage: true, lastFed: true, lastPetted: true } } } },
        },
      }),
      prisma.friendship.findMany({
        where: { addresseeId: user.id, status: 'pending' },
        include: {
          requester: { select: { id: true, username: true, pet: { select: { level: true, stage: true } } } },
        },
      }),
      prisma.friendship.findMany({
        where: { requesterId: user.id, status: 'pending' },
        include: {
          addressee: { select: { id: true, username: true, pet: { select: { level: true, stage: true } } } },
        },
      }),
    ]);

    // Normalize friends: extract the "other" user from each friendship
    const friends = acceptedFriendships.map((f) => {
      const other = f.requesterId === user.id ? f.addressee : f.requester;
      return {
        friendshipId: f.id,
        user: other,
      };
    });

    const received = pendingReceived.map((f) => ({
      friendshipId: f.id,
      user: f.requester,
    }));

    const sent = pendingSent.map((f) => ({
      friendshipId: f.id,
      user: f.addressee,
    }));

    return NextResponse.json({ friends, received, sent });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.id === user.id) {
      return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
    }

    // Check existing friendship in either direction
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, addresseeId: target.id },
          { requesterId: target.id, addresseeId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 });
      }
      if (existing.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send request' }, { status: 400 });
      }
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: target.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ friendship }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
