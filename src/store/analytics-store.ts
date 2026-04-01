import { create } from 'zustand';

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
  isSyncing: boolean;
  
  // Actions
  queueEvent: (event: BlockEvent) => void;
  syncEvents: () => Promise<void>;
  clearQueue: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  eventQueue: [],
  isSyncing: false,

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

  clearQueue: () => set({ eventQueue: [] })
}));
