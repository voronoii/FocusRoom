'use client';

import { useTimer } from '@/hooks/useTimer';
import type { PresenceState } from '@/lib/supabase';
import type { NpcAvatar } from '@/lib/npc';

type AvatarItem = (PresenceState & { emoji?: string }) | NpcAvatar;

interface AvatarCardProps {
  item: AvatarItem;
  animationDelay: number;
  showWave: boolean;
}

function AvatarCard({ item, animationDelay, showWave }: AvatarCardProps) {
  const { formatTime, isUrgent } = useTimer({
    startedAt: item.started_at,
    durationMinutes: item.duration_minutes,
  });

  const emoji = (item as NpcAvatar).emoji ?? '🙂';
  const taskDisplay = item.task_name.length > 15
    ? item.task_name.slice(0, 15) + '…'
    : item.task_name;

  return (
    <div
      className="flex flex-col items-center gap-1 relative"
      style={{
        opacity: 0,
        animation: `fadeInUp 0.4s ease forwards`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {showWave && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg pointer-events-none"
          style={{
            animation: 'waveHide 2s ease forwards',
          }}
        >
          👋
        </div>
      )}
      <span className="text-3xl leading-none">{emoji}</span>
      <span className="text-xs text-text-secondary truncate max-w-[80px] text-center">
        {item.display_name}
      </span>
      <span className="text-sm text-text-primary truncate max-w-[80px] text-center">
        {taskDisplay}
      </span>
      <span
        className={`font-mono text-sm tabular-nums ${isUrgent ? 'timer-urgent' : 'text-text-secondary'}`}
      >
        {formatTime()}
      </span>
    </div>
  );
}

interface AvatarGridProps {
  items: AvatarItem[];
  waveNpcIds: Set<string>;
}

export function AvatarGrid({ items, waveNpcIds }: AvatarGridProps) {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes waveHide {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          70% { opacity: 1; transform: translateX(-50%) translateY(-4px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6 px-4 py-4">
        {items.map((item, i) => (
          <AvatarCard
            key={item.is_npc ? (item as NpcAvatar).id : (item as PresenceState).user_id}
            item={item}
            animationDelay={300 + i * 60}
            showWave={waveNpcIds.has(
              item.is_npc ? (item as NpcAvatar).id : (item as PresenceState).user_id
            )}
          />
        ))}
      </div>
    </>
  );
}
