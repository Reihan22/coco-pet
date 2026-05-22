'use client';

import { useState, useRef, useEffect } from 'react';

const AI_LABEL = process.env.NEXT_PUBLIC_AI_LABEL || 'Xiaomi MiMo V2.5 Pro';
const MAX_MESSAGES = 10;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function PetChat({ petName }: { petName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg].slice(-MAX_MESSAGES));
    setInput('');
    setIsLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              fullText = '*confused noises* Something went wrong! 🤕';
              break;
            }
            if (parsed.content) {
              fullText += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                updated[lastIdx] = { ...updated[lastIdx], content: fullText };
                return updated;
              });
            }
          } catch {
            // skip parse errors
          }
        }
      }

      if (!fullText) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: "*yawns* I'm sleepy... try again? 😴",
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = {
          ...updated[lastIdx],
          content: '*confused noises* Something went wrong! 🤕',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 420,
        background: '#0a0a0f',
        border: '1px solid #222',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #222',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 11,
            color: '#00ffd5',
          }}
        >
          💬 Chat with {petName}
        </span>
        <span
          style={{
            fontSize: 9,
            color: '#555',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {AI_LABEL}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#444',
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <p>Talk to {petName}!</p>
            <p style={{ fontSize: 11, marginTop: 6, color: '#333' }}>
              Ask about coding, how they feel, or just say hi~
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                fontSize: 13,
                lineHeight: 1.5,
                borderRadius:
                  msg.role === 'user'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                background:
                  msg.role === 'user'
                    ? 'rgba(255,45,120,0.15)'
                    : 'rgba(0,255,213,0.1)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(255,45,120,0.2)' : 'rgba(0,255,213,0.2)'}`,
                color: '#ddd',
              }}
            >
              {msg.role === 'assistant' && !msg.content && isLoading ? (
                <span
                  style={{
                    color: '#00ffd5',
                    animation: 'blink 1s step-end infinite',
                  }}
                >
                  ●●●
                </span>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 12px',
          borderTop: '1px solid #222',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Talk to ${petName}...`}
          disabled={isLoading}
          style={{
            flex: 1,
            background: '#0a0a0f',
            border: '2px solid #333',
            color: '#e0e0e0',
            padding: '10px 14px',
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            outline: 'none',
            opacity: isLoading ? 0.6 : 1,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            background:
              isLoading || !input.trim() ? '#222' : 'rgba(0,255,213,0.13)',
            border: `2px solid ${isLoading || !input.trim() ? '#333' : '#00ffd5'}`,
            color: isLoading || !input.trim() ? '#555' : '#00ffd5',
            cursor: isLoading ? 'wait' : 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            transition: 'all 0.2s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
