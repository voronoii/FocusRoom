'use client';

import { useTimer } from '@/hooks/useTimer';
import { Avatar } from '@/components/Avatar';

interface TimerBarProps {
  avatarSeed: string;
  displayName: string;
  taskName: string;
  startedAt: string;
  durationMinutes: number;
  onComplete: () => void;
  onFiveMinWarning?: () => void;
}

export function TimerBar({
  avatarSeed,
  displayName,
  taskName,
  startedAt,
  durationMinutes,
  onComplete,
  onFiveMinWarning,
}: TimerBarProps) {
  const { formatTime, isUrgent } = useTimer({
    startedAt,
    durationMinutes,
    onComplete,
    onFiveMinWarning,
  });

  return (
    <div
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Avatar seed={avatarSeed} size={32} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs text-text-secondary truncate">{displayName}</span>
        <span className="text-sm font-medium text-text-primary truncate">{taskName}</span>
      </div>
      <span
        className={`font-mono text-lg tabular-nums flex-shrink-0 ${isUrgent ? 'timer-urgent' : 'text-text-primary'}`}
      >
        {formatTime()}
      </span>
      <button
        onClick={onComplete}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80 active:opacity-60"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        ✓ 완료했어요
      </button>
    </div>
  );
}
