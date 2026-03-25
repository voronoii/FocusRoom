'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { usePresence } from '@/hooks/usePresence';
import { useTimeBackground } from '@/hooks/useTimeBackground';
import { calculateNpcCount, generateNpc, type NpcAvatar } from '@/lib/npc';
import {
  initAmbientSound,
  startAmbientSound,
  stopAmbientSound,
  toggleMute,
} from '@/lib/sound';
import { TimerBar } from '@/components/TimerBar';
import { AvatarGrid } from '@/components/AvatarGrid';
import type { PresenceState } from '@/lib/supabase';

type GridItem = (PresenceState & { emoji?: string }) | NpcAvatar;

export default function RoomPage() {
  const router = useRouter();
  useTimeBackground();

  const { activeSession, loading, completeSession } = useSession();
  const { users, userCount, trackPresence } = usePresence('room:main');

  const [npcs, setNpcs] = useState<NpcAvatar[]>([]);
  const [waveNpcIds, setWaveNpcIds] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const npcRotationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundInitRef = useRef(false);

  // Auth + session guard
  useEffect(() => {
    if (loading) return;
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !activeSession) {
        router.replace('/entry');
      }
    }
    checkAuth();
  }, [loading, activeSession, router]);

  // Initialize NPCs on mount once real user count is known
  useEffect(() => {
    if (loading) return;
    const npcCount = calculateNpcCount(userCount);
    const generated = Array.from({ length: npcCount }, (_, i) => generateNpc(i));
    setNpcs(generated);

    // Trigger wave on 2 random NPCs
    const waveIds = new Set<string>();
    if (generated.length > 0) {
      setTimeout(() => {
        waveIds.add(generated[0].id);
        setWaveNpcIds(new Set(waveIds));
      }, 800);
    }
    if (generated.length > 1) {
      setTimeout(() => {
        const idx = Math.min(1, generated.length - 1);
        waveIds.add(generated[idx].id);
        setWaveNpcIds(new Set(waveIds));
      }, 1200);
    }
    // Clear waves after 2s
    setTimeout(() => setWaveNpcIds(new Set()), 3200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Entry animation: sound at 500ms, timer at 1500ms
  useEffect(() => {
    if (!activeSession) return;

    const soundTimer = setTimeout(async () => {
      if (!soundInitRef.current) {
        soundInitRef.current = true;
        await initAmbientSound();
        startAmbientSound(userCount + npcs.length);
      }
    }, 500);

    const timerActivate = setTimeout(() => {
      setTimerStarted(true);
    }, 1500);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(timerActivate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  // Track presence
  useEffect(() => {
    if (!activeSession) return;
    async function track() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_seed')
        .eq('id', user.id)
        .single();

      if (profile && activeSession) {
        await trackPresence({
          user_id: user.id,
          display_name: profile.display_name,
          avatar_seed: profile.avatar_seed,
          task_name: activeSession.task_name,
          duration_minutes: activeSession.duration_minutes,
          started_at: activeSession.started_at,
          is_npc: false,
        });
      }
    }
    track();
  }, [activeSession, trackPresence]);

  // NPC rotation every 5–15 minutes
  const scheduleNpcRotation = useCallback(() => {
    const delay = (Math.random() * 10 + 5) * 60 * 1000;
    npcRotationRef.current = setTimeout(() => {
      setNpcs(prev => {
        if (prev.length === 0) return prev;
        const removeIdx = Math.floor(Math.random() * prev.length);
        const newNpc = generateNpc(Date.now());
        const next = [...prev];
        next[removeIdx] = newNpc;
        return next;
      });
      scheduleNpcRotation();
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNpcRotation();
    return () => {
      if (npcRotationRef.current) clearTimeout(npcRotationRef.current);
    };
  }, [scheduleNpcRotation]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const handleComplete = useCallback(async () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    try {
      await completeSession();
    } catch {
      // ignore — still redirect
    }
    router.push('/result?status=completed');
  }, [completeSession, router]);

  const handleTimeout = useCallback(() => {
    setIsTimedOut(true);
    setTimeout(() => {
      router.push('/result?status=timeout');
    }, 800);
  }, [router]);

  const handleSoundToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    toggleMute(next);
  };

  // Build grid items: other real users + NPCs (exclude self)
  const [myUserId, setMyUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setMyUserId(user.id);
    });
  }, []);

  const otherUsers = users.filter(u => u.user_id !== myUserId);
  const gridItems: GridItem[] = [...otherUsers, ...npcs];
  const totalCount = 1 + otherUsers.length + npcs.length;

  if (loading || !activeSession) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <p className="text-text-secondary text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={isTimedOut ? { boxShadow: 'inset 0 0 80px 40px rgba(0,0,0,0.5)' } : undefined}
    >
      {/* Sticky timer bar */}
      {timerStarted && (
        <TimerBar
          emoji="🦊"
          displayName="나"
          taskName={activeSession.task_name}
          startedAt={activeSession.started_at}
          durationMinutes={activeSession.duration_minutes}
          onComplete={handleComplete}
          onFiveMinWarning={undefined}
        />
      )}
      {isOffline && (
        <div className="w-full py-2 px-4 bg-warning/10 text-warning text-sm text-center border-b border-warning/20">
          연결 끊김 — 타이머는 계속됩니다
        </div>
      )}
      {!timerStarted && (
        <div
          className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span className="text-2xl">🦊</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-text-secondary">나</span>
            <span className="text-sm font-medium text-text-primary truncate">
              {activeSession.task_name}
            </span>
          </div>
          <span className="font-mono text-lg text-text-secondary tabular-nums">--:--</span>
          <button
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium text-white opacity-40 cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)' }}
            disabled
          >
            ✓ 완료했어요
          </button>
        </div>
      )}

      {/* Room header */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <h1 className="text-lg font-semibold text-text-primary">🏠 Focus Room</h1>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--online-dot)' }}
          />
          <span className="text-sm text-text-secondary">{totalCount}명</span>
        </div>
      </div>

      {/* Avatar grid */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AvatarGrid items={gridItems} waveNpcIds={waveNpcIds} />
      </div>

      {/* Timer timeout side effect */}
      {timerStarted && (
        <TimeoutTrigger
          startedAt={activeSession.started_at}
          durationMinutes={activeSession.duration_minutes}
          onTimeout={handleTimeout}
        />
      )}

      {/* Sound toggle */}
      <button
        onClick={handleSoundToggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-opacity hover:opacity-80 active:opacity-60"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

// Lightweight component that fires onTimeout when timer reaches 0
function TimeoutTrigger({
  startedAt,
  durationMinutes,
  onTimeout,
}: {
  startedAt: string;
  durationMinutes: number;
  onTimeout: () => void;
}) {
  const firedRef = useRef(false);
  useEffect(() => {
    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeout();
      }
      return;
    }
    const t = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeout();
      }
    }, remaining);
    return () => clearTimeout(t);
  }, [startedAt, durationMinutes, onTimeout]);

  return null;
}
