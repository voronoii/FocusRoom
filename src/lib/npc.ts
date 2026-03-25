const NPC_TASKS = [
  '영어 공부', '코딩 연습', '보고서 작성', '단어 암기', '논문 작성',
  '회계 정리', 'UI 디자인', '버그 수정', '수학 풀기', '자격증 공부',
  '프레젠테이션', '이메일 정리', '블로그 글', '독서', '알고리즘',
  'TOEIC 공부', '면접 준비', '기획서 작성', '데이터 분석', '일본어 공부',
];

const NPC_NAMES = [
  '여우', '곰', '개구리', '올빼미', '고양이', '판다',
  '토끼', '나비', '강아지', '펭귄', '코알라', '다람쥐',
];

const NPC_EMOJIS = ['🦊', '🐻', '🐸', '🦉', '🐱', '🐼', '🐰', '🦋', '🐶', '🐧', '🐨', '🐿️'];

export interface NpcAvatar {
  id: string;
  display_name: string;
  avatar_seed: string;
  emoji: string;
  task_name: string;
  duration_minutes: number;
  started_at: string;
  remaining_minutes: number;
  is_npc: true;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNpc(index: number): NpcAvatar {
  const remainingMinutes = randomInt(10, 70);
  const durationMinutes = randomInt(remainingMinutes, 90);
  const startedAt = new Date(Date.now() - (durationMinutes - remainingMinutes) * 60000).toISOString();
  const nameIndex = index % NPC_NAMES.length;

  return {
    id: `npc-${index}-${Date.now()}`,
    display_name: `${NPC_NAMES[nameIndex]} #${randomInt(1000, 9999)}`,
    avatar_seed: `npc-${index}-${Math.random().toString(36).slice(2)}`,
    emoji: NPC_EMOJIS[nameIndex],
    task_name: randomItem(NPC_TASKS),
    duration_minutes: durationMinutes,
    started_at: startedAt,
    remaining_minutes: remainingMinutes,
    is_npc: true,
  };
}

export function calculateNpcCount(realUserCount: number): number {
  if (realUserCount >= 10) return 0;
  if (realUserCount >= 5) return Math.max(0, 12 - realUserCount);
  return randomInt(8, 12);
}
