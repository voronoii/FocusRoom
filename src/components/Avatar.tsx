'use client';

import { createAvatar } from '@dicebear/core';
import { adventurerNeutral } from '@dicebear/collection';

interface AvatarProps {
  seed: string;
  size?: number;
}

export function Avatar({ seed, size = 48 }: AvatarProps) {
  const svg = createAvatar(adventurerNeutral, { seed, size }).toString();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        overflow: 'hidden',
        flexShrink: 0,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
