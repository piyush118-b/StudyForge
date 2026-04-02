import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/task-store';
import { useNotificationStore } from '@/store/notification-store';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export function useSmartReminders() {
  const { tasks } = useTaskStore();
  const { notifications, addNotification, markAsSent } = useNotificationStore();
  const { user } = useAuth();
  
  // Track notified task IDs to prevent spamming
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request notification permissions
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    // Background scanner runs every 1 minute
    const interval = setInterval(() => {
      const now = new Date();
      const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate);

      activeTasks.forEach(task => {
        if (!task.dueDate) return;

        // If no dueTime, assume 23:59:59
        const taskDueString = task.dueTime 
          ? `${task.dueDate}T${task.dueTime}:00` 
          : `${task.dueDate}T23:59:59`;
          
        const due = new Date(taskDueString);
        if (isNaN(due.getTime())) return;

        const diffMinutes = (due.getTime() - now.getTime()) / 60000;
        const reminderLeadTime = task.reminderMinutes || 30;

        // Condition: Due in the next `reminderLeadTime` minutes and hasn't been notified yet
        if (diffMinutes > 0 && diffMinutes <= reminderLeadTime && !notifiedTasks.current.has(task.id)) {
          
          // Fire Browser Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('StudyForge Reminder ⏳', {
              body: `"${task.title}" is due in ${Math.round(diffMinutes)} minutes!`,
              icon: '/favicon.ico'
            });
          } else {
            // Fallback to Sonner toast
            toast.message(`⏳ Reminder: ${task.title}`, {
              description: `Due in ${Math.round(diffMinutes)} minutes. Time to focus!`,
              duration: 10000,
            });
          }

          // Log it in Notification Store
          addNotification({
            userId: user?.id || 'guest',
            taskId: task.id,
            type: 'task_due',
            title: `Task Due Soon: ${task.title}`,
            body: `This task is due in ${Math.round(diffMinutes)} mins. Consider starting a Pomodoro session now.`,
            scheduledFor: now.toISOString(),
          }, user?.id);

          notifiedTasks.current.add(task.id);
        }
      });

      // Also mark pending scheduled notifications as sent if their time has passed
      notifications.forEach(n => {
        if (!n.isSent && !n.isDismissed && new Date(n.scheduledFor) <= now) {
          
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`StudyForge: ${n.title}`, { body: n.body });
          } else {
            toast(n.title, { description: n.body });
          }

          markAsSent(n.id, user?.id);
        }
      });

    }, 60000); // Check every 60s

    return () => clearInterval(interval);
  }, [tasks, notifications, addNotification, markAsSent, user?.id]);
}
