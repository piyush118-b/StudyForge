"use client";

import { useNotificationStore } from '@/store/notification-store';
import { useAuth } from '@/lib/auth-context';
import { useSmartReminders } from '@/hooks/useSmartReminders';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatDistanceToNow } from 'date-fns';
import { trackEvent } from '@/lib/lifecycle';
import { toast } from 'sonner';

export function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, markAsSent, dismissNotification, dismissAll } = useNotificationStore();
  const { user, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission | 'unsupported'>('default');

  // Initialize background smart reminders
  useSmartReminders();

  useEffect(() => {
    fetchNotifications(user?.id);
    if (typeof window !== 'undefined' && 'Notification' in window) {
       setPushStatus(Notification.permission);
    } else {
       setPushStatus('unsupported');
    }
  }, [user?.id]);

  const requestPushPermission = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
       toast.error("Push notifications are not supported in your browser.");
       return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
           toast.error("VAPID key not configured properly.");
           return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        const res = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify(subscription)
        });

        if (res.ok) {
           toast.success("Push notifications enabled!");
           trackEvent('push_notification_enabled');
        } else {
           throw new Error("Failed to subscribe");
        }
      }
    } catch (err: any) {
       console.error("Push setup error:", err);
       toast.error("Failed to enable push notifications.");
    }
  };

  // Helper
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="relative p-2 text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#1A1A1A] rounded-full transition-all duration-150-colors focus:outline-none">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[380px] z-[99999] bg-slate-950 border-[#2A2A2A] p-0 flex flex-col h-full overflow-hidden">
        <SheetHeader className="p-4 border-b border-[#2A2A2A] flex flex-row items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <SheetTitle className="text-lg font-bold text-[#F0F0F0] flex items-center gap-2">
            Notifications {unreadCount > 0 && <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>}
          </SheetTitle>
          {notifications.length > 0 && (
            <button 
              onClick={() => dismissAll(user?.id)}
              className="text-xs text-[#606060] hover:text-rose-400 transition-all duration-150-colors flex items-center gap-1"
            >
              Clear all <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {pushStatus === 'default' && (
             <div className="bg-indigo-900/20 border-b border-[#10B981]/10 p-4">
                <div className="flex items-center justify-between gap-3">
                   <p className="text-xs text-indigo-200">Enable push notifications to never miss a study block.</p>
                   <button onClick={requestPushPermission} className="px-3 py-1.5 bg-[#10B981] hover:bg-[#10B981] text-white text-xs font-semibold rounded-lg transition-all duration-150-colors whitespace-nowrap active:scale-[0.97]">
                     Enable
                   </button>
                </div>
             </div>
          )}

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#606060] space-y-3 p-8 text-center">
              <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-700" />
              </div>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 transition-all duration-150-colors hover:bg-[#111111]/50 ${!n.isSent ? 'bg-[#10B981]/5' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-[#10B981]" />
                        <h4 className="font-semibold text-sm text-slate-200 truncate">{n.title}</h4>
                      </div>
                      <p className="text-xs text-[#A0A0A0] leading-relaxed mb-2 line-clamp-2">
                        {n.body}
                      </p>
                      <span className="text-[10px] text-[#606060] font-mono">
                        {formatDistanceToNow(new Date(n.scheduledFor), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => dismissNotification(n.id, user?.id)}
                      className="p-1.5 text-[#606060] hover:text-[#F0F0F0] hover:bg-[#1A1A1A] rounded-md transition-all duration-150-colors"
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
