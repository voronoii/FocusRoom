'use client';

import { useState, useEffect } from 'react';
import { supabase, type Session } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

export function useSession() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkActiveSession();
  }, []);

  async function checkActiveSession() {
    try {
      const user = await getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setActiveSession(data as Session);
    } catch {
      // No active session
    } finally {
      setLoading(false);
    }
  }

  async function createSession(taskName: string, durationMinutes: number): Promise<Session> {
    const user = await getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        task_name: taskName,
        duration_minutes: durationMinutes,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    const session = data as Session;
    setActiveSession(session);
    return session;
  }

  async function completeSession() {
    if (!activeSession) return;

    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', activeSession.id);

    if (error) throw error;
    setActiveSession(null);
  }

  async function fetchHistory() {
    const user = await getUser();
    if (!user) return;

    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(20);

    if (data) setHistory(data as Session[]);
  }

  return {
    activeSession,
    history,
    loading,
    createSession,
    completeSession,
    fetchHistory,
    checkActiveSession,
  };
}
