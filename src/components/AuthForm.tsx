'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, string> = { username, password };
      if (isRegister) payload.email = email;

      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl text-cyan-400 mb-2"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            CodeBot
          </h1>
          <p className="text-zinc-400 text-sm font-mono">
            {isRegister ? 'Create your account' : 'Welcome back, coder'}
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#111118] border border-zinc-800 rounded-xl p-8 space-y-5 shadow-lg shadow-cyan-500/5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm font-mono">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={isRegister ? 3 : 1}
              maxLength={30}
              placeholder={isRegister ? 'cool_coder_42' : 'username or email'}
              className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
            />
          </div>

          {/* Email (register only) */}
          {isRegister && (
            <div>
              <label htmlFor="email" className="block text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-zinc-300 text-xs font-mono uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isRegister ? 6 : 1}
              maxLength={100}
              placeholder="••••••••"
              className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-black font-bold font-mono py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
          >
            {loading ? '>> Loading...' : isRegister ? '>> Create Account' : '>> Log In'}
          </button>

          {/* Switch link */}
          <p className="text-center text-zinc-500 text-sm font-mono">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  Log in
                </Link>
              </>
            ) : (
              <>
                New to CodeBot?{' '}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  Register
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
