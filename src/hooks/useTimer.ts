'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  startedAt: string;
  durationMinutes: number;
  onComplete?: () => void;
  onFiveMinWarning?: () => void;
}

export function useTimer({ startedAt, durationMinutes, onComplete, onFiveMinWarning }: UseTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    let warningFired = false;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 300 && !warningFired) {
        setIsUrgent(true);
        warningFired = true;
        onFiveMinWarning?.();
      }

      if (remaining <= 0) {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 1000);

    // Initial calculation
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    setRemainingSeconds(remaining);
    if (remaining <= 300) setIsUrgent(true);

    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, onComplete, onFiveMinWarning]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [remainingSeconds]);

  return { remainingSeconds, isUrgent, isComplete, formatTime };
}
