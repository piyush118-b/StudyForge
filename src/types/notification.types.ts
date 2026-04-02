// ============================================================
// Phase 3 – Notification Types
// ============================================================

export type NotificationType = 'task_due' | 'block_start' | 'daily_nudge' | 'overload_warning' | 'study_tip';

export interface AppNotification {
  id: string;
  userId: string;
  taskId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  scheduledFor: string;
  sentAt: string | null;
  isSent: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export interface GuestNotificationStore {
  notifications: AppNotification[];
  lastChecked: string;
}
