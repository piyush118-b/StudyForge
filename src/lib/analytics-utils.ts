import { supabase } from './supabase';
import { getLocalDateStr } from './time-utils';

/**
 * Calculates decimal hours between two HH:MM strings.
 */
export function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  
  const startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  
  // Handle cross-day (e.g. 11pm to 2am)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const diffMinutes = endMinutes - startMinutes;
  return Math.max(0, Math.round(diffMinutes / 60 * 100) / 100);
}

/**
 * Maps a day identifier like 'col_monday' or 'Monday' to the YYYY-MM-DD
 * of that day in the current week (Monday-Sunday).
 */
export function getDateForDayOfWeek(dayName: string, referenceDate: Date = new Date()): string {
  const days: Record<string, number> = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6,
    'col_sunday': 0, 'col_monday': 1, 'col_tuesday': 2, 'col_wednesday': 3,
    'col_thursday': 4, 'col_friday': 5, 'col_saturday': 6
  };
  
  if (!dayName) return getLocalDateStr(referenceDate);
  const targetDay = days[dayName.toLowerCase()];
  if (targetDay === undefined) return getLocalDateStr(referenceDate);
  
  const currentDay = referenceDate.getDay(); // 0=Sun, 1=Mon, etc.
  
  // Calculate start of current week (Monday)
  const monday = new Date(referenceDate);
  // In JS, Sun=0, Mon=1. To get distance from Monday:
  // if Sun(0) -> 6 days ago. if Mon(1) -> 0. if Tue(2) -> 1.
  const daysFromMonday = (currentDay + 6) % 7; 
  monday.setDate(referenceDate.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  
  // Add target day offset from Monday
  const targetDate = new Date(monday);
  const targetOffset = (targetDay + 6) % 7; // convert targetDay to Mon=0 scale
  targetDate.setDate(monday.getDate() + targetOffset);
  
  return targetDate.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local time
}

/**
 * Aggregates block_logs and timetable grid data to update daily_summaries.
 * timetableId is optional — if omitted, queries all logs for the user on that date
 * so analytics survive timetable deletion.
 */
