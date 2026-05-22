import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();
    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const mapped = activities.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description ?? '',
      xpEarned: a.xpEarned,
      timestamp: a.createdAt.getTime(),
    }));

    return NextResponse.json({ activities: mapped });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
