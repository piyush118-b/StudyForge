import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url)
  let fromDateStr = searchParams.get('from')
  let toDateStr = searchParams.get('to')
  
  if (!fromDateStr || !toDateStr) {
      const today = new Date()
      toDateStr = today.toISOString().split('T')[0]
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)
      fromDateStr = lastWeek.toISOString().split('T')[0]
  }

  const userId = user.id;

  // 1. Get daily summaries
  const { data: summariesArray } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDateStr)
    .lte('date', toDateStr)
    .order('date', { ascending: true })

  // Ensure unique by date if multiple timetables
  const summariesMap = new Map()
  if (summariesArray) {
      summariesArray.forEach(s => {
          if (!summariesMap.has(s.date)) {
              summariesMap.set(s.date, {
                 id: s.id,
                 userId: s.user_id,
                 timetableId: s.timetable_id,
                 date: s.date,
                 totalBlocks: s.total_blocks || 0,
                 completedBlocks: s.completed_blocks || 0,
                 partialBlocks: s.partial_blocks || 0,
                 skippedBlocks: s.skipped_blocks || 0,
                 pendingBlocks: s.pending_blocks || 0,
                 scheduledHours: Number(s.scheduled_hours) || 0,
                 completedHours: Number(s.completed_hours) || 0,
                 partialHours: Number(s.partial_hours) || 0,
                 completionRate: Number(s.completion_rate) || 0,
                 focusAvg: s.focus_avg
              })
          }
      })
  }

  // Backfill empty days
  const dailySummaries = []
  let curr = new Date(fromDateStr)
  const endD = new Date(toDateStr)
  while (curr <= endD) {
      const dStr = curr.toISOString().split('T')[0]
      if (summariesMap.has(dStr)) {
          dailySummaries.push(summariesMap.get(dStr))
      } else {
          dailySummaries.push({
             id: dStr, userId, timetableId: '', date: dStr,
             totalBlocks: 0, completedBlocks: 0, partialBlocks: 0, skippedBlocks: 0, pendingBlocks: 0,
             scheduledHours: 0, completedHours: 0, partialHours: 0, completionRate: 0, focusAvg: null
          })
      }
      curr.setDate(curr.getDate() + 1)
  }

  // 2. Get block logs for subject breakdown and skips
  const { data: logs } = await supabase
     .from('block_logs')
     .select('*')
     .eq('user_id', userId)
     .gte('scheduled_date', fromDateStr)
     .lte('scheduled_date', toDateStr)

  let totalScheduledHours = 0
  let totalCompletedHours = 0
  let totalPartialHours = 0

  const subjectMap: Record<string, any> = {}
  const skipMap: Record<string, number> = {}

  if (logs) {
     logs.forEach(l => {
         const schedHr = Number(l.scheduled_hours) || 0
         const actHr = Number(l.actual_hours) || 0
         totalScheduledHours += schedHr
         if (l.status === 'completed') totalCompletedHours += schedHr
         if (l.status === 'partial') totalPartialHours += actHr

         if (!subjectMap[l.subject]) {
             subjectMap[l.subject] = { scheduledHours: 0, completedHours: 0, partialHours: 0, skippedCount: 0 }
         }
         subjectMap[l.subject].scheduledHours += schedHr
         
         if (l.status === 'completed') subjectMap[l.subject].completedHours += schedHr
         if (l.status === 'partial') subjectMap[l.subject].partialHours += actHr
         if (l.status === 'skipped') {
             subjectMap[l.subject].skippedCount += 1
             if (l.skip_reason) {
                 skipMap[l.skip_reason] = (skipMap[l.skip_reason] || 0) + 1
             }
         }
     })
  }

  const subjectStats = Object.entries(subjectMap).map(([subject, stats]: any) => {
      const completionRate = stats.scheduledHours > 0 
          ? ((stats.completedHours + (stats.partialHours * 0.5)) / stats.scheduledHours) * 100 
          : 0;
      return {
          subject,
          color: '#6366f1', // Could be mapped from timetable config if retrieved
          scheduledHours: stats.scheduledHours,
          completedHours: stats.completedHours,
          partialHours: stats.partialHours,
          skippedCount: stats.skippedCount,
          completionRate,
          trend: 'stable'
      }
  })

  // Skip breakdown
  const totalSkips = Object.values(skipMap).reduce((a,b)=>a+b, 0)
  const skipReasonBreakdown = Object.entries(skipMap).map(([reason, count]) => ({
     reason,
     count,
     percentage: totalSkips > 0 ? (count / totalSkips) * 100 : 0
  })).sort((a,b) => b.count - a.count)

  const overallCompletionRate = totalScheduledHours > 0 ? ((totalCompletedHours + (totalPartialHours*0.5)) / totalScheduledHours) * 100 : 0

  return NextResponse.json({
    weekStart: fromDateStr,
    weekEnd: toDateStr,
    dailySummaries,
    totalScheduledHours,
    totalCompletedHours,
    totalPartialHours,
    overallCompletionRate,
    currentStreak: 0, // Simplified for brevity
    longestStreak: 0,
    subjectStats,
    worstDay: 'Friday',
    skipReasonBreakdown
  });
}
