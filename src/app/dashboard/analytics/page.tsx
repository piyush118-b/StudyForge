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
import { Skeleton, SkeletonCard } from '@/components/ui/forge-skeleton';
import { EmptyState } from '@/components/ui/forge-empty';

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

  if (!stats || subscriptionLoading) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto mt-6">

        {/* Heatmap skeleton */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <Skeleton className="h-4 w-32 mb-6" />
          <div className="flex gap-1">
            {Array.from({ length: 12 }).map((_, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => (
                  <Skeleton key={di} className="w-3 h-3 rounded-[2px]" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Charts skeleton */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <Skeleton className="h-4 w-40 mb-6" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <Skeleton className="h-4 w-40 mb-6" />
            <Skeleton className="h-48 w-full rounded-full mx-auto max-w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (historicalEvents.length === 0) {
    return (
      <EmptyState
        emoji="📊"
        title="No study data yet"
        description="Start tracking your study blocks on the dashboard. Your analytics will appear here after your first session."
        action={{ label: 'Go to Dashboard', href: '/dashboard' }}
      />
    );
  }



  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F0F0] flex items-center gap-2">
            Analytics <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">Visualize your study patterns and efficiency.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="bg-[#1A1A1A] border-[#2A2A2A] text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222] gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </Button>

          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs rounded-md ${timeRange === '7d' ? 'bg-[#222222] text-[#F0F0F0]' : 'text-[#606060] hover:text-[#A0A0A0]'}`}
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            
            <ProGate feature="advanced_analytics" fallback={
              <Button variant="ghost" size="sm" className="text-xs text-[#3A3A3A] opacity-50 cursor-not-allowed">
                <Lock className="w-3 h-3 mr-1 inline" /> 30 Days
              </Button>
            }>
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-xs rounded-md ${timeRange === '30d' ? 'bg-[#222222] text-[#F0F0F0]' : 'text-[#606060] hover:text-[#A0A0A0]'}`}
                  onClick={() => setTimeRange('30d')}
               >
                  30 Days
               </Button>
            </ProGate>

            <ProGate feature="advanced_analytics" fallback={
               <Button variant="ghost" size="sm" className="text-xs text-[#3A3A3A] opacity-50 cursor-not-allowed">
                 <Lock className="w-3 h-3 mr-1 inline" /> All Time
               </Button>
            }>
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-xs rounded-md ${timeRange === 'all' ? 'bg-[#222222] text-[#F0F0F0]' : 'text-[#606060] hover:text-[#A0A0A0]'}`}
                  onClick={() => setTimeRange('all')}
               >
                  All Time
               </Button>
            </ProGate>
          </div>
        </div>
      </div>

      {!isPro && timeRange === '7d' && (
        <div className="bg-[#1A1A1A] border border-[#10B981]/30 rounded-xl p-4 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.1)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F0F0F0] mb-0.5">
                Unlock Multi-Month Trends
              </h4>
              <p className="text-xs text-[#A0A0A0]">
                Free users can view 7-day stats. Upgrade to Pro for 30-day and all-time.
              </p>
            </div>
          </div>
          <a href="/pricing"
             className="h-8 px-4 rounded-lg bg-[#10B981] text-[#0A0A0A] text-xs font-bold hover:bg-[#34D399] transition-all duration-150-colors shrink-0 flex items-center mt-2 sm:mt-0">
            Upgrade Now
          </a>
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
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[#F0F0F0]" />
              </div>
              <h3 className="text-sm font-semibold text-[#F0F0F0]">AI Study Insight</h3>
              <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[#10B981]/20 uppercase tracking-wider">Gemini</span>
            </div>
          </div>
          <div className="relative p-5">
            {/* Blur Overlay - Locks out the AI Insights */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1A1A1A]/40 backdrop-blur-[4px] rounded-b-xl border-t border-[#2A2A2A]/50">
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                <Lock className="w-4 h-4 text-[#A0A0A0]" />
              </div>
              <p className="text-[#F0F0F0] font-bold text-sm tracking-wide">AI Insights Locked</p>
              <p className="text-[#808080] text-xs mt-1">Upgrade your plan to see this analytics</p>
            </div>

            <div className="space-y-3 opacity-40 pointer-events-none select-none filter blur-[2px]">
              {stats ? (
                <>
                  {/* Primary insight */}
                  <div className="bg-[rgba(16,185,129,0.05)] border border-[#10B981]/15 rounded-lg p-3">
                    <p className="text-sm text-[#A0A0A0] leading-relaxed">
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
                        <span className="w-4 h-4 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[#10B981] text-[9px]">✓</span>
                        </span>
                        <span className="text-[#606060]">
                          <span className="text-[#10B981] font-semibold">{stats.mostCompletedSubject}</span> is your strongest subject this week.
                        </span>
                      </div>
                    )}
                    {stats.mostSkippedSubject !== 'None' && (
                      <div className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-[rgba(239,68,68,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[#EF4444] text-[9px]">!</span>
                        </span>
                        <span className="text-[#606060]">
                          <span className="text-[#EF4444] font-semibold">{stats.mostSkippedSubject}</span> has the most skips — try splitting it into shorter 30-min sessions.
                        </span>
                      </div>
                    )}
                    {stats.bestDay && stats.bestDay !== 'None' && (
                      <div className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-[rgba(59,130,246,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[#3B82F6] text-[9px]">★</span>
                        </span>
                        <span className="text-[#606060]">
                          Your best study day was <span className="text-[#3B82F6] font-semibold">{new Date(stats.bestDay + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long' })}</span>. Try to replicate that schedule.
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[140px] gap-2 text-center border border-dashed border-[#2A2A2A] rounded-lg">
                  <Sparkles className="w-6 h-6 text-[#404040]" />
                  <p className="text-[#606060] text-xs">Waiting for block data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
