import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiChat } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json().catch(() => ({}));
    const message = (body as { message?: string }).message || '';

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Fetch pet info for context
    const pet = await prisma.pet.findUnique({
      where: { userId: user.id },
      select: { name: true, level: true, stage: true, xp: true, streakDays: true },
    });

    const petContext = pet
      ? `The user's pet is named ${pet.name}, level ${pet.level}, stage ${pet.stage}, XP ${pet.xp}, streak ${pet.streakDays} days.`
      : 'The user has no pet yet.';

    const systemPrompt = `You are a CodePet — a cute, encouraging coding companion pet in a gamified coding platform. ${petContext}

Personality:
- Friendly, supportive, slightly playful
- Use occasional emojis (1-2 per message, not spammy)
- Keep responses SHORT (2-4 sentences max)
- Give practical coding advice when asked
- Reference the user's pet stats when relevant (level, streak, XP)
- Encourage coding streaks and learning
- If asked about yourself, say you're powered by MiMo AI`;

    const response = await aiChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ], 300);

    return NextResponse.json({ response });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
