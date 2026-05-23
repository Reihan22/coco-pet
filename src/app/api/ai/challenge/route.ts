import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { aiChat } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json().catch(() => ({}));
    const difficulty = (body as { difficulty?: string }).difficulty || 'medium';
    const topic = (body as { topic?: string }).topic || 'general programming';

    const systemPrompt = `Generate a coding challenge. Reply with ONLY valid JSON, no explanation, no markdown fences. JSON: {"title":"string","description":"2-3 sentence problem","hint":"string","solution_approach":"string","difficulty":"${difficulty}"}. Topic: ${topic}. Make it fun and pet-themed.`;

    const response = await aiChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Give me a ${difficulty} coding challenge about ${topic}.` },
    ], 2000);

    // Extract JSON from response (handle possible markdown fences or reasoning text)
    let jsonStr = response.trim();
    
    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Remove markdown fences if present
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    const challenge = JSON.parse(jsonStr);
    return NextResponse.json({ challenge });
  } catch (err) {
    console.error('Challenge generation error:', err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
