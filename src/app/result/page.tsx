'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useTimeBackground } from '@/hooks/useTimeBackground';
import { getUser } from '@/lib/auth';
import { convertGuestToEmail } from '@/lib/auth';
import { trackEvent } from '@/lib/posthog';
import { Suspense } from 'react';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'completed';
  const { history, fetchHistory } = useSession();
  useTimeBackground();

  const [isGuest, setIsGuest] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState('');
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [sessionEndTime] = useState(Date.now());

  useEffect(() => {
    fetchHistory();
    checkGuest();
  }, []);

  async function checkGuest() {
    const user = await getUser();
    if (!user) {
      router.push('/');
      return;
    }
    setIsGuest(!user.email);
  }

  function handleRecommit() {
    const gap = Math.floor((Date.now() - sessionEndTime) / 1000);
    trackEvent('recommit', { gap_seconds: gap });
    router.push('/entry');
  }

  async function handleConvert() {
    setConverting(true);
    setConvertError('');
    try {
      await convertGuestToEmail(email, password);
      trackEvent('guest_to_email');
      setConvertSuccess(true);
      setIsGuest(false);
    } catch (err: unknown) {
      setConvertError(err instanceof Error ? err.message : '전환에 실패했습니다');
    } finally {
      setConverting(false);
    }
  }

  const isCompleted = status === 'completed';

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Result Status */}
        <div className="text-center">
          <div className="text-5xl mb-3">{isCompleted ? '🎉' : '⏱'}</div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            {isCompleted ? '미션 완료!' : '타임아웃'}
          </h1>
          {!isCompleted && (
            <p className="text-sm text-text-secondary">다음엔 완료해봐요</p>
          )}
        </div>

        {/* Re-enter CTA */}
        <button
          onClick={handleRecommit}
          className="w-full py-3.5 rounded-[10px] bg-accent text-accent-text font-semibold text-[15px] transition-opacity hover:opacity-85"
        >
          다시 입장하기
        </button>

        {/* Email Conversion Banner (guests only) */}
        {isGuest && !convertSuccess && (
          <div className="w-full rounded-[14px] border border-border p-4 bg-bg-surface">
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full text-left"
              >
                <p className="text-sm text-text-primary font-medium">
                  기록을 저장하려면
                </p>
                <p className="text-sm text-accent">
                  이메일 등록 →
                </p>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-text-primary font-medium">
                  이메일을 등록하면 기록이 영구 저장됩니다
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  className="w-full border border-border rounded-[10px] py-2.5 px-3 bg-bg-surface text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none focus:ring-0 text-sm"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자 이상)"
                  className="w-full border border-border rounded-[10px] py-2.5 px-3 bg-bg-surface text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none focus:ring-0 text-sm"
                />
                {convertError && (
                  <p className="text-xs text-error">{convertError}</p>
                )}
                <button
                  onClick={handleConvert}
                  disabled={converting || !email || password.length < 6}
                  className="w-full py-2.5 rounded-[10px] bg-accent text-accent-text font-medium text-sm transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {converting ? '이관 중...' : '기록 저장하기'}
                </button>
              </div>
            )}
          </div>
        )}

        {convertSuccess && (
          <div className="w-full rounded-[14px] border border-success/30 p-3 bg-success/5">
            <p className="text-sm text-success text-center">
              ✓ 기록이 저장되었습니다!
            </p>
          </div>
        )}

        {/* Session History */}
        <div className="w-full">
          <h2 className="text-sm text-text-secondary mb-3 text-center">
            ── 나의 기록 ──
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-text-secondary text-center">
              아직 기록이 없습니다
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm text-text-primary truncate max-w-[140px]">
                    {session.task_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs text-text-secondary"
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {session.duration_minutes}분
                    </span>
                    <span
                      className={`text-xs ${
                        session.status === 'completed'
                          ? 'text-success'
                          : 'text-error'
                      }`}
                    >
                      {session.status === 'completed' ? '✓완료' : '⏱타임아웃'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-text-secondary">로딩 중...</div>}>
      <ResultContent />
    </Suspense>
  );
}
