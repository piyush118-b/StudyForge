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

    // 1. Date range
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = new Date(today);
    if (range === '30d')      startDate.setDate(today.getDate() - 29);
    else if (range === 'all') startDate.setFullYear(today.getFullYear() - 1);
    else                      startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const startStr = startDate.toLocaleDateString('en-CA');
    const endStr   = today.toLocaleDateString('en-CA');
    const todayStr = endStr;

    // 2. Pull ALL block_logs for the range — bypass daily_summaries entirely.
    //    daily_summaries was populated before the formula fixes and contains stale
    //    partial_hours = 0 rows. Computing from raw block_logs guarantees accuracy.
    const { data: rawLogs } = await supabase
      .from('block_logs')
      .select('block_id, subject, scheduled_date, scheduled_start, scheduled_hours, actual_hours, partial_percentage, status')
      .eq('user_id', user.id)
      .gte('scheduled_date', startStr)
      .lte('scheduled_date', endStr)
      .order('marked_at', { ascending: false }) as any;

    // 3. Deduplicate: keep only the MOST RECENT log per (block_id x date)
    const seenKeys = new Set<string>();
    const logs: any[] = [];
    for (const l of (rawLogs || [])) {
      const key = `${l.block_id || `${l.subject}__${l.scheduled_start}`}__${l.scheduled_date}`;
      if (!seenKeys.has(key)) { seenKeys.add(key); logs.push(l); }
    }

    // 4. Aggregate into a per-date map using the canonical formula:
    //    completed -> scheduled_hours (100%)
    //    partial   -> actual_hours if > 0, else (pct/100) * scheduled_hours
    //    skipped / pending -> 0h
    const dateMap: Record<string, { completedHrs: number; scheduledHrs: number; blocksCompleted: number; blocksTotal: number }> = {};

    for (const log of logs) {
      const d = log.scheduled_date as string;
      if (!dateMap[d]) dateMap[d] = { completedHrs: 0, scheduledHrs: 0, blocksCompleted: 0, blocksTotal: 0 };
      const entry = dateMap[d];
      const sched = Number(log.scheduled_hours || 0);
      entry.scheduledHrs += sched;
      entry.blocksTotal  += 1;

      if (log.status === 'completed') {
        entry.completedHrs    += sched;
        entry.blocksCompleted += 1;
      } else if (log.status === 'partial') {
        const actual    = Number(log.actual_hours || 0);
        const pct       = Number(log.partial_percentage || 0);
        const effective = actual > 0 ? actual : (pct / 100) * sched;
        entry.completedHrs    += Number(effective.toFixed(2));
        entry.blocksCompleted += 0.5;
      }
    }

    // 5. Fill every date in range (0-pad missing days for the chart)
    const filledData: any[] = [];
    let current = new Date(startDate);
    while (current <= today) {
      const dStr = current.toLocaleDateString('en-CA');
      const agg  = dateMap[dStr];
      filledData.push({
        date:           dStr,
        day:            new Date(dStr + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
        completedHrs:   agg ? Number(agg.completedHrs.toFixed(2))  : 0,
        scheduledHrs:   agg ? Number(agg.scheduledHrs.toFixed(2))  : 0,
        completionRate: agg && agg.blocksTotal > 0 ? Number(((agg.blocksCompleted / agg.blocksTotal) * 100).toFixed(1)) : 0,
        blocksCompleted: agg?.blocksCompleted ?? 0,
        blocksTotal:     agg?.blocksTotal     ?? 0,
      });
      current.setDate(current.getDate() + 1);
    }

    // 6. Override TODAY with live grid_data for scheduled hours + reconcile missing logs
    const todayEntry = filledData.find(d => d.date === todayStr);
    if (todayEntry) {
      const { data: activeTT } = await supabase
        .from('timetables')
        .select('grid_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle() as any;

      if (activeTT?.grid_data) {
        const dayName      = new Date(todayStr + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long' });
        const dayNameLower = dayName.toLowerCase();
        const colId        = `col_${dayNameLower}`;

        const todayGridBlocks = (Object.values(activeTT.grid_data as Record<string, any>) as any[])
          .filter(b => {
            const _id  = (b.dayId || '').toLowerCase();
            const _day = (b.day   || '').toLowerCase();
            return _id === colId || _id === dayNameLower || _day === dayNameLower || _day === colId;
          });

        // Use grid_data for scheduled hours — includes ALL planned blocks, not just logged ones
        let liveScheduledHrs = 0;
        for (const b of todayGridBlocks) {
          if (b.startTime && b.endTime) {
            const [sh, sm] = (b.startTime as string).split(':').map(Number);
            const [eh, em] = (b.endTime   as string).split(':').map(Number);
            let diffMin = (eh * 60 + em) - (sh * 60 + sm);
            if (diffMin < 0) diffMin += 24 * 60;
            liveScheduledHrs += diffMin / 60;
          }
        }
        todayEntry.scheduledHrs = Number(liveScheduledHrs.toFixed(2));
        todayEntry.blocksTotal  = todayGridBlocks.length;

        // For any today grid block that has a status set but no valid block_log (or actual_hours=0),
        // synthesize completed hours from grid_data.completionPercentage.
        // This exactly mirrors the Subject Distribution reconciliation logic.
        const todayLogs = logs.filter((l: any) => l.scheduled_date === todayStr);
        const goodBlockIds = new Set<string>(todayLogs.map(l => l.block_id).filter(Boolean));
        
        // Track logged hours per block_id (from logs)
        const loggedBlockHours: Record<string, number> = {};
        for (const log of todayLogs) {
          if (log.block_id) {
             const hrs = (log.status === 'completed') 
                ? Number(log.scheduled_hours || 0) 
                : Number(log.actual_hours || 0);
             loggedBlockHours[log.block_id] = (loggedBlockHours[log.block_id] || 0) + hrs;
          }
        }

        let syntheticCompletedHrs = 0;

        for (const b of todayGridBlocks) {
          if (!b.id || !b.status || b.status === 'pending') continue;

          // Compute max possible hours for this block
          let blockHrs = 0;
          if (b.startTime && b.endTime) {
            const [sh, sm] = b.startTime.split(':').map(Number);
            const [eh, em] = b.endTime.split(':').map(Number);
            let diffMin = (eh * 60 + em) - (sh * 60 + sm);
            if (diffMin < 0) diffMin += 24 * 60;
            blockHrs = diffMin / 60;
          }

          const hasGoodLog = goodBlockIds.has(b.id);
          const loggedHrs = loggedBlockHours[b.id] || 0;

          // If there's no log at all OR the logged actual hours are 0, use grid_data as source of truth
          if (!hasGoodLog || loggedHrs === 0) {
            const pct = typeof b.completionPercentage === 'number'
              ? b.completionPercentage
              : (b.status === 'completed' ? 100 : 0);
            
            syntheticCompletedHrs += (pct / 100) * blockHrs;
          }
        }

        // Add the synthetic hours (for blocks missing raw logs) to the baseline completedHrs (from valid raw logs)
        todayEntry.completedHrs = Number((todayEntry.completedHrs + syntheticCompletedHrs).toFixed(2));
      }
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


