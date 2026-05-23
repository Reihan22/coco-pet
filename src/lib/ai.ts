const AI_ENDPOINT = process.env.AI_ENDPOINT || 'http://127.0.0.1:20128/v1';
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'GG';

export const AI_LABEL = process.env.NEXT_PUBLIC_AI_LABEL || 'Xiaomi MiMo V2.5 Pro';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Parse SSE response from 9router — strips `data: ` prefix and extracts content.
 * MiMo models put the actual reply in `reasoning_content` or `content`.
 */
function parseSSEResponse(text: string): string {
  // If it's plain JSON, parse directly
  if (text.startsWith('{')) {
    const data = JSON.parse(text);
    return data.choices?.[0]?.message?.content
      || data.choices?.[0]?.message?.reasoning_content
      || '';
  }

  // SSE format: concatenate all data chunks
  let fullContent = '';
  let fullReasoning = '';
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (payload === '[DONE]') break;
    try {
      const chunk = JSON.parse(payload);
      const msg = chunk.choices?.[0]?.message;
      const delta = chunk.choices?.[0]?.delta;
      if (msg) {
        fullContent += msg.content || '';
        fullReasoning += msg.reasoning_content || '';
      }
      if (delta) {
        fullContent += delta.content || '';
        fullReasoning += delta.reasoning_content || '';
      }
    } catch {
      // skip parse errors
    }
  }

  return fullContent || fullReasoning || '';
}

export async function aiChat(messages: ChatMessage[], maxTokens = 500): Promise<string> {
  const res = await fetch(`${AI_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`AI API ${res.status}: ${err.slice(0, 200)}`);
  }

  const text = await res.text();
  return parseSSEResponse(text) || 'No response from AI.';
}

// Legacy streaming wrapper — used by /api/chat/route.ts
export async function* chatCompletionStream(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const res = await fetch(`${AI_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.8,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) throw new Error(`AI API error: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content
          || parsed.choices?.[0]?.delta?.reasoning_content;
        if (content) yield content;
      } catch {
        // skip parse errors
      }
    }
  }
}

// Legacy wrapper — used by /api/challenges/generate/route.ts
export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  return aiChat(messages, 500);
}
