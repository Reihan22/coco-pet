import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    return NextResponse.json({ pet });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.length > 30) {
      return NextResponse.json({ error: 'Invalid name (max 30 chars)' }, { status: 400 });
    }

    const pet = await prisma.pet.update({
      where: { userId: user.id },
      data: { name: name.trim() },
    });
    return NextResponse.json({ pet });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
