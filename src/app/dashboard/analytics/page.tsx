"use client";

import { useEffect, useState, useRef } from "react";
import { useAnalyticsStore } from "@/store/analytics-store";
import { useAuth } from "@/lib/auth-context";
import { useSubscriptionStore } from "@/store/subscription-store";
import { calculateWeeklyStats, WeeklyStats } from "@/lib/analytics-engine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProGate } from "@/components/subscription/ProGate";
import { Lock, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudyVolumeChart } from "@/components/analytics/StudyVolumeChart";
import { SubjectChart } from "@/components/analytics/SubjectChart";
import { toast } from "sonner";
import { recalculateDailySummary } from "@/lib/analytics-utils";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { historicalEvents, loadHistoricalEvents } = useAnalyticsStore();
  const { isPro, loading: subscriptionLoading, fetchSubscription } = useSubscriptionStore();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Incrementing this causes both charts to re-fetch fresh data
  const [chartRefreshKey, setChartRefreshKey] = useState(0);
  const realtimeChannelRef = useRef<any>(null);

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

      const { data: recentLogs } = await (supabase as any)
        .from('block_logs')
        .select('scheduled_date, timetable_id')
        .eq('user_id', user.id)
        .gte('scheduled_date', sinceStr);

      if (!recentLogs || recentLogs.length === 0) {
        toast.info('No study logs found to sync.');
        return;
      }

      // 2. Get unique date+timetableId combos
      const seen = new Set<string>();
      const pairs: { date: string; timetableId: string | null }[] = [];
      for (const log of recentLogs) {
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

    setStats(calculateWeeklyStats(uniqueEvents as any, startStr));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
      {/* Study Volume Chart */}
      <div className="col-span-1 md:col-span-2">
        <StudyVolumeChart range={timeRange} key={timeRange} refreshKey={chartRefreshKey} />
      </div>

      {/* Subject Distribution Chart — today's subjects with planned vs actual */}
      <SubjectChart refreshKey={chartRefreshKey} />

        {/* Efficiency Insights Gated View */}
        <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden group">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Peak Efficiency Hours</CardTitle>
            <CardDescription>When are you most likely to focus?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <ProGate feature="advanced_analytics" fallback={
               <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 transition-all">
                  <Lock className="w-8 h-8 text-slate-500 mb-3" />
                  <h3 className="text-slate-300 font-semibold mb-1">Deep Correlation Locked</h3>
                  <p className="text-xs text-slate-400 max-w-[80%]">Discover exactly which hours of the day yield your highest focus ratings.</p>
               </div>
             }>
               <div className="h-[200px] flex items-end justify-between px-2 pb-4 border-b border-slate-800">
                  {/* Mock visually complex Pro chart using standard divs since recharts pie/scatter is overkill here */}
                  {[6, 8, 10, 12, 14, 16, 18, 20].map((hour) => {
                     const heightPercentage = Math.random() * 80 + 20;
                     return (
                       <div key={hour} className="flex flex-col items-center gap-2 group/bar">
                         <div className="w-8 bg-blue-500/20 rounded-t-sm relative transition-all duration-500 hover:bg-blue-500/40" style={{ height: `${heightPercentage}%` }}>
                           <div className="absolute top-0 left-0 w-full bg-blue-500 rounded-t-sm transition-all" style={{ height: '4px' }} />
                         </div>
                         <span className="text-[10px] text-slate-500 group-hover/bar:text-slate-300">{hour}:00</span>
                       </div>
                     )
                  })}
               </div>
               <div className="pt-2 flex justify-between text-xs text-slate-400">
                 <span>Morning slump detected</span>
                 <span className="text-emerald-400">Peak: 14:00 - 18:00</span>
               </div>
             </ProGate>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
