'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, type PresenceState } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function usePresence(channelName: string = 'room:main') {
  const [users, setUsers] = useState<PresenceState[]>([]);
  const [userCount, setUserCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const allUsers = Object.values(state).flat();
        setUsers(allUsers);
        setUserCount(allUsers.length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelName]);

  const trackPresence = useCallback(async (userState: PresenceState) => {
    if (channelRef.current) {
      await channelRef.current.track(userState);
    }
  }, []);

  const untrackPresence = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack();
    }
  }, []);

  return { users, userCount, trackPresence, untrackPresence };
}
