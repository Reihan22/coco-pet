import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { chatCompletion } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json().catch(() => ({}));
    const topic = (body as { topic?: string }).topic || 'general programming';
    const difficulty = (body as { difficulty?: string }).difficulty || 'medium';

    const systemPrompt = `Generate a coding challenge. Return ONLY valid JSON with no markdown fences. Schema: {"title": "string", "description": "string (2-4 sentences, fun and pet-themed)", "hint": "string", "solution_approach": "string", "difficulty": "${difficulty}"}. Make it fun and pet-themed. Topic: ${topic}.`;

    const response = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a ${difficulty} coding challenge about ${topic}.` },
    ]);

    // Extract JSON from response (handle possible markdown fences)
    let jsonStr = response.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    const challenge = JSON.parse(jsonStr);
    return NextResponse.json({ challenge });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
