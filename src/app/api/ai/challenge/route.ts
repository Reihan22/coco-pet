import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json().catch(() => ({}));
    const topic = (body as { topic?: string }).topic || 'general programming';
    const difficulty = (body as { difficulty?: string }).difficulty || 'medium';

    // Stub: return mock challenge since AI endpoint not publicly reachable
    const challenge = {
      title: `Pet Coding Challenge: ${topic}`,
      description: `Help your CodePet solve this ${difficulty}-level challenge about ${topic}! Write a function that demonstrates your coding skills and earns XP for your pet.`,
      hint: 'Think about breaking the problem into smaller steps.',
      solution_approach: 'Use a clean approach with proper error handling.',
      difficulty,
    };

    return NextResponse.json({ challenge });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
