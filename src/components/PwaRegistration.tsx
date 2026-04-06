"use client";

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/lifecycle';

export function PwaRegistration() {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('StudyForge SW registered: ', registration.scope);
          })
          .catch((err) => {
            console.error('StudyForge SW registration failed: ', err);
          });
      });
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed recently
      const dismissed = localStorage.getItem('sf_pwa_dismissed');
      if (!dismissed) setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      trackEvent('pwa_installed' as any);
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissInstallBanner = () => {
    localStorage.setItem('sf_pwa_dismissed', 'true');
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 w-72 animate-[forge-fade-in_0.3s_ease-out_forwards]">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-lg flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            📱
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F0F0F0] leading-snug mb-0.5">
              Install StudyForge
            </p>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Add to your home screen for the best experience
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={triggerInstall}
            className="flex-1 h-9 rounded-xl bg-[#10B981] text-[#0A0A0A] text-xs font-bold hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
            Install App
          </button>
          <button
            onClick={dismissInstallBanner}
            className="h-9 px-3 rounded-xl border border-[#2A2A2A] bg-transparent text-xs text-[#606060] hover:text-[#A0A0A0] hover:bg-[#222222] transition-all duration-150-all duration-150 active:scale-[0.97]">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
