'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string };
}

export default function GuildChat({ guildId }: { guildId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const shouldScroll = useRef(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/guilds/${guildId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch { /* ignore */ }
  }, [guildId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (shouldScroll.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Track if user scrolled up
  function handleScroll() {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    shouldScroll.current = scrollHeight - scrollTop - clientHeight < 60;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/guilds/${guildId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        setInput('');
        shouldScroll.current = true;
        fetchMessages();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send');
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      <h3 style={{
        fontFamily: "var(--font-pixel)", fontSize: 10,
        color: '#b44dff', marginBottom: 12, letterSpacing: 1,
      }}>
        💬 SQUAD CHAT
      </h3>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: 'auto', padding: 12,
          background: 'rgba(0,0,0,0.3)', border: '1px solid #222',
          marginBottom: 12, minHeight: 300, maxHeight: 500,
        }}
      >
        {messages.length === 0 ? (
          <p style={{
            textAlign: 'center', color: '#444',
            fontFamily: "var(--font-pixel)", fontSize: 8, padding: 20,
          }}>
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 8,
                  color: '#b44dff',
                }}>
                  {msg.user.username}
                </span>
                <span style={{ fontSize: 8, color: '#444' }}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              <p style={{
                margin: '2px 0 0 0', color: '#ccc', fontSize: 10,
                lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {msg.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          placeholder="Type message..."
          maxLength={1000}
          style={{
            flex: 1, padding: '10px 14px',
            background: 'rgba(255,255,255,0.05)', border: '2px solid #333',
            color: '#fff', fontFamily: "var(--font-pixel)", fontSize: 9,
            outline: 'none', borderRadius: 0,
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          style={{
            fontFamily: "var(--font-pixel)", fontSize: 9,
            padding: '10px 20px', cursor: 'pointer',
            background: 'rgba(180,77,255,0.2)', border: '2px solid #b44dff',
            color: '#b44dff', opacity: sending ? 0.5 : 1,
          }}
        >
          {sending ? '...' : 'SEND'}
        </button>
      </form>

      {error && (
        <p style={{
          color: '#ff2d78', fontFamily: "var(--font-pixel)",
          fontSize: 8, marginTop: 6,
        }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
