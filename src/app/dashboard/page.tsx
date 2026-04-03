"use client";

import { useGridStore } from "@/store/grid-store";
import { useAnalyticsStore } from "@/store/analytics-store";
import { useTrackingStore } from "@/store/tracking-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { calculateWeeklyStats, WeeklyStats } from "@/lib/analytics-engine";
import Link from "next/link";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, CalendarHeart, MoreHorizontal, CheckCircle2, Circle, AlertCircle, TrendingUp, Sparkles, AlertTriangle, Download, Edit3, LayoutGrid, Share2, Trash2, Loader2, FilePlus, Plus } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { WeeklyAIInsights } from '@/components/dashboard/WeeklyAIInsights';
import { TimetableCard } from "@/components/timetable/TimetableCard";

// Local Type Binding
type TimetableRow = Database['public']['Tables']['timetables']['Row'];

export default function DashboardPage() {
  const { blocks } = useGridStore();
  const { eventQueue } = useAnalyticsStore();
  const { user } = useAuth();
  const router = useRouter();
  
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [timetables, setTimetables] = useState<TimetableRow[]>([]);
  const [loadingTimetables, setLoadingTimetables] = useState(true);
  
  const { todayBlocks, loadTodayBlocks, loadingToday, markBlockDone, markBlockPartial, markBlockSkipped, undoBlockMark } = useTrackingStore();
  
  useEffect(() => {
    // Analytics calculation mock block (from Phase 1 / early logic)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 3); 
    
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

  // Fetch actual timetables for Auth'd user
  useEffect(() => {
    async function loadTimetables() {
      if (!user) {
        setLoadingTimetables(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('timetables')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        setTimetables(data || []);
        
        const active = (data as any[])?.find(t => t.is_active);
        if (active) {
           const todayStr = new Date().toISOString().split('T')[0];
           // DEBUG: log grid_data to diagnose tracking issues
           const gridData = active.grid_data;
           const blockCount = gridData && typeof gridData === 'object' ? Object.keys(gridData).length : 0;
           console.log('[Dashboard] Active timetable grid_data:', { blockCount, gridData: blockCount > 0 ? 'has blocks' : 'EMPTY - no blocks saved!' });
           if (blockCount === 0) {
             console.warn('[Dashboard] grid_data is empty. Open the editor and make a change to trigger auto-save.');
           }
           loadTodayBlocks(active.id, gridData, todayStr);
        }
      } catch (err) {
        console.error("Failed to load timetables:", err);
        toast.error("Could not load your timetables.");
      } finally {
        setLoadingTimetables(false);
      }
    }
    
    loadTimetables();
  }, [user]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    const toastId = toast.loading("Deleting timetable...");
    try {
      const { error } = await supabase.from('timetables').delete().eq('id', id);
      if (error) throw error;
      
      setTimetables(prev => prev.filter(t => t.id !== id));
      toast.success("Timetable deleted successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  if (!weeklyStats) return (
    <div className="flex h-full items-center justify-center p-8 bg-slate-950 text-white min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="w-full min-h-full font-sans text-slate-100 p-8 space-y-12 pb-24 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-5%] right-[-5%] w-[800px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-[100%] pointer-events-none" />

      {/* HEADER */}
      <div className="flex justify-between items-end z-10 relative">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || "Student"}! 👋</h1>
          <p className="text-slate-400">Here is your weekly progress and active timetables.</p>
        </div>
      </div>

      {/* REMOVED CREATE CARDS FROM HERE - MOVED TO SELECTION PAGE */}

      {/* TOP STATS BAR (3 Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Card 1: This Week */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-wide text-slate-400 flex items-center justify-between">
              This Week
              <Clock className="w-4 h-4 text-indigo-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {Math.round((weeklyStats as any).totalCompletedHours || (weeklyStats as any).totalCompleted || 0)} <span className="text-lg text-slate-500 font-normal">/ {Math.round((weeklyStats as any).totalScheduledHours || (weeklyStats as any).totalScheduled || 0)} hrs</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Progress</span>
                <span>{Math.round(weeklyStats.overallCompletionRate)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${weeklyStats.overallCompletionRate > 70 ? 'bg-emerald-500' : weeklyStats.overallCompletionRate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(5, weeklyStats.overallCompletionRate))}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Study Streak */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl group hover:border-orange-500/30 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-wide text-slate-400 flex items-center justify-between">
              Study Streak
              <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-white">{weeklyStats.streakDays}</div>
              <div className="text-sm text-slate-400 font-medium">Days</div>
            </div>
            <div className="flex items-center gap-1 mt-4">
               {/* GitHub-style Heatmap Mini-blocks for last 7 days */}
               {weeklyStats.dailyStats.map((d, i) => (
                 <div 
                   key={i} 
                   className="w-full h-8 rounded-sm animate-pulse" 
                   style={{ 
                     backgroundColor: d.completionRate > 70 ? '#f97316' : d.completionRate > 0 ? '#fb923c' : '#1e293b',
                     opacity: d.completionRate > 0 ? 1 : 0.5,
                     animationDelay: `${i * 100}ms`,
                     animationIterationCount: 1
                   }}
                 />
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Balance Score */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl group hover:border-blue-500/30 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-wide text-slate-400 flex items-center justify-between">
              Balance Score
              <CalendarHeart className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-white">
                {Math.round(weeklyStats.overallCompletionRate * 0.8 + 20)}
              </div>
              <div className="text-sm text-slate-400 font-medium">/ 100</div>
            </div>
            <WeeklyAIInsights weeklyStats={weeklyStats} />
          </CardContent>
        </Card>
      </section>

      {/* TODAY'S SCHEDULE WIDGET */}
      <section className="space-y-4 relative z-10 pt-4 border-t border-slate-800/50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Today&apos;s Schedule</h2>
          <Button variant="link" onClick={() => router.push('/dashboard/today')} className="text-indigo-400">
            View all today&apos;s blocks →
          </Button>
        </div>
        
        {loadingToday ? (
           <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : todayBlocks.length === 0 ? (
           <div className="text-center p-8 border border-slate-800/80 rounded-xl bg-slate-900/30">
               <p className="text-slate-400 mb-2">🎉 No study blocks today! Rest up yaar.</p>
           </div>
        ) : (
           <div className="grid gap-3">
             {todayBlocks.slice(0, 3).map(block => (
                <div key={block.blockId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                   <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="w-16 text-sm font-mono text-slate-400">
                         {block.startTime}
                      </div>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: block.color }} />
                      <div>
                         <h4 className="font-semibold text-white">{block.subject}</h4>
                         <p className="text-xs text-slate-400">{block.blockType} • {block.scheduledHours} hrs</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      {block.status === 'completed' && <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">✅ Completed</Badge>}
                      {block.status === 'partial' && <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/20">⚡ Partial</Badge>}
                      {block.status === 'skipped' && <Badge className="bg-slate-700 text-slate-300 hover:bg-slate-700">⏭ Skipped</Badge>}
                      
                      {block.status === 'pending' && !block.isFixed && (
                         <>
                           <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                                   onClick={() => markBlockDone(block.blockId, new Date().toISOString().split('T')[0])}>
                              ✅ Done
                           </Button>
                           <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800"
                                   onClick={() => markBlockPartial(block.blockId, new Date().toISOString().split('T')[0], 50, block.scheduledHours * 0.5)}>
                              ⚡ Partial
                           </Button>
                           <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200"
                                   onClick={() => markBlockSkipped(block.blockId, new Date().toISOString().split('T')[0], 'other')}>
                              ⏭
                           </Button>
                         </>
                      )}
                      
                      {block.status !== 'pending' && (
                         <Button size="sm" variant="ghost" className="text-xs text-slate-500 h-6" onClick={() => undoBlockMark(block.blockId, new Date().toISOString().split('T')[0])}>Undo</Button>
                      )}
                   </div>
                </div>
             ))}
           </div>
        )}
      </section>

      {/* TIMETABLES SECTION */}
      <section className="space-y-6 relative z-10 pt-4 border-t border-slate-800/50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">My Timetables</h2>
          <Button onClick={() => router.push('/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>

        {loadingTimetables ? (
           <div className="w-full h-64 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
           </div>
        ) : timetables.length === 0 ? (
          // Empty State
          <div className="w-full lg:h-[350px] p-8 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
              <FilePlus className="w-10 h-10 text-indigo-400" />
            </div>
            
            <div className="space-y-2 max-w-sm relative z-10">
              <h3 className="text-xl font-bold text-white">No timetables yet</h3>
              <p className="text-slate-400">Let's build your first personalized college timetable powered by StudyForge AI.</p>
            </div>
            
            <Button size="lg" onClick={() => router.push('/create')} className="relative z-10 bg-indigo-600 hover:bg-indigo-700 font-semibold px-8 tracking-wide">
              Create My Timetable <span className="ml-2">→</span>
            </Button>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map((tt) => (
               <TimetableCard 
                 key={tt.id} 
                 timetable={tt} 
                 onSetActive={() => {}} 
                 onDelete={() => handleDelete(tt.id, tt.title)} 
               />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

// Minimal missing component stubs inside this file to avoid file clutter for the demo
function DropdownMenu({children}:any){return <div className="relative group/dd inline-block">{children}</div>}
function DropdownMenuTrigger({asChild, children}:any){return children}
function DropdownMenuContent({children, className}:any){return <div className={`absolute right-0 top-full mt-1 z-50 hidden group-hover/dd:flex flex-col rounded-md shadow-lg ${className}`}>{children}</div>}
function DropdownMenuItem({children, className, onClick}:any){return <button onClick={onClick} className={`flex items-center px-3 py-2 text-sm w-full text-left transition-colors ${className}`}>{children}</button>}
function DropdownMenuSeparator({className}:any){return <div className={`h-px w-full my-1 ${className}`}/>}
