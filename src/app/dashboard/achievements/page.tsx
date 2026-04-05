"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Trophy, Star, Target, Zap, Lock, ShieldCheck, Flame, Loader2 } from "lucide-react";

interface Achievement {
  id: string;
  achievement_key: string;
  achievement_name: string;
  achievement_description: string;
  badge_emoji: string;
  unlocked_at: string;
}

const ALL_ACHIEVEMENTS = [
  { key: 'engaged_user',    name: 'Getting Serious', description: 'Marked your first blocks or saved your timetable.',     icon: Star,        color: 'text-yellow-400',  bg: 'bg-yellow-400/20'  },
  { key: 'power_user',      name: 'Power User',      description: 'Using advanced productivity features.',                 icon: Zap,         color: 'text-indigo-400',  bg: 'bg-indigo-400/20'  },
  { key: 'pro_upgrade',     name: 'Pro Scholar',     description: 'Upgraded to the premium tier and unlocked full potential.', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
  { key: '7_day_streak',    name: '7-Day Streak',    description: 'Studied consistently for an entire week.',              icon: Flame,       color: 'text-orange-400',  bg: 'bg-orange-400/20'  },
  { key: 'first_timetable', name: 'Architect',       description: 'Created your very first timetable.',                   icon: Target,      color: 'text-blue-400',    bg: 'bg-blue-400/20'    },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAchievements = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);
      if (!error && data) setUnlocked(data);
      setLoading(false);
    };
    fetchAchievements();
  }, [user]);

  if (loading) return (
    <div className="p-8 flex justify-center bg-[#0A0A0A] min-h-full">
      <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
    </div>
  );

  const unlockedKeys = unlocked.map(a => a.achievement_key);

  return (
    <div className="flex flex-col gap-0 bg-[#0A0A0A] min-h-full">

      {/* Header */}
      <div className="px-6 py-5 border-b border-[#2A2A2A] flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center border border-[#10B981]/20">
          <Trophy className="w-7 h-7 text-[#10B981]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Your Achievements</h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">Unlock badges by reaching study milestones and discovering features.</p>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
        {ALL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedKeys.includes(ach.key);
          const dbData = unlocked.find(u => u.achievement_key === ach.key);
          const Icon = ach.icon;

          return (
            <div
              key={ach.key}
              className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 flex flex-col items-center text-center gap-3
                          transition-all duration-200
                          ${isUnlocked
                            ? 'hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                            : 'opacity-40 grayscale'}`}>

              {/* Badge icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                              ${isUnlocked
                                ? `${ach.bg} shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-white/5`
                                : 'bg-[#222222]'}`}>
                {isUnlocked ? <Icon className={`w-7 h-7 ${ach.color}`} /> : <Lock className="w-5 h-5 text-[#606060]" />}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#F0F0F0] mb-0.5">{ach.name}</h4>
                <p className="text-xs text-[#606060] leading-relaxed">{ach.description}</p>
              </div>

              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[#10B981]/25">
                  ✓ Earned
                </span>
              ) : dbData?.unlocked_at ? (
                <span className="text-[10px] font-mono text-[#606060] uppercase">
                  {new Date(dbData.unlocked_at).toLocaleDateString()}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
