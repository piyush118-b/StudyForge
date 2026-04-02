"use client";

import { useNotificationStore } from '@/store/notification-store';
import { useAuth } from '@/lib/auth-context';
import { useSmartReminders } from '@/hooks/useSmartReminders';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, markAsSent, dismissNotification, dismissAll } = useNotificationStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Initialize background smart reminders
  useSmartReminders();

  useEffect(() => {
    fetchNotifications(user?.id);
  }, [user?.id]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[380px] z-[99999] bg-slate-950 border-slate-800 p-0 flex flex-col h-full overflow-hidden">
        <SheetHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <SheetTitle className="text-lg font-bold text-white flex items-center gap-2">
            Notifications {unreadCount > 0 && <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>}
          </SheetTitle>
          {notifications.length > 0 && (
            <button 
              onClick={() => dismissAll(user?.id)}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              Clear all <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 p-8 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-700" />
              </div>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 transition-colors hover:bg-slate-900/50 ${!n.isSent ? 'bg-indigo-500/5' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-indigo-500" />
                        <h4 className="font-semibold text-sm text-slate-200 truncate">{n.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {n.body}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDistanceToNow(new Date(n.scheduledFor), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => dismissNotification(n.id, user?.id)}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                      title="Dismiss"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
