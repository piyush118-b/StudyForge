'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function GuestMigrationPrompt() {
  const { user } = useAuth();
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);

  useEffect(() => {
    // Only check once user is logged in
    if (!user) return;
    
    // Check if there is guest data to migrate
    const guestTimetables = localStorage.getItem('sf_guest_timetables');
    const guestProfile = localStorage.getItem('sf_guest_profile');
    const hasAlreadyMigrated = localStorage.getItem('sf_migrated_guest_data');

    if (!hasAlreadyMigrated && (guestTimetables || guestProfile) && guestTimetables !== '[]') {
      setShowMigrationPrompt(true);
    }
  }, [user]);

  const migrateGuestData = async () => {
    // Keep placeholder migration logic
    console.log('Migrating guest data...');
    localStorage.setItem('sf_migrated_guest_data', 'true');
    setShowMigrationPrompt(false);
  };

  const skipMigration = () => {
    localStorage.setItem('sf_migrated_guest_data', 'true');
    setShowMigrationPrompt(false);
  };

  if (!showMigrationPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] w-full max-w-md text-center animate-[forge-scale-in_0.25s_ease-out_forwards]">

        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-bold text-[#F0F0F0] tracking-tight mb-2">
          Import your guest data?
        </h3>
        <p className="text-sm text-[#A0A0A0] leading-relaxed mb-6">
          We found tasks and a timetable saved from your guest session.
          Would you like to import them into your new account?
        </p>
        <div className="flex gap-3">
          <button
            onClick={migrateGuestData}
            className="flex-1 h-10 rounded-xl bg-[#10B981] text-[#0A0A0A] text-sm font-bold hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
            Import Data
          </button>
          <button
            onClick={skipMigration}
            className="flex-1 h-10 rounded-xl border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] transition-all duration-150-all duration-150 active:scale-[0.97]">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
