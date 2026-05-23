import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiChat } from '@/lib/ai';

export async function POST() {
  try {
    const user = await requireUser();
    const pet = await prisma.pet.findUnique({ where: { userId: user.id } });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    const prompt = `Write a 3-paragraph lore/backstory for this mech robot. Make it dramatic and sci-fi. Pet: ${pet.name}, Stage: ${pet.stage}, Level: ${pet.level}, Personality: ${pet.personality || 'balanced'}. Include its origin, a defining battle, and its destiny. Max 150 words.`;

    const messages = [
      { role: 'user' as const, content: prompt },
    ];

    const lore = await aiChat(messages, 400);

    return NextResponse.json({ lore });
  } catch (err) {
    console.error('Lore generation error:', err);
    return NextResponse.json({ error: 'Lore generation failed' }, { status: 500 });
  }
}
