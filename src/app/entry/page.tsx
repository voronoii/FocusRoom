'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { usePresence } from '@/hooks/usePresence';
import { useSession } from '@/hooks/useSession';
import { useTimeBackground } from '@/hooks/useTimeBackground';
import { trackEvent } from '@/lib/posthog';

const DURATION_OPTIONS = [25, 50, 90] as const;
type DurationOption = (typeof DURATION_OPTIONS)[number];

export default function EntryPage() {
  const router = useRouter();
  useTimeBackground();

  const { userCount } = usePresence('room:main');
  const { activeSession, loading: sessionLoading, createSession } = useSession();

  const [authChecked, setAuthChecked] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState<DurationOption>(50);
  const [entering, setEntering] = useState(false);

  // Auth check + active session redirect
  useEffect(() => {
    async function check() {
      const user = await getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      setAuthChecked(true);
    }
    check();
  }, [router]);

  // Redirect to room if active session exists
  useEffect(() => {
    if (!sessionLoading && activeSession) {
      router.replace('/room');
    }
  }, [sessionLoading, activeSession, router]);

  async function handleEnter() {
    if (!taskName.trim() || entering) return;
    setEntering(true);
    try {
      await createSession(taskName.trim(), duration);
      trackEvent('session_start', { task_name: taskName.trim(), duration_minutes: duration });
      router.push('/room');
    } catch {
      setEntering(false);
    }
  }

  if (!authChecked || sessionLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <p className="text-text-secondary text-sm">확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* 1. 접속자 수 */}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--online-dot)' }}
          />
          <span className="text-sm text-text-secondary">
            {userCount}명이 지금 집중 중
          </span>
        </div>

        {/* 2. 할 일 입력 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">
            오늘 할 일
          </label>
          <input
            type="text"
            value={taskName}
            onChange={e => setTaskName(e.target.value.slice(0, 30))}
            placeholder="오늘 할 일을 입력해주세요"
            maxLength={30}
            className="border border-border rounded-[10px] py-3 px-3.5 bg-bg-surface w-full text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none focus:ring-0 transition-colors duration-[150ms]"
            onKeyDown={e => {
              if (e.key === 'Enter') handleEnter();
            }}
          />
        </div>

        {/* 3. 시간 선택 */}
        <div className="flex flex-col gap-3">
          <span className="text-sm text-text-secondary">집중 시간:</span>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setDuration(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-[150ms] ${
                  duration === opt
                    ? 'border border-accent text-text-primary font-semibold'
                    : 'bg-bg-surface text-text-secondary border border-border'
                }`}
              >
                {opt}분
              </button>
            ))}
          </div>
        </div>

        {/* 4. 입장하기 CTA */}
        <button
          onClick={handleEnter}
          disabled={!taskName.trim() || entering}
          className="w-full py-3.5 rounded-[10px] text-[15px] font-semibold text-accent-text transition-opacity duration-[150ms] disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {entering ? '입장 중...' : '입장하기'}
        </button>

      </div>
    </div>
  );
}
