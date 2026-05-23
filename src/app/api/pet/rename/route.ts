import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name: z.string().min(2).max(20).regex(/^[\w\s\-]+$/, 'Letters, numbers, spaces, dashes only'),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const pet = await prisma.pet.update({
      where: { userId: user.id },
      data: { name: parsed.data.name.trim() },
    });

    return NextResponse.json({ ok: true, name: pet.name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
