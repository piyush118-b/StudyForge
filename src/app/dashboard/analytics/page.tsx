"use client";

import { useEffect, useState, useRef } from "react";
import { useAnalyticsStore, type BlockEvent } from "@/store/analytics-store";
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionStore } from "@/store/subscription-store";
import { computeWeeklyStats, WeeklyStats } from "@/lib/analytics-engine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProGate } from "@/components/subscription/ProGate";
import { Lock, TrendingUp, Sparkles, RefreshCw, Flame, Target, Brain, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudyVolumeChart } from "@/components/analytics/StudyVolumeChart";
import { SubjectChart } from "@/components/analytics/SubjectChart";
import { toast } from "sonner";
import { recalculateDailySummary } from "@/lib/analytics-utils";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { historicalEvents, loadHistoricalEvents } = useAnalyticsStore();
  const { isPro, loading: subscriptionLoading, fetchSubscription } = useSubscriptionStore();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [isSyncing, setIsSyncing] = useState(false);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Realtime: refresh charts on any relevant DB change ─────────────
  //
  // Two sources need to trigger a chart refresh:
  //   1. daily_summaries  — when a block is marked done/partial/skipped
  //   2. timetables       — when a new block is added/removed from grid_data
  //
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`analytics-refresh-${user.id}`)
      // Trigger 1: a block was marked → daily_summaries updated
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_summaries',
          filter: `user_id=eq.${user.id}`,
        },
        () => setChartRefreshKey((k) => k + 1)
      )
      // Trigger 2: timetable grid_data changed (new block added/removed/edited)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'timetables',
          filter: `user_id=eq.${user.id}`,
        },
        () => setChartRefreshKey((k) => k + 1)
      )
      .subscribe();

    realtimeChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);


  useEffect(() => {
    if (!user) return;

    // Ensure subscription is loaded
    fetchSubscription(user.id);

    // Determine the range based on current local date (matching database DATE type)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 7);

    loadHistoricalEvents(
      user.id,
      fromDate.toLocaleDateString('en-CA'),
      toDate.toLocaleDateString('en-CA')
    );
  }, [user, fetchSubscription, loadHistoricalEvents]);

  const handleManualSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      // 1. Find all unique dates with block_logs for this user in the last 30 days
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceStr = since.toLocaleDateString('en-CA');

      const { data: recentLogs } = await supabase
        .from('block_logs')
        .select('scheduled_date, timetable_id')
        .eq('user_id', user.id)
        .gte('scheduled_date', sinceStr);

      if (!recentLogs || (recentLogs as any[]).length === 0) {
        toast.info('No study logs found to sync.');
        return;
      }

      // 2. Get unique date+timetableId combos
      const seen = new Set<string>();
      const pairs: { date: string; timetableId: string | null }[] = [];
      for (const log of (recentLogs as any[])) {
        const key = `${log.scheduled_date}__${log.timetable_id ?? 'null'}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push({ date: log.scheduled_date, timetableId: log.timetable_id });
        }
      }

      // 3. Recalculate each combo (timetableId may be null for orphaned logs)
      await Promise.all(
        pairs.map(({ date, timetableId }) =>
          recalculateDailySummary(user.id, timetableId, date)
        )
      );

      toast.success(`✅ Analytics synced! Rebuilt ${pairs.length} daily summaries.`);

      // 4. Refresh view
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 7);
      loadHistoricalEvents(
        user.id,
        fromDate.toLocaleDateString('en-CA'),
        toDate.toLocaleDateString('en-CA')
      );
      setTimeRange(prev => prev);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync analytics');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const startStr = weekStart.toLocaleDateString('en-CA');
    
    // Combine session events with stored database events
    const allEvents = [...historicalEvents];
    
    // Simple deduplication if same block/date exists in both
    const uniqueEvents = Array.from(new Map(allEvents.map(e => [`${e.blockId}-${e.date}`, e])).values());

    setStats(computeWeeklyStats(uniqueEvents as any[], startStr));
  }, [historicalEvents]);

  if (!stats || subscriptionLoading) return <div className="p-8 flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;



  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Deep Analytics <TrendingUp className="w-8 h-8 text-indigo-400" />
          </h1>
          <p className="text-slate-400 mt-1">Visualize your study patterns and efficiency.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </Button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs ${timeRange === '7d' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            
            <ProGate feature="advanced_analytics" fallback={
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 opacity-50 cursor-not-allowed">
                <Lock className="w-3 h-3 mr-1 inline" /> 30 Days
              </Button>
            }>
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-xs ${timeRange === '30d' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  onClick={() => setTimeRange('30d')}
               >
                  30 Days
               </Button>
            </ProGate>

            <ProGate feature="advanced_analytics" fallback={
               <Button variant="ghost" size="sm" className="text-xs text-slate-500 opacity-50 cursor-not-allowed">
                 <Lock className="w-3 h-3 mr-1 inline" /> All Time
               </Button>
            }>
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-xs ${timeRange === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  onClick={() => setTimeRange('all')}
               >
                  All Time
               </Button>
            </ProGate>
          </div>
        </div>
      </div>

      {!isPro && timeRange === '7d' && (
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-start sm:items-center gap-4">
           <div className="bg-indigo-500/20 p-2 rounded-lg"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
           <div className="flex-1">
             <h4 className="text-sm font-semibold text-indigo-200">Unlock Multi-Month Trends</h4>
             <p className="text-xs text-indigo-300/70 mt-1">Free users can view 7-day stats. Upgrade to Pro to track your consistency across your entire semester with 30-day and all-time analytics.</p>
           </div>
        </div>
      )}

      {/* ── Stats Strip ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Streak */}
          <div className="bg-[#0A0C14] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-orange-500/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Streak</p>
              <p className="text-xl font-black text-white leading-none mt-0.5">
                {stats.streakDays}<span className="text-[13px] text-slate-500 font-medium ml-0.5">days</span>
              </p>
            </div>
          </div>

          {/* Weekly Completion Rate */}
          <div className="bg-[#0A0C14] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-500/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">This Week</p>
              <p className="text-xl font-black text-white leading-none mt-0.5">
                {Math.round(stats.overallCompletionRate)}<span className="text-[13px] text-slate-500 font-medium ml-0.5">%</span>
              </p>
            </div>
          </div>

          {/* Hours Completed */}
          <div className="bg-[#0A0C14] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-emerald-500/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Hours Done</p>
              <p className="text-xl font-black text-white leading-none mt-0.5">
                {stats.totalCompleted.toFixed(1)}<span className="text-[13px] text-slate-500 font-medium ml-0.5">h</span>
              </p>
            </div>
          </div>

          {/* Most Skipped */}
          <div className="bg-[#0A0C14] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-rose-500/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Needs Focus</p>
              <p className="text-[15px] font-black text-white leading-none mt-0.5 truncate">
                {stats.mostSkippedSubject === 'None' ? '—' : stats.mostSkippedSubject}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
      {/* Study Volume Chart */}
      <div className="col-span-1 md:col-span-2">
        <StudyVolumeChart range={timeRange} key={timeRange} refreshKey={chartRefreshKey} />
      </div>

      {/* Subject Distribution Chart — today's subjects with planned vs actual */}
      <SubjectChart refreshKey={chartRefreshKey} />

        {/* AI Insight Card */}
        <Card className="bg-[#0A0C14] border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              AI Study Insight
              <span className="ml-auto text-[10px] font-normal text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">Live</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats ? (
              <>
                {/* Primary insight */}
                <div className="bg-violet-500/5 border border-violet-500/15 rounded-lg p-3">
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {stats.overallCompletionRate >= 80
                      ? `🔥 Outstanding week! You completed ${Math.round(stats.overallCompletionRate)}% of scheduled study. Keep this momentum going!`
                      : stats.overallCompletionRate >= 50
                      ? `📈 Solid progress at ${Math.round(stats.overallCompletionRate)}% completion. Focus on consistency to break the 80% mark.`
                      : stats.totalCompleted === 0
                      ? `🚀 Your analytics are ready. Start marking blocks complete in your timetable to see insights here!`
                      : `💡 At ${Math.round(stats.overallCompletionRate)}% this week — small wins add up. Try completing one extra block each day.`
                    }
                  </p>
                </div>

                {/* Secondary insights */}
                <div className="space-y-2">
                  {stats.mostCompletedSubject !== 'None' && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-emerald-400 text-[9px]">✓</span>
                      </span>
                      <span className="text-slate-400">
                        <span className="text-emerald-400 font-semibold">{stats.mostCompletedSubject}</span> is your strongest subject this week.
                      </span>
                    </div>
                  )}
                  {stats.mostSkippedSubject !== 'None' && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-rose-400 text-[9px]">!</span>
                      </span>
                      <span className="text-slate-400">
                        <span className="text-rose-400 font-semibold">{stats.mostSkippedSubject}</span> has the most skips — try splitting it into shorter 30-min sessions.
                      </span>
                    </div>
                  )}
                  {stats.bestDay && stats.bestDay !== 'None' && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-indigo-400 text-[9px]">★</span>
                      </span>
                      <span className="text-slate-400">
                        Your best study day was <span className="text-indigo-300 font-semibold">{new Date(stats.bestDay + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long' })}</span>. Try to replicate that schedule.
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[140px] gap-2 text-center">
                <Sparkles className="w-8 h-8 text-slate-600" />
                <p className="text-slate-500 text-sm">Start tracking blocks to unlock AI insights.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
