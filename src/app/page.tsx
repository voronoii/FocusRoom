'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signInAsGuest, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { usePresence } from '@/hooks/usePresence';
import { useTimeBackground } from '@/hooks/useTimeBackground';

type EmailMode = 'signup' | 'login';

export default function AuthPage() {
  const router = useRouter();
  useTimeBackground();

  const { userCount } = usePresence('room:main');

  const [checking, setChecking] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if session already exists
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if user has an active focus session in DB
          const { data: activeSession } = await supabase
            .from('sessions')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single();

          if (activeSession) {
            router.push('/room');
          } else {
            router.push('/entry');
          }
          return;
        }
      } catch {
        // No session or DB error — stay on auth page
      } finally {
        setChecking(false);
      }
    }
    checkSession();
  }, [router]);

  async function handleGuestSignIn() {
    setGuestLoading(true);
    setError(null);
    try {
      await signInAsGuest();
      router.push('/entry');
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요. 다시 시도해주세요.');
      setGuestLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    try {
      if (emailMode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/entry');
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요. 다시 시도해주세요.');
      setEmailLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <p className="text-text-secondary text-sm">확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1
            className="text-3xl font-semibold text-text-primary"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            FocusRoom
          </h1>
          <p className="text-[15px] text-text-secondary">
            함께 집중하는 가상 공간
          </p>
        </div>

        {/* Online count */}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--online-dot)' }}
          />
          <span className="text-sm text-text-secondary">
            {userCount}명이 지금 집중 중
          </span>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          {/* Primary: Guest */}
          <button
            onClick={handleGuestSignIn}
            disabled={guestLoading}
            className="w-full py-3.5 rounded-[10px] text-[15px] font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--text-primary)' }}
          >
            {guestLoading ? '확인 중...' : '바로 시작하기 (게스트)'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-text-secondary">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Secondary: Email */}
          {!emailExpanded ? (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEmailExpanded(true)}
                className="w-full py-3.5 rounded-[10px] text-[15px] font-semibold text-text-primary border border-border transition-colors hover:bg-border/30"
              >
                이메일로 시작하기
              </button>
              <p className="text-xs text-text-secondary text-center">
                기록이 저장됩니다
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-[10px] border border-border bg-bg-surface text-text-primary text-[15px] placeholder:text-text-secondary outline-none focus:border-text-secondary transition-colors"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-[10px] border border-border bg-bg-surface text-text-primary text-[15px] placeholder:text-text-secondary outline-none focus:border-text-secondary transition-colors"
              />

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3.5 rounded-[10px] text-[15px] font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: 'var(--text-primary)' }}
              >
                {emailLoading
                  ? '확인 중...'
                  : emailMode === 'signup'
                    ? '가입하기'
                    : '로그인'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'signup' ? 'login' : 'signup');
                  setError(null);
                }}
                className="text-sm text-text-secondary text-center hover:text-text-primary transition-colors"
              >
                {emailMode === 'signup'
                  ? '이미 계정이 있어요'
                  : '계정이 없어요, 가입하기'}
              </button>
            </form>
          )}
        </div>

        {/* Global error (guest) */}
        {error && !emailExpanded && (
          <p className="text-sm text-error text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
