import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { AppNotification, GuestNotificationStore, NotificationType } from '@/types/notification.types';

const GUEST_KEY = 'sf_guest_notifications';

function readGuestNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as GuestNotificationStore).notifications;
  } catch {
    return [];
  }
}

function writeGuestNotifications(notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  const store: GuestNotificationStore = { notifications, lastChecked: new Date().toISOString() };
  localStorage.setItem(GUEST_KEY, JSON.stringify(store));
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  
  fetchNotifications: (userId?: string) => Promise<void>;
  addNotification: (data: Omit<AppNotification, 'id' | 'isSent' | 'isDismissed' | 'createdAt' | 'sentAt'>, userId?: string) => Promise<void>;
  markAsSent: (id: string, userId?: string) => Promise<void>;
  dismissNotification: (id: string, userId?: string) => Promise<void>;
  dismissAll: (userId?: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (userId?: string) => {
    try {
      let notifs: AppNotification[] = [];
      if (userId) {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', userId)
          .eq('is_dismissed', false)
          .order('scheduled_for', { ascending: false });
        if (!error && data) {
          notifs = data.map(mapRow);
        }
      } else {
        notifs = readGuestNotifications().filter(n => !n.isDismissed);
        // Clean up old ones for guests
        const activeLog = notifs.filter(n => new Date(n.scheduledFor) > new Date(Date.now() - 48*3600*1000));
        if (notifs.length > activeLog.length) writeGuestNotifications(activeLog);
        notifs = activeLog;
      }
      
      set({ 
        notifications: notifs,
        unreadCount: notifs.filter(n => !n.isSent).length 
      });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  },

  addNotification: async (data, userId?: string) => {
    const now = new Date().toISOString();
    const notification: AppNotification = {
      id: uuidv4(),
      ...data,
      sentAt: null,
      isSent: false,
      isDismissed: false,
      createdAt: now,
      userId: userId || 'guest'
    };

    if (userId) {
      await supabase.from('reminders').insert(mapToRow(notification) as any);
    } else {
      const all = [notification, ...readGuestNotifications()];
      writeGuestNotifications(all);
    }
    
    // Optimistic UI
    set((state) => {
      const next = [notification, ...state.notifications].sort((a,b) => b.scheduledFor.localeCompare(a.scheduledFor));
      return { notifications: next, unreadCount: next.filter(n => !n.isSent).length };
    });
  },

  markAsSent: async (id, userId?: string) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, isSent: true, sentAt: new Date().toISOString() } : n),
      unreadCount: Math.max(0, s.unreadCount - 1)
    }));

    if (userId) {
      await supabase.from('reminders').update({ is_sent: true, sent_at: new Date().toISOString() } as unknown as never).eq('id', id);
    } else {
      writeGuestNotifications(get().notifications);
    }
  },

  dismissNotification: async (id, userId?: string) => {
    set(s => ({
      notifications: s.notifications.filter(n => n.id !== id),
      // Recalc unread if the dismissed one wasn't sent yet
      unreadCount: s.notifications.filter(n => n.id !== id && !n.isSent).length
    }));

    if (userId) {
      await supabase.from('reminders').update({ is_dismissed: true } as unknown as never).eq('id', id);
    } else {
      writeGuestNotifications(get().notifications);
    }
  },

  dismissAll: async (userId?: string) => {
    set({ notifications: [], unreadCount: 0 });
    if (userId) {
      await supabase.from('reminders').update({ is_dismissed: true } as unknown as never).eq('user_id', userId).eq('is_dismissed', false);
    } else {
      writeGuestNotifications([]);
    }
  }
}));

// ── DB mapping helpers ──

function mapRow(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    taskId: (row.task_id as string) || null,
    type: row.type as NotificationType,
    title: row.title as string,
    body: row.body as string,
    scheduledFor: row.scheduled_for as string,
    sentAt: (row.sent_at as string) || null,
    isSent: row.is_sent as boolean,
    isDismissed: row.is_dismissed as boolean,
    createdAt: row.created_at as string,
  };
}

function mapToRow(n: AppNotification): Record<string, unknown> {
  return {
    id: n.id,
    user_id: n.userId,
    task_id: n.taskId,
    type: n.type,
    title: n.title,
    body: n.body,
    scheduled_for: n.scheduledFor,
    sent_at: n.sentAt,
    is_sent: n.isSent,
    is_dismissed: n.isDismissed,
    created_at: n.createdAt,
  };
}
