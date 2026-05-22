import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, battles, guilds] = await Promise.all([
      prisma.user.count(),
      prisma.battle.count(),
      prisma.guild.count(),
    ]);

    return NextResponse.json({ users, battles, guilds });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
