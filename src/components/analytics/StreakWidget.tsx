"use client";

import { StudyStreak } from '@/types/analytics.types';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface StreakProps {
  streak: StudyStreak;
}

export function StreakWidget({ streak }: StreakProps) {
  // Check if current streak is still active (studied today or yesterday)
  // If not, it means the user lost the streak
  let current = streak.currentStreak;
  const today = new Date();
  
  if (streak.lastStudyDate) {
    const diff = differenceInDays(today, new Date(streak.lastStudyDate));
    if (diff > 1) {
      current = 0; // Streak broken
    }
  }

  const isActive = current > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden h-full">
      {/* Background glow if active */}
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      )}

      <div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Flame className={`w-5 h-5 ${isActive ? 'text-orange-500 fill-orange-500/20' : 'text-slate-600'}`} />
          Study Streak
        </h3>
        
        <div className="flex items-end gap-3 mb-2">
          <span className={`text-6xl font-black tabular-nums tracking-tighter leading-none ${isActive ? 'text-white' : 'text-slate-500'}`}>
            {current}
          </span>
          <span className={`text-sm font-semibold uppercase tracking-wider mb-1.5 ${isActive ? 'text-orange-400' : 'text-slate-600'}`}>
            Days
          </span>
        </div>
        
        <p className="text-sm text-slate-400 mt-2">
          {isActive 
            ? current > 3 ? "You're on fire! Keep it up 🔥" : "Great start! Don't break the chain."
            : "No active streak. Start studying today!"}
        </p>
      </div>

      <div className="mt-8 space-y-3 border-t border-slate-800/60 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-400"><Trophy className="w-4 h-4 text-amber-500" /> Longest Streak</span>
          <span className="font-semibold text-white tabular-nums">{streak.longestStreak} days</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-400"><Calendar className="w-4 h-4 text-indigo-400" /> Last Study</span>
          <span className="font-medium text-slate-300">
            {streak.lastStudyDate ? format(new Date(streak.lastStudyDate), 'MMM d, yyyy') : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}
