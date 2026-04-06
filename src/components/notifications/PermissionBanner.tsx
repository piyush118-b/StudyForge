'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/lifecycle';

export function PermissionBanner() {
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  useEffect(() => {
    // Only show if supported and currently default
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perms = Notification.permission;
      const dismissed = localStorage.getItem('studyforge_push_dismissed');
      if (perms === 'default' && !dismissed) {
        // Show after a slight delay
        const t = setTimeout(() => setShowPermissionBanner(true), 1500);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        trackEvent('push_notification_enabled');
      }
    } catch (e) {
      console.error(e);
    }
    setShowPermissionBanner(false);
  };

  const dismissPermissionBanner = () => {
    localStorage.setItem('studyforge_push_dismissed', 'true');
    setShowPermissionBanner(false);
  };

  if (!showPermissionBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-start gap-3 animate-[forge-fade-in_0.3s_ease-out_forwards]">

        <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-xl flex-shrink-0">
          🔔
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F0F0F0] mb-0.5">
            Enable study reminders?
          </p>
          <p className="text-xs text-[#A0A0A0] leading-relaxed mb-3">
            Get notified before each study block so you never miss a session.
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="h-8 px-3 rounded-lg bg-[#10B981] text-[#0A0A0A] text-xs font-bold hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
              Enable
            </button>
            <button
              onClick={dismissPermissionBanner}
              className="h-8 px-3 rounded-lg border border-[#2A2A2A] bg-transparent text-xs font-medium text-[#606060] hover:bg-[#222222] hover:text-[#A0A0A0] transition-all duration-150-all duration-150 active:scale-[0.97]">
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={dismissPermissionBanner}
          className="text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors flex-shrink-0 active:scale-[0.97]">
          ×
        </button>
      </div>
    </div>
  );
}
