import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { aiChat } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json().catch(() => ({}));
    const topic = (body as { topic?: string }).topic || 'general programming';
    const difficulty = (body as { difficulty?: string }).difficulty || 'medium';

    const prompt = `Generate a coding challenge for a pet game. Topic: ${topic}, Difficulty: ${difficulty}.

Return JSON only, no markdown fences:
{
  "title": "short catchy title",
  "description": "clear problem statement (2-4 sentences)",
  "hint": "one helpful hint (1 sentence)",
  "solution_approach": "brief approach outline (2-3 sentences)",
  "difficulty": "${difficulty}"
}`;

    const raw = await aiChat([
      { role: 'system', content: 'You are a coding challenge generator. Return only valid JSON, no markdown fences or explanation.' },
      { role: 'user', content: prompt },
    ], 400);

    // Parse JSON from response (strip markdown fences if present)
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
    let challenge;
    try {
      challenge = JSON.parse(cleaned);
    } catch {
      // Fallback if AI returns non-JSON
      challenge = {
        title: `Coding Challenge: ${topic}`,
        description: raw.slice(0, 300),
        hint: 'Think step by step.',
        solution_approach: 'Break the problem into smaller parts.',
        difficulty,
      };
    }

    return NextResponse.json({ challenge });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Challenge generation error:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
