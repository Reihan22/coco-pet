import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json().catch(() => ({}));
    const message = (body as { message?: string }).message || '';

    // Stub: return mock pet response since AI endpoint not publicly reachable
    const responses = [
      "Hey there! I'm your CodePet buddy! 🐾 Let's code something awesome today!",
      "Great question! Remember, every line of code you write makes me stronger! 💪",
      "I believe in you! Keep coding and I'll keep evolving! 🌟",
      "That's interesting! Have you tried using a different approach? I'm here to help! 🤖",
      "You're doing amazing! Keep up the streak and I'll grow even more! 🔥",
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return NextResponse.json({ response });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
