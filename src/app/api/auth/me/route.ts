import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const pet = await prisma.pet.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email, githubUsername: user.githubUsername },
    pet,
  });
}
