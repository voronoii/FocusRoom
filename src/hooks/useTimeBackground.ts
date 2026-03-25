'use client';

import { useState, useEffect } from 'react';
import { getTimeOfDay, getBackgroundColor, isDarkTime, type TimeOfDay } from '@/lib/time-bg';

export function useTimeBackground() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());

    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isDark = isDarkTime(timeOfDay);
    document.documentElement.classList.toggle('dark', isDark);

    // Update background CSS variable for morning/afternoon distinction
    document.documentElement.style.setProperty('--bg', getBackgroundColor(timeOfDay));

    // Update theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', getBackgroundColor(timeOfDay));
    }
  }, [timeOfDay]);

  return timeOfDay;
}
