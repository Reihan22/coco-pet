'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard';

export default function LeaderboardPage() {
  const [username, setUsername] = useState<string | undefined>();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.username) setUsername(data.user.username);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 14,
            color: '#00ffd5',
          }}>
            🤖 CodeBot
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {username ? (
            <Link href="/dashboard" style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 9,
              color: '#00ffd5',
              textDecoration: 'none',
              border: '2px solid #00ffd5',
              padding: '8px 16px',
            }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 9,
                color: '#666',
                textDecoration: 'none',
                border: '2px solid #333',
                padding: '8px 16px',
              }}>
                Login
              </Link>
              <Link href="/register" style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 9,
                color: '#00ffd5',
                textDecoration: 'none',
                border: '2px solid #00ffd5',
                padding: '8px 16px',
              }}>
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 'clamp(16px, 3vw, 24px)',
        color: '#ffd700',
        marginBottom: 8,
        textShadow: '0 0 30px rgba(255,215,0,0.3)',
      }}>
        🏆 Leaderboard
      </h1>
      <p style={{
        fontSize: 13,
        color: '#666',
        marginBottom: 30,
        lineHeight: 1.6,
      }}>
        Top players, guilds, and battle champions.
      </p>

      {/* Leaderboard */}
      <Leaderboard currentUsername={username} />

      {/* Login CTA if not logged in */}
      {!username && (
        <div style={{
          marginTop: 40,
          padding: '24px',
          background: 'rgba(0,255,213,0.04)',
          border: '1px solid rgba(0,255,213,0.15)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 10,
            color: '#00ffd5',
            marginBottom: 12,
          }}>
            Want to climb the ranks?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link href="/register" style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 9,
              color: '#00ffd5',
              textDecoration: 'none',
              border: '2px solid #00ffd5',
              padding: '10px 20px',
            }}>
              Get Started
            </Link>
            <Link href="/login" style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 9,
              color: '#666',
              textDecoration: 'none',
              border: '2px solid #333',
              padding: '10px 20px',
            }}>
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
