import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getLocalDateStr } from '@/lib/time-utils';

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

/**
 * GET /api/analytics/subjects?date=YYYY-MM-DD
 *
 * Returns today's subject breakdown pulled from:
 *  - The active timetable's grid_data (planned hours for each subject today)
 *  - block_logs for the given date (actual / partial hours)
 *
 * This powers the Subject Distribution chart on the analytics page.
 * It is scoped entirely to the user — no timetable_id filter on logs.
 */
export async function GET(request: Request) {
  try {
    const supabase = await getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    // Default to today using timezone-safe getter
    const date = searchParams.get('date') || getLocalDateStr();

    // ─── 1. Derive day name from date ──────────────────────────────
    // Use noon UTC to avoid off-by-one from timezone shifts
    const dayName = new Date(date + 'T12:00:00Z')
      .toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Saturday"
    const dayNameLower = dayName.toLowerCase();           // e.g. "saturday"
    const colId = `col_${dayNameLower}`;                  // e.g. "col_saturday"

    // Helper: does this block belong to today's column?
    // Handles all storage formats used by the editor:
    //   block.dayId === 'col_saturday'
    //   block.day   === 'Saturday'  (exact match)
    //   block.day   === 'saturday'  (lowercase)
    //   block.day   === 'col_saturday' (legacy)
    function blockMatchesToday(b: any): boolean {
      const dayId = (b.dayId || '').toLowerCase();
      const day   = (b.day   || '').toLowerCase();
      return (
        dayId === colId ||
        dayId === dayNameLower ||
        day   === dayNameLower ||
        day   === colId
      );
    }

    // ─── 2. Get the active timetable's grid_data ───────────────────
    const { data: activeTT } = await supabase
      .from('timetables')
      .select('id, grid_data')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle() as any;

    // Build a map: subject → { plannedHours, color, startTime, endTime }
    const plannedMap: Record<string, { plannedHours: number; color: string; startTime?: string; endTime?: string }> = {};

    if (activeTT?.grid_data) {
      const allBlocks = Object.values(activeTT.grid_data) as any[];
      const todayBlocks = allBlocks.filter(blockMatchesToday);

      for (const block of todayBlocks) {
        const subject: string = block.subject || 'Unknown';
        const color: string = block.color || '#6366f1';

        // Calculate hours from startTime / endTime strings ("HH:MM")
        let hrs = 0;
        if (block.startTime && block.endTime) {
          const [sh, sm] = block.startTime.split(':').map(Number);
          const [eh, em] = block.endTime.split(':').map(Number);
          hrs = Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
        } else {
          hrs = 1; // fallback
        }

        if (!plannedMap[subject]) {
          plannedMap[subject] = { plannedHours: 0, color, startTime: block.startTime, endTime: block.endTime };
        }
        plannedMap[subject].plannedHours += hrs;
        // Keep the earliest startTime and latest endTime for the "Now Studying" feature
        if (block.startTime && (!plannedMap[subject].startTime || block.startTime < plannedMap[subject].startTime!)) {
          plannedMap[subject].startTime = block.startTime;
        }
        if (block.endTime && (!plannedMap[subject].endTime || block.endTime > plannedMap[subject].endTime!)) {
          plannedMap[subject].endTime = block.endTime;
        }
      }
    }

    // Build a separate map of today's grid blocks by blockId for the reconciliation step
    // We store: blockId → { subject, hours, completionPercentage, status }
    const gridBlockMap: Record<string, { subject: string; hrs: number; completionPercentage: number; status: string }> = {};
    if (activeTT?.grid_data) {
      const allBlocks = Object.values(activeTT.grid_data) as any[];
      for (const block of allBlocks.filter(blockMatchesToday)) {
        if (!block.id) continue;
        let hrs = 0;
        if (block.startTime && block.endTime) {
          const [sh, sm] = block.startTime.split(':').map(Number);
          const [eh, em] = block.endTime.split(':').map(Number);
          hrs = Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
        }
        gridBlockMap[block.id] = {
          subject: block.subject || 'Unknown',
          hrs,
          completionPercentage: typeof block.completionPercentage === 'number' ? block.completionPercentage : (block.status === 'completed' ? 100 : 0),
          status: block.status || 'pending',
        };
      }
    }

    // ─── 3. Get actual block_logs for the date (user-scoped, not timetable-scoped) ──
    const { data: rawLogs } = await supabase
      .from('block_logs')
      .select('block_id, subject, status, scheduled_hours, actual_hours, partial_percentage')
      .eq('user_id', user.id)
      .eq('scheduled_date', date)
      .order('marked_at', { ascending: false }) as any; // newest first for dedup

    // Deduplicate: keep only the most recent log per block_id.
    // Without this, a block marked partial then complete creates two rows → double count.
    const seenBlocks = new Set<string>();
    const logs: any[] = [];
    for (const log of (rawLogs || [])) {
      const key = log.block_id || `${log.subject}__${log.scheduled_date}__${log.scheduled_start}`; // stable, not affected by status changes
      if (!seenBlocks.has(key)) {
        seenBlocks.add(key);
        logs.push(log);
      }
    }

    // Build actual map: subject → { completedHours, partialHours }
    const actualMap: Record<string, { completedHours: number; partialHours: number; status: string }> = {};

    for (const log of (logs || [])) {
      const subject: string = log.subject || 'Unknown';
      if (!actualMap[subject]) {
        actualMap[subject] = { completedHours: 0, partialHours: 0, status: 'pending' };
      }
      if (log.status === 'completed') {
        actualMap[subject].completedHours += Number(log.scheduled_hours) || 0;
        actualMap[subject].status = 'completed';
      } else if (log.status === 'partial') {
        // Use actual_hours if set; else derive from percentage (handles legacy 0-actual_hours rows)
        const pct = Number(log.partial_percentage || 0);
        const scheduled = Number(log.scheduled_hours || 0);
        const actualHrs = Number(log.actual_hours || 0);
        const effectiveHrs = actualHrs > 0 ? actualHrs : (pct / 100) * scheduled;
        actualMap[subject].partialHours += Number(effectiveHrs.toFixed(2));
        actualMap[subject].status = 'partial';
      } else if (log.status === 'skipped') {
        actualMap[subject].status = 'skipped';
      }
    }

    // ─── 3b. Reconcile grid_data vs block_logs ────────────────────────────────────
    //
    // For any block in grid_data that has a non-pending status but either:
    //   (a) has no block_log entry at all, OR
    //   (b) has a block_log with actual_hours = 0 (stale/broken entry)
    // → synthesize the actual hours from grid_data.completionPercentage.
    //
    // This ensures the timetable and analytics always agree.
    //
    // Track which block_ids we already have good data for from block_logs
    const goodBlockIds = new Set<string>(logs.map((l: any) => l.block_id).filter(Boolean));
    const loggedSubjectHours: Record<string, number> = {};
    for (const log of logs) {
      const s = log.subject || 'Unknown';
      const hrs = Number(log.actual_hours || 0);
      if (!loggedSubjectHours[s]) loggedSubjectHours[s] = 0;
      loggedSubjectHours[s] += hrs;
    }

    for (const [blockId, gridBlock] of Object.entries(gridBlockMap)) {
      const { subject, hrs, completionPercentage, status } = gridBlock;
      if (status === 'pending') continue; // nothing to synthesize

      const hasGoodLog = goodBlockIds.has(blockId);
      const loggedHrs = loggedSubjectHours[subject] || 0;

      if (!hasGoodLog || loggedHrs === 0) {
        // No block_log or stale zero — synthesize from grid_data
        const syntheticHrs = Number(((completionPercentage / 100) * hrs).toFixed(2));
        if (!actualMap[subject]) {
          actualMap[subject] = { completedHours: 0, partialHours: 0, status: 'pending' };
        }
        if (status === 'completed') {
          actualMap[subject].completedHours = Math.max(actualMap[subject].completedHours, syntheticHrs);
          actualMap[subject].status = 'completed';
        } else if (status === 'partial') {
          actualMap[subject].partialHours = Math.max(actualMap[subject].partialHours, syntheticHrs);
          if (actualMap[subject].status !== 'completed') {
            actualMap[subject].status = 'partial';
          }
        } else if (status === 'skipped') {
          actualMap[subject].status = 'skipped';
        }
      }
    }

    // ─── 4. Merge planned + actual ─────────────────────────────────
    // Union of all subject keys (planned OR actually logged)
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];
    let colorIdx = 0;

    const allSubjects = new Set([
      ...Object.keys(plannedMap),
      ...Object.keys(actualMap),
    ]);

    const result = Array.from(allSubjects).map((subject) => {
      const planned = plannedMap[subject] || { plannedHours: 0, color: COLORS[colorIdx++ % COLORS.length] };
      const actual = actualMap[subject] || { completedHours: 0, partialHours: 0, status: 'pending' };

      const totalActual = actual.completedHours + actual.partialHours;
      const completionRate = planned.plannedHours > 0
        ? (totalActual / planned.plannedHours) * 100
        : (totalActual > 0 ? 100 : 0);

      return {
        subject,
        plannedHours: Number(planned.plannedHours.toFixed(2)),
        completedHours: Number(actual.completedHours.toFixed(2)),
        partialHours: Number(actual.partialHours.toFixed(2)),
        totalActualHours: Number(totalActual.toFixed(2)),
        completionRate: Number(completionRate.toFixed(1)),
        status: actual.status,
        color: planned.color,
        startTime: planned.startTime,
        endTime: planned.endTime,
      };
    });

    // Sort: completed first, then partial, then pending, then skipped
    const statusOrder: Record<string, number> = { completed: 0, partial: 1, pending: 2, skipped: 3 };
    result.sort((a, b) => (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2));

    return NextResponse.json({ date, dayName, subjects: result });
  } catch (err: any) {
    console.error('Analytics/subjects error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
