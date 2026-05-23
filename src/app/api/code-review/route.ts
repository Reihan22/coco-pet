import { NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const lang = language || 'code';
    const prompt = `You are a senior code reviewer. Review this ${lang} code for bugs, performance, security, and best practices. Give specific line-by-line feedback. Rate 1-10. Be constructive but direct. Code:\n\n${code}`;

    const messages = [
      { role: 'user' as const, content: prompt },
    ];

    const review = await aiChat(messages, 1000);

    // Estimate tokens: ~4 chars per token
    const tokensUsed = Math.ceil((prompt.length + review.length) / 4);

    return NextResponse.json({ review, tokens_used: tokensUsed });
  } catch (err) {
    console.error('Code review error:', err);
    return NextResponse.json({ error: 'Code review failed' }, { status: 500 });
  }
}
