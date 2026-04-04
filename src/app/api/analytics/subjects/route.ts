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

    // ─── 3. Get actual block_logs for the date (user-scoped, not timetable-scoped) ──
    const { data: logs } = await supabase
      .from('block_logs')
      .select('subject, status, scheduled_hours, actual_hours, partial_percentage')
      .eq('user_id', user.id)
      .eq('scheduled_date', date) as any;

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
        actualMap[subject].partialHours += Number(log.actual_hours) || 0;
        actualMap[subject].status = 'partial';
      } else if (log.status === 'skipped') {
        actualMap[subject].status = 'skipped';
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
