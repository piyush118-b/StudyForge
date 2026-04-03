import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { recalculateDailySummary } from '@/lib/analytics-utils'

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

export async function POST(request: Request) {
  try {
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
        blockId, timetableId, subject, blockType, 
        dayOfWeek, scheduledDate, scheduledStart, scheduledEnd, 
        scheduledHours, status, actualHours, partialPercentage,
        skipReason, skipNote, focusRating, energyLevel, notes
    } = body

    // We do an UPSERT based on unique(user_id, block_id, scheduled_date)
    // Supabase JS doesn't seamlessly do UPSERT on non-primary keys unless we specify ON CONFLICT.
    // Let's do a select then update/insert as alternative if unique constraint isn't perfect, 
    // or just use UPSERT with onConflict 'user_id,block_id,scheduled_date'
    
    // Check if a log already exists for this block+date so we can UPDATE it
    // We also fetch timetable_id so recalculate always uses the correct value
    // even if the caller didn't send it (e.g. markBlockPartial in tracking-store)
    const { data: existing } = await supabase.from('block_logs')
       .select('id, timetable_id')
       .eq('user_id', user.id)
       .eq('block_id', blockId)
       .eq('scheduled_date', scheduledDate)
       .single()

    let result;

    if (existing) {
       result = await supabase.from('block_logs')
          .update({
             status,
             actual_hours: actualHours,
             partial_percentage: partialPercentage,
             skip_reason: skipReason,
             skip_note: skipNote,
             focus_rating: focusRating,
             energy_level: energyLevel,
             notes,
             marked_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select().single()
    } else {
       result = await supabase.from('block_logs')
          .insert({
             user_id: user.id,
             timetable_id: timetableId,
             block_id: blockId,
             subject: subject,
             block_type: blockType,
             day_of_week: dayOfWeek,
             scheduled_date: scheduledDate,
             scheduled_start: scheduledStart,
             scheduled_end: scheduledEnd,
             scheduled_hours: scheduledHours,
             status,
             actual_hours: actualHours || 0,
             partial_percentage: partialPercentage || 0,
             skip_reason: skipReason,
             skip_note: skipNote,
             focus_rating: focusRating,
             energy_level: energyLevel,
             notes,
             marked_at: new Date().toISOString()
          })
          .select().single()
    }

    if (result.error) throw result.error

    // ── Recalculate daily summary ─────────────────────────────────────────────
    //
    // IMPORTANT: Always use the timetable_id that's actually stored in block_logs,
    // NOT what the caller passed (partial/skip actions from tracking-store don't
    // send timetableId, which would create orphaned null-timetable summaries and
    // break the Study Volume chart).
    //
    const effectiveTimetableId =
      (result.data as any)?.timetable_id   // from the written/updated row
      ?? existing?.timetable_id            // from the pre-existing row
      ?? timetableId                       // fallback to request body value
      ?? null;

    recalculateDailySummary(user.id, effectiveTimetableId, scheduledDate).catch(console.error)

    return NextResponse.json(result.data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const timetableId = searchParams.get('timetableId')

    let query = supabase.from('block_logs').select('*').eq('user_id', user.id)
    
    if (date) query = query.eq('scheduled_date', date)
    if (timetableId) query = query.eq('timetable_id', timetableId)

    const { data, error } = await query

    if (error) throw error

    // Map snake_case to camelCase
    const mapped = data.map(d => ({
        id: d.id,
        userId: d.user_id,
        timetableId: d.timetable_id,
        blockId: d.block_id,
        subject: d.subject,
        blockType: d.block_type,
        dayOfWeek: d.day_of_week,
        scheduledDate: d.scheduled_date,
        scheduledStart: d.scheduled_start,
        scheduledEnd: d.scheduled_end,
        scheduledHours: d.scheduled_hours,
        status: d.status,
        actualHours: d.actual_hours,
        partialPercentage: d.partial_percentage,
        skipReason: d.skip_reason,
        focusRating: d.focus_rating,
        energyLevel: d.energy_level,
        notes: d.notes,
        markedAt: d.marked_at
    }))

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
  }
}


