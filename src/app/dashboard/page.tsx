"use client";

import { useGridStore } from "@/store/grid-store";
import { useAnalyticsStore } from "@/store/analytics-store";
import { useEffect, useState } from "react";
import { calculateDailyStats, calculateWeeklyStats, WeeklyStats } from "@/lib/analytics-engine";

export default function DashboardPage() {
  const { blocks } = useGridStore();
  const { eventQueue } = useAnalyticsStore();
  
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  
  useEffect(() => {
    // This aggregates locally buffered metrics for the demo. In production, this pulls exactly from Supabase /api endpoints.
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 3); // Start 3 days ago for demo variance
    
    // Fallback: evaluate the current timetable payload as today's 'completed' event stream just to render graphs.
    // In actual use, eventQueue streams the offline completed history across days.
    const stubEvents = [
      ...eventQueue,
      {
         blockId: 'demo-b1',
         timetableId: 'draft',
         userId: 'mock',
         date: new Date().toISOString().split('T')[0],
         dayOfWeek: 'Monday',
         subject: 'Data Structures',
         subjectType: 'Lecture',
         scheduledStart: 'slot_0830',
         scheduledEnd: 'slot_0930',
         scheduledHours: 1.5,
         status: 'completed' as const,
         actualHours: 1.5,
         createdAt: new Date().toISOString(),
      }
    ];

    setWeeklyStats(calculateWeeklyStats(stubEvents, weekStart.toISOString().split('T')[0]));
  }, [eventQueue, blocks]);

  if (!weeklyStats) return <div className="p-8 text-white">Loading insights...</div>;

  return (
    <div className="w-full min-h-screen bg-slate-950 p-8 font-sans overflow-auto text-slate-100">
       <div className="max-w-5xl mx-auto space-y-8">
         <h1 className="text-3xl font-bold">📊 My Progress</h1>

         {/* Weekly Overview */}
         <section className="space-y-4">
           <h2 className="text-xl font-semibold opacity-90">Weekly Overview</h2>
           <div className="grid grid-cols-7 gap-3">
             {weeklyStats.dailyStats.map(day => (
               <div key={day.date} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-2">
                 <div className="text-sm font-medium text-slate-400">
                   {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                 </div>
                 {/* CSS Arc Visualization representation */}
                 <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm relative" style={{
                   background: `conic-gradient(${day.completionRate > 70 ? '#22c55e' : day.completionRate > 40 ? '#eab308' : '#ef4444'} ${day.completionRate}%, rgba(255,255,255,0.1) 0)`
                 }}>
                    <span className="z-10 bg-slate-900 rounded-full w-10 h-10 flex items-center justify-center pt-0.5">
                      {Math.round(day.completionRate)}%
                    </span>
                 </div>
               </div>
             ))}
           </div>
         </section>

         {/* Subject Performance CSS Bars */}
         <section className="space-y-4">
           <h2 className="text-xl font-semibold opacity-90">Subject Performance</h2>
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 overflow-hidden">
             
             {weeklyStats.subjectBreakdown.map(subj => {
                const perc = Math.min(100, Math.round((subj.completedHours / subj.scheduledHours) * 100)) || 0;
                
                return (
                 <div key={subj.subject} className="flex flex-col gap-1 text-sm font-mono">
                   <div className="flex justify-between items-end">
                     <span className="font-bold text-slate-300">{subj.subject}</span>
                     <span className="text-slate-500 font-sans">{subj.completedHours} / {subj.scheduledHours} hrs {perc === 100 && '✅'}</span>
                   </div>
                   <div className="flex h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${perc}%` }} />
                   </div>
                 </div>
               );
             })}

             {weeklyStats.subjectBreakdown.length === 0 && (
               <div className="text-slate-500 text-sm py-4">No completed tasks this week! Use the Timetable editor blocks to start.</div>
             )}
             
           </div>
         </section>

         {/* AI Insight Overlay */}
         <section className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-6 space-y-3">
           <h3 className="font-bold text-indigo-300 flex items-center gap-2">
             ✨ Coach Insights
           </h3>
           <p className="text-indigo-100/80 leading-relaxed text-sm">
             {weeklyStats.overallCompletionRate > 0 
               ? `📊 This week you completed ${Math.round(weeklyStats.overallCompletionRate)}% of your plan. Your strongest day was ${weeklyStats.bestDay}! You're on a ${weeklyStats.streakDays}-day streak — keep it up! 🔥`
               : `You're all setup! Complete timeline blocks in your calendar directly to prompt dynamic AI tracking.`
             }
           </p>
         </section>

       </div>
    </div>
  );
}