export async function recalculateDailySummary(
  userId: string,
  timetableId: string | null | undefined,
  date: string,
  customSupabase?: any
) {
  // Use either the provided server-side client or the default browser-side client
  const supabaseClient = customSupabase || supabase;

  // 1. Get ALL block_logs for this user on this date.
  //    IMPORTANT: Do NOT filter by timetable_id here.
  //    Partial/skip actions from the Today page insert logs with null timetable_id
  //    (the tracking-store doesn't send timetableId for those calls). If we filter
  //    by timetable_id, those logs become invisible and partial_hours stays 0.
  const { data: rawLogs, error: logsError } = await supabaseClient
    .from('block_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('scheduled_date', date)
    .order('marked_at', { ascending: false }) as any; // newest first for dedup

  if (logsError) {
    console.error('Error fetching logs for summary:', logsError);
    return;
  }

  // Deduplicate: keep only the most recent log per block_id
  // (a block may have been marked partial then complete → two rows)
  const seenBlocks = new Set<string>();
  const safeLogs: any[] = [];
  for (const log of (rawLogs as any[]) || []) {
    const key = log.block_id || `${log.subject}__${log.scheduled_date}__${log.scheduled_start}`;
    if (!seenBlocks.has(key)) {
      seenBlocks.add(key);
      safeLogs.push(log);
    }
  }

  // 2. Cross-reference with timetable's grid_data (only if timetableId is available)
  let totalScheduledFromGrid = 0;
  let totalScheduledHours = 0;

  if (timetableId) {
    const { data: timetable, error: ttError } = await supabaseClient
      .from('timetables')
      .select('grid_data')
      .eq('id', timetableId)
      .single() as any;

    if (!ttError && timetable?.grid_data) {
      const dayName = new Date(date + 'T12:00:00Z')
        .toLocaleDateString('en-US', { weekday: 'long' });
      const colId = `col_${dayName.toLowerCase()}`;

      const blocks = Object.values(timetable.grid_data as any) as any[];
      const dayBlocks = blocks.filter(b => b.dayId === colId || b.day === dayName);
      totalScheduledFromGrid = dayBlocks.length;
      totalScheduledHours = dayBlocks.reduce((sum, b) => sum + calculateHours(b.startTime, b.endTime), 0);
    }
  }

  // 3. Calculate from logs
  const completedLogs = safeLogs.filter(l => l.status === 'completed');
  const partialLogs = safeLogs.filter(l => l.status === 'partial');
  const skippedLogs = safeLogs.filter(l => l.status === 'skipped');

  const completedHours = completedLogs.reduce((sum, l) => sum + (Number(l.scheduled_hours) || 0), 0);
  // For partial: use actual_hours if > 0, else compute from percentage (handles legacy rows)
  const partialHours = partialLogs.reduce((sum, l) => {
    const actualHrs = Number(l.actual_hours || 0);
    const pct = Number(l.partial_percentage || 0);
    const scheduled = Number(l.scheduled_hours || 0);
    const hrs = actualHrs > 0 ? actualHrs : (pct / 100) * scheduled;
    return sum + hrs;
  }, 0);

  const totalBlocks = Math.max(totalScheduledFromGrid, safeLogs.length);
  const scheduledHours = Math.max(
    totalScheduledHours,
    safeLogs.reduce((sum, l) => sum + (Number(l.scheduled_hours) || 0), 0)
  );

  const effectiveCompleted = completedLogs.length + partialLogs.length * 0.5;
  const completionRate = totalBlocks > 0 ? (effectiveCompleted / totalBlocks) * 100 : 0;

  const ratedLogs = safeLogs.filter(l => l.focus_rating !== null);
  const focusAvg =
    ratedLogs.length > 0
      ? ratedLogs.reduce((sum, l) => sum + (l.focus_rating || 0), 0) / ratedLogs.length
      : null;

  // Subject breakdown
  const subjects = Array.from(new Set(safeLogs.map(l => l.subject)));
  const subjectBreakdown = subjects.map(subject => {
    const subLogs = safeLogs.filter(l => l.subject === subject);
    const subjectCompletedHours = subLogs.reduce((s, l) => {
      if (l.status === 'completed') return s + (Number(l.scheduled_hours) || 0);
      if (l.status === 'partial') {
        const actualHrs = Number(l.actual_hours || 0);
        const pct = Number(l.partial_percentage || 0);
        const scheduled = Number(l.scheduled_hours || 0);
        return s + (actualHrs > 0 ? actualHrs : (pct / 100) * scheduled);
      }
      return s;
    }, 0);

    return {
      subject,
      scheduled: subLogs.reduce((s, l) => s + (Number(l.scheduled_hours) || 0), 0),
      completed: Number(subjectCompletedHours.toFixed(2)),
      status: subLogs.length > 0 ? subLogs[subLogs.length - 1].status : 'pending',
    };
  });

  // 4. Upsert to daily_summaries
  // Use timetable_id if available, fall back to a sentinel so the unique constraint works
  const upsertTimetableId = timetableId || null;

  // When timetableId is null, upsert on (user_id, date) to avoid duplicates
  const upsertData: any = {
    user_id: userId,
    timetable_id: upsertTimetableId,
    date,
    total_blocks: totalBlocks,
    completed_blocks: completedLogs.length,
    partial_blocks: partialLogs.length,
    skipped_blocks: skippedLogs.length,
    pending_blocks: Math.max(0, totalBlocks - safeLogs.length),
    scheduled_hours: Number(scheduledHours.toFixed(2)),
    completed_hours: Number(completedHours.toFixed(2)),
    partial_hours: Number(partialHours.toFixed(2)),
    completion_rate: Number(completionRate.toFixed(2)),
    focus_avg: focusAvg ? Number(focusAvg.toFixed(2)) : null,
    subject_breakdown: subjectBreakdown as any,
  };

  // 4. Write to daily_summaries
  //
  // When timetableId is provided: standard upsert on (user_id, date, timetable_id)
  // When timetableId is null: PostgreSQL treats NULL != NULL in unique constraints,
  // so we do a manual look-up + update-or-insert to avoid duplicates.
  if (timetableId) {
    const { error: upsertError } = await supabaseClient
      .from('daily_summaries')
      .upsert(upsertData, { onConflict: 'user_id,date,timetable_id' });

    if (upsertError) {
      console.error('daily_summaries upsert error:', upsertError);
    }
  } else {
    // Find existing row with null timetable_id for this user+date
    const { data: existing } = await supabaseClient
      .from('daily_summaries')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .is('timetable_id', null)
      .maybeSingle() as any;

    if (existing?.id) {
      const { error: updateError } = await (supabaseClient
        .from('daily_summaries') as any)
        .update(upsertData)
        .eq('id', existing.id);
      if (updateError) console.error('daily_summaries update error:', updateError);
    } else {
      const { error: insertError } = await (supabaseClient
        .from('daily_summaries') as any)
        .insert(upsertData);
      if (insertError) console.error('daily_summaries insert error:', insertError);
    }
  }
}

