import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.username === username ? 'Username already taken' : 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { username, email, passwordHash },
      });

      await tx.pet.create({
        data: { userId: user.id },
      });

      await tx.activity.create({
        data: {
          userId: user.id,
          type: 'login',
          description: `${username} joined CodeBot!`,
        },
      });

      return user;
    });

    const token = await signSession(user.id);
    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email },
    });
    response.headers.set('Set-Cookie', setSessionCookie(token));
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
