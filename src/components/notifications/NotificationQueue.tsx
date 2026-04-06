'use client';

import { useNotificationStore } from '@/store/notification-store';
import { useAuth } from '@/lib/auth-context';

export function NotificationQueue() {
  const { notifications, dismissNotification } = useNotificationStore();
  const { user } = useAuth();
  
  // Only show notifications that haven't been dismissed manually and are visually "active"
  const activeNotifications = notifications.filter(n => !n.isDismissed).slice(0, 5); // display max 5

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {activeNotifications.map((notif, i) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.4)] p-4 flex items-start gap-3 animate-[forge-slide-right_0.25s_ease-out_forwards]"
          style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
        >
          {(notif.type as string) === 'study_session' ? (
            <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.12)] flex items-center justify-center flex-shrink-0 text-base">
              📚
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${
              (notif.type as string) === 'success' ? 'bg-[rgba(16,185,129,0.12)]' :
              (notif.type as string) === 'error'   ? 'bg-[rgba(239,68,68,0.12)]' :
              (notif.type as string) === 'warning' ? 'bg-[rgba(245,158,11,0.12)]' :
                                         'bg-[rgba(59,130,246,0.12)]'
            }`}>
              {(notif.type as string) === 'success' ? '✅' :
               (notif.type as string) === 'error'   ? '❌' :
               (notif.type as string) === 'warning' ? '⚠️' :
                                          'ℹ️'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {(notif.type as string) === 'study_session' && (
              <p className="text-xs text-[#10B981] font-semibold uppercase tracking-wider mb-0.5">
                Upcoming Session
              </p>
            )}
            
            {notif.title && (
              <p className="text-sm font-semibold text-[#F0F0F0] leading-snug mb-0.5">
                {notif.title}
              </p>
            )}
            
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              {notif.body}
            </p>
          </div>

          <button
            onClick={() => dismissNotification(notif.id, user?.id)}
            className="w-5 h-5 rounded flex items-center justify-center text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors duration-150 flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
