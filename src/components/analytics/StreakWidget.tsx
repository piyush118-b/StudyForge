"use client";

import { StudyStreak } from '@/types/analytics.types';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

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

  const prevStreakRef = useRef(current);
  useEffect(() => {
    const milestones = [3, 7, 14, 21, 30, 50, 100];
    if (milestones.includes(current) && current > prevStreakRef.current) {
      toast.success(`🔥 ${current}-day streak!`, {
        description: `You're on fire! Keep going! 💪`,
        duration: 4000,
      });
    }
    prevStreakRef.current = current;
  }, [current]);

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden h-full">
      {/* Background glow if active */}
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      )}

      <div>
        <h3 className="text-lg font-bold text-[#F0F0F0] mb-6 flex items-center gap-2">
          <Flame className={`w-5 h-5 ${isActive ? 'text-orange-500 fill-orange-500/20' : 'text-slate-600'}`} />
          Study Streak
        </h3>
        
        <div className="flex items-end gap-3 mb-2">
          <span 
            key={current}
            className={`animate-[forge-scale-in_0.3s_ease-out_forwards] text-6xl font-black tabular-nums tracking-tighter leading-none ${isActive ? 'text-[#F0F0F0]' : 'text-[#606060]'}`}
          >
            {current}
          </span>
          <span className={`text-sm font-semibold uppercase tracking-wider mb-1.5 ${isActive ? 'text-orange-400' : 'text-slate-600'}`}>
            Days
          </span>
        </div>
        
        <p className="text-sm text-[#A0A0A0] mt-2">
          {isActive 
            ? current > 3 ? "You're on fire! Keep it up 🔥" : "Great start! Don't break the chain."
            : "No active streak. Start studying today!"}
        </p>
      </div>

      <div className="mt-8 space-y-3 border-t border-[#2A2A2A]/60 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-[#A0A0A0]"><Trophy className="w-4 h-4 text-amber-500" /> Longest Streak</span>
          <span className="font-semibold text-[#F0F0F0] tabular-nums">{streak.longestStreak} days</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-[#A0A0A0]"><Calendar className="w-4 h-4 text-[#10B981]" /> Last Study</span>
          <span className="font-medium text-slate-300">
            {streak.lastStudyDate ? format(new Date(streak.lastStudyDate), 'MMM d, yyyy') : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}
