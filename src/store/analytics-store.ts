import { create } from 'zustand';
import type { AnalyticsData } from '@/types/analytics.types';
import { supabase } from '@/lib/supabase';

const GUEST_SESSIONS_KEY = 'sf_guest_pomodoro_sessions';

export interface BlockEvent {
  id?: string;
  blockId: string;
  timetableId: string;
  userId: string;
  date: string;
  dayOfWeek: string;
  subject: string;
  subjectType: string;
  scheduledStart: string;
  scheduledEnd: string;
  scheduledHours: number;
  status: 'completed' | 'skipped' | 'partial';
  actualHours: number;
  skipReason?: string | null;
  completedAt?: string | null;
  skippedAt?: string | null;
  createdAt?: string;
}

interface AnalyticsStore {
  eventQueue: BlockEvent[];
  historicalEvents: BlockEvent[];
  isSyncing: boolean;
  
  // Phase 3 stats
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;

  // Actions
  queueEvent: (event: BlockEvent) => void;
  syncEvents: () => Promise<void>;
  clearQueue: () => void;
  fetchAnalytics: (userId?: string) => Promise<void>;
  loadHistoricalEvents: (userId: string, fromDate: string, toDate: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  eventQueue: [],
  historicalEvents: [],
  isSyncing: false,
  data: null,
  loading: false,
  error: null,

  queueEvent: (event) => set((state) => ({
    eventQueue: [...state.eventQueue, event]
  })),

  syncEvents: async () => {
    const { eventQueue, isSyncing } = get();
    if (isSyncing || eventQueue.length === 0) return;

    set({ isSyncing: true });

    try {
      // Stub for actual API call hitting /api/block-events
      const response = await fetch('/api/block-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventQueue })
      });

      if (response.ok) {
        set({ eventQueue: [], isSyncing: false });
      } else {
        throw new Error('Failed to sync');
      }
    } catch (err) {
      console.error('Analytics sync failed, will retry later.', err);
      set({ isSyncing: false });
    }
  },

  clearQueue: () => set({ eventQueue: [] }),

  fetchAnalytics: async (userId?: string) => {
    set({ loading: true, error: null });
    try {
      if (userId) {
        const res = await fetch('/api/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        set({ data });
      } else {
        // Guest Mode Aggregation
        const raw = localStorage.getItem(GUEST_SESSIONS_KEY);
        const sessions = raw ? JSON.parse(raw) : [];
        
        const dailyMap: Record<string, number> = {};
        const subjectMap: Record<string, number> = {};
        let weeklyFocus = 0;
        let weeklySessions = 0;

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const dayOfWeek = today.getDay();
        const dist = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dist);
        weekStart.setHours(0,0,0,0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sessions.forEach((row: any) => {
          if (row.status !== 'completed' || row.session_type !== 'focus') return;
          
          const rowDateObj = new Date(row.date);
          if (rowDateObj >= thirtyDaysAgo) {
            dailyMap[row.date] = (dailyMap[row.date] || 0) + row.actual_minutes;
            const sub = row.subject || 'Uncategorized';
            subjectMap[sub] = (subjectMap[sub] || 0) + row.actual_minutes;
          }

          if (rowDateObj >= weekStart && rowDateObj <= today) {
            weeklyFocus += row.actual_minutes;
            weeklySessions += 1;
          }
        });

        const dailyFocus = Object.entries(dailyMap).map(([date, minutes]) => ({ date, minutes })).sort((a,b) => a.date.localeCompare(b.date));
        
        const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];
        const subjectFocus = Object.entries(subjectMap)
          .map(([subject, minutes], i) => ({ subject, minutes, color: COLORS[i % COLORS.length] }))
          .sort((a,b) => b.minutes - a.minutes);

        const dates = Object.keys(dailyMap).sort().reverse();
        let curStreak = dates.length > 0 ? 1 : 0;
        let lDate = dates.length > 0 ? new Date(dates[0]) : null;
        
        for (let i = 1; i < dates.length; i++) {
          const d1 = new Date(dates[i-1]);
          const d2 = new Date(dates[i]);
          if ((d1.getTime() - d2.getTime()) === 86400000) {
            curStreak++;
          } else {
            break;
          }
        }

        set({
          data: {
            dailyFocus,
            subjectFocus,
            totalFocusThisWeek: weeklyFocus,
            totalSessionsThisWeek: weeklySessions,
            streak: {
              currentStreak: curStreak,
              longestStreak: curStreak,
              lastStudyDate: lDate ? lDate.toISOString().split('T')[0] : null
            }
          }
        });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error fetching analytics' });
    } finally {
      set({ loading: false });
    }
  },

  loadHistoricalEvents: async (userId, fromDate, toDate) => {
    set({ loading: true });
    try {
      const { data: logs, error } = await supabase
        .from('block_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_date', fromDate)
        .lte('scheduled_date', toDate);

      if (error) throw error;

      // Map back to BlockEvent interface
      const events: BlockEvent[] = (logs as any[] || []).map(row => ({
        id: row.id,
        blockId: row.block_id,
        timetableId: row.timetable_id,
        userId: row.user_id,
        date: row.scheduled_date,
        dayOfWeek: row.day_of_week,
        subject: row.subject,
        subjectType: row.block_type || 'Lecture',
        scheduledStart: row.scheduled_start,
        scheduledEnd: row.scheduled_end,
        scheduledHours: row.scheduled_hours || 0,
        status: row.status,
        actualHours: row.actual_hours || 0,
        skipReason: row.skip_reason,
        createdAt: row.created_at
      }));

      set({ historicalEvents: events });
    } catch (err) {
      console.error('Error loading historical events:', err);
    } finally {
      set({ loading: false });
    }
  }
}));
