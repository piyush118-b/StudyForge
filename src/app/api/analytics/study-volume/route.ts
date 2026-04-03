import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // 1. Calculate Date Range
    const today = new Date();
    // Use local end of day
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date(today);
    if (range === '30d') {
      startDate.setDate(today.getDate() - 29);
    } else if (range === 'all') {
      startDate.setFullYear(today.getFullYear() - 1); // Max 1 year for performance
    } else {
      // Default 7 days including today
      startDate.setDate(today.getDate() - 6);
    }
    startDate.setHours(0, 0, 0, 0);

    const startStr = startDate.toLocaleDateString('en-CA');
    const endStr = today.toLocaleDateString('en-CA');

    // 2. Query daily_summaries (Primary Source)
    const { data: summaries, error: summaryError } = await supabase
      .from('daily_summaries')
      .select('date, scheduled_hours, completed_hours, partial_hours, completion_rate, total_blocks, completed_blocks')
      .eq('user_id', user.id)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date', { ascending: true }) as any;

    // 3. Fallback to block_logs if no summaries found or error
    let chartData: any[] = [];
    
    if (!summaryError && summaries && summaries.length > 0) {
      chartData = summaries.map((s: any) => ({
        date: s.date,
        day: new Date(s.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
        completedHrs: Number(s.completed_hours || 0) + Number(s.partial_hours || 0),
        scheduledHrs: Number(s.scheduled_hours || 0),
        completionRate: Number(s.completion_rate || 0),
        blocksCompleted: s.completed_blocks || 0,
        blocksTotal: s.total_blocks || 0
      }));
    } else {
      // Direct aggregation from raw logs
      const { data: logs } = await supabase
        .from('block_logs')
        .select('scheduled_date, scheduled_hours, actual_hours, status')
        .eq('user_id', user.id)
        .gte('scheduled_date', startStr)
        .lte('scheduled_date', endStr) as any;

      const grouped = (logs || []).reduce((acc: any, log: any) => {
        const d = log.scheduled_date;
        if (!acc[d]) acc[d] = { completed: 0, scheduled: 0, blocks: 0, compBlocks: 0 };
        
        acc[d].scheduled += Number(log.scheduled_hours) || 0;
        acc[d].blocks += 1;
        
        if (log.status === 'completed') {
          acc[d].completed += Number(log.scheduled_hours) || 0;
          acc[d].compBlocks += 1;
        } else if (log.status === 'partial') {
          acc[d].completed += Number(log.actual_hours) || 0;
          acc[d].compBlocks += 0.5;
        }
        return acc;
      }, {});

      chartData = Object.entries(grouped).map(([date, val]: [string, any]) => ({
        date,
        day: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
        completedHrs: Number(val.completed.toFixed(2)),
        scheduledHrs: Number(val.scheduled.toFixed(2)),
        completionRate: val.blocks > 0 ? (val.compBlocks / val.blocks) * 100 : 0,
        blocksCompleted: val.compBlocks,
        blocksTotal: val.blocks
      }));
    }

    // 4. Fill in missing gaps (ensure every date has a record for the chart)
    const filledData = [];
    let current = new Date(startDate);
    const endDate = new Date(today);

    while (current <= endDate) {
      const dStr = current.toLocaleDateString('en-CA');
      const existing = chartData.find(d => d.date === dStr);
      
      if (existing) {
        filledData.push(existing);
      } else {
        filledData.push({
          date: dStr,
          day: new Date(dStr + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
          completedHrs: 0,
          scheduledHrs: 0,
          completionRate: 0,
          blocksCompleted: 0,
          blocksTotal: 0
        });
      }
      current.setDate(current.getDate() + 1);
    }

    // ── 5. Override today's bars with live data ────────────────────────────────
    //
    // daily_summaries is only written when a block is *marked* — so it can be
    // stale if the user just marked a block and the recalculation hasn't run yet,
    // or if there are timetable_id mismatches (partial/skip logs inserted with null).
    //
    // Fix: for TODAY only, read both grid_data (scheduled) and block_logs (actual)
    // directly — bypassing daily_summaries entirely.
    //
    const todayStr = today.toLocaleDateString('en-CA');
    try {
      // ── 5a. Scheduled hours from live grid_data ───────────────────────────
      const { data: activeTT } = await supabase
        .from('timetables')
        .select('grid_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle() as any;

      const todayEntry = filledData.find(d => d.date === todayStr);

      if (activeTT?.grid_data && todayEntry) {
        const dayName = new Date(todayStr + 'T12:00:00Z')
          .toLocaleDateString('en-US', { weekday: 'long' });
        const colId = `col_${dayName.toLowerCase()}`;

        const todayGridBlocks = Object.values(activeTT.grid_data as Record<string, any>)
          .filter((b: any) => b.dayId === colId || b.day === dayName);

        let liveScheduledHrs = 0;
        for (const b of todayGridBlocks) {
          if (b.startTime && b.endTime) {
            const [sh, sm] = (b.startTime as string).split(':').map(Number);
            const [eh, em] = (b.endTime as string).split(':').map(Number);
            liveScheduledHrs += Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
          }
        }
        todayEntry.scheduledHrs = Number(liveScheduledHrs.toFixed(2));
        todayEntry.blocksTotal = Math.max(todayEntry.blocksTotal, todayGridBlocks.length);
      }

      // ── 5b. Completed + partial hours from live block_logs ────────────────
      // Query ALL logs for the user today (no timetable_id filter — same as
      // the fixed recalculateDailySummary so partial logs with null timetable_id
      // are always included).
      const { data: todayLogs } = await supabase
        .from('block_logs')
        .select('status, scheduled_hours, actual_hours')
        .eq('user_id', user.id)
        .eq('scheduled_date', todayStr) as any;

      if (todayLogs && todayLogs.length > 0 && todayEntry) {
        let liveCompletedHrs = 0;
        let liveCompletedBlocks = 0;
        let liveDoneBlocks = 0;      // full completions (integer)
        let livePartialBlocks = 0;  // partial completions (integer)

        for (const log of todayLogs) {
          if (log.status === 'completed') {
            liveCompletedHrs += Number(log.scheduled_hours) || 0;
            liveCompletedBlocks += 1;
            liveDoneBlocks += 1;
          } else if (log.status === 'partial') {
            liveCompletedHrs += Number(log.actual_hours) || 0;
            liveCompletedBlocks += 0.5;
            livePartialBlocks += 1;
          }
        }

        todayEntry.completedHrs = Number(liveCompletedHrs.toFixed(2));
        todayEntry.blocksCompleted = liveCompletedBlocks;  // float, used for rate
        todayEntry.doneBlocks = liveDoneBlocks;            // integer, for tooltip
        todayEntry.partialBlocks = livePartialBlocks;      // integer, for tooltip
        todayEntry.completionRate = todayEntry.blocksTotal > 0
          ? Number(((liveCompletedBlocks / todayEntry.blocksTotal) * 100).toFixed(1))
          : 0;
        // blocksTotal: use max of grid blocks and logged blocks
        todayEntry.blocksTotal = Math.max(todayEntry.blocksTotal, todayLogs.length);
      }
    } catch {
      // Non-critical — keep values from daily_summaries on error
    }


    return NextResponse.json({ 
      data: filledData,
      dateRange: { start: startStr, end: endStr } 
    });

  } catch (err: any) {
    console.error('Analytics API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
