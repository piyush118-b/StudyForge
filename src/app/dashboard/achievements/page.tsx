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
  { key: 'engaged_user', name: 'Getting Serious', description: 'Marked your first blocks or saved your timetable.', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  { key: 'power_user', name: 'Power User', description: 'Using advanced productivity features.', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/20' },
  { key: 'pro_upgrade', name: 'Pro Scholar', description: 'Upgraded to the premium tier and unlocked full potential.', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
  { key: '7_day_streak', name: '7-Day Streak', description: 'Studied consistently for an entire week.', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/20' },
  { key: 'first_timetable', name: 'Architect', description: 'Created your very first timetable.', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/20' },
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
        
      if (!error && data) {
        setUnlocked(data);
      }
      setLoading(false);
    };

    fetchAchievements();
  }, [user]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const unlockedKeys = unlocked.map(a => a.achievement_key);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Trophy className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Your Achievements</h1>
          <p className="text-slate-400 mt-1">Unlock badges by reaching study milestones and discovering features.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedKeys.includes(ach.key);
          const dbData = unlocked.find(u => u.achievement_key === ach.key);
          const Icon = ach.icon;

          return (
            <div 
              key={ach.key}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:shadow-xl hover:-translate-y-1' 
                  : 'bg-slate-900/30 border-slate-800/50 opacity-70 grayscale'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? ach.bg : 'bg-slate-800'}`}>
                  {isUnlocked ? <Icon className={`w-6 h-6 ${ach.color}`} /> : <Lock className="w-5 h-5 text-slate-500" />}
                </div>
                {isUnlocked && dbData?.unlocked_at && (
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {new Date(dbData.unlocked_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                {ach.name}
              </h3>
              <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                {ach.description}
              </p>

              {isUnlocked && (
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
