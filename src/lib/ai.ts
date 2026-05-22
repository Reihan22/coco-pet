const AI_ENDPOINT = process.env.AI_ENDPOINT || 'http://127.0.0.1:20128/v1';
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'MiMo-V2.5-Pro';

export const AI_LABEL = process.env.NEXT_PUBLIC_AI_LABEL || 'Xiaomi MiMo V2.5 Pro';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
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
    }),
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

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
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip parse errors
      }
    }
  }
}
