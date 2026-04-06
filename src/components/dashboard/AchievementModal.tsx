"use client";

import { useEffect, useState } from "react";
import { useAchievementStore } from "@/store/achievement-store";
import confetti from "canvas-confetti";
import { Trophy, X } from "lucide-react";

export function AchievementModal() {
  const { recentAchievement, clearAchievement } = useAchievementStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (recentAchievement) {
      const frameId = requestAnimationFrame(() => setShow(true));
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // Auto clear after 5s
      const t = setTimeout(() => {
        setShow(false);
        setTimeout(clearAchievement, 300);
      }, 5000);

      return () => clearTimeout(t);
    }
  }, [recentAchievement, clearAchievement]);

  if (!recentAchievement) return null;

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] transition-all duration-150-all duration-500 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <div className="bg-[#111111] border border-[#10B981]/30 rounded-2xl p-4 shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center gap-4 min-w-[320px]">
        <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center shrink-0 border border-[#10B981]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#10B981]/10 animate-pulse" />
          <span className="text-2xl relative z-10">{recentAchievement.emoji}</span>
        </div>
        
        <div className="flex-1">
          <h4 className="text-xs font-bold text-[#10B981] uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Achievement Unlocked
          </h4>
          <h3 className="text-base font-bold text-[#F0F0F0] leading-tight mb-0.5">{recentAchievement.title}</h3>
          <p className="text-xs text-[#A0A0A0] leading-snug">{recentAchievement.description}</p>
        </div>

        <button 
          onClick={() => { setShow(false); setTimeout(clearAchievement, 300); }} 
          className="self-start p-1 text-[#606060] hover:text-[#F0F0F0] transition-all duration-150-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
