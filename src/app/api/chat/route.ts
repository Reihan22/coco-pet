import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { chatCompletionStream } from '@/lib/ai';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT =
  "You are CodeBuddy, a friendly coding pet companion. Keep responses short (max 3 sentences), fun, and helpful. Use emojis occasionally. You are powered by Xiaomi MiMo V2.5 Pro.";

export async function POST(request: Request) {
  try {
    await requireUser();

    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(history || []),
      { role: 'user' as const, content: message },
    ];

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of chatCompletionStream(messages)) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`),
            );
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
