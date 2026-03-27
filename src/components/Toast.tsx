'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, duration = 3000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-text)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        zIndex: 9999,
        animation: 'toast-slide-up 300ms var(--ease-enter)',
      }}
    >
      {message}
    </div>
  );
}
