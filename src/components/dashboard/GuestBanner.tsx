'use client';

import { useAuth } from '@/lib/auth-context';

export function GuestBanner() {
  const { user } = useAuth();
  
  if (user) return null;

  return (
    <div className="bg-gradient-to-r from-[#1A1A1A] to-[#1F1F1F] border-b border-[#2A2A2A] px-6 py-3 flex items-center justify-between gap-4 flex-wrap z-10 w-full relative">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-[rgba(59,130,246,0.15)] flex items-center justify-center text-sm">
          👋
        </div>
        <p className="text-sm text-[#A0A0A0]">
          <span className="text-[#F0F0F0] font-medium">You&apos;re in guest mode.</span>
          {' '}Your data is saved locally — create a free account to sync across devices.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <a href="/auth/login"
           className="h-8 px-3 rounded-lg border border-[#2A2A2A] text-xs font-medium text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] transition-all duration-150-all duration-150 flex items-center">
          Sign In
        </a>
        <a href="/auth/signup"
           className="h-8 px-4 rounded-lg bg-[#10B981] text-[#0A0A0A] text-xs font-bold hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97] flex items-center">
          Create Free Account
        </a>
      </div>
    </div>
  );
}
