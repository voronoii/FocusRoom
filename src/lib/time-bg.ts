export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

export function getBackgroundColor(time: TimeOfDay): string {
  switch (time) {
    case 'morning': return '#FFF8F0';
    case 'afternoon': return '#FFFFFF';
    case 'evening': return '#1A1B2E';
  }
}

export function isDarkTime(time: TimeOfDay): boolean {
  return time === 'evening';
}
