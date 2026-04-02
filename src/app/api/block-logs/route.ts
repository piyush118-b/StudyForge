import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
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
    
    // Check if it exists
    const { data: existing } = await supabase.from('block_logs')
       .select('id')
       .eq('user_id', session.user.id)
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
             user_id: session.user.id,
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

    // Recalculate daily summary in background (don't await)
    recalculateDailySummary(session.user.id, timetableId, scheduledDate).catch(console.error)

    return NextResponse.json(result.data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabase()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const timetableId = searchParams.get('timetableId')

    let query = supabase.from('block_logs').select('*').eq('user_id', session.user.id)
    
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

// Background Task Function
async function recalculateDailySummary(userId: string, timetableId: string, date: string) {
    const supabase = await getSupabase();
    
    // 1. Get all logs
    const { data: logs } = await supabase.from('block_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('timetable_id', timetableId)
        .eq('scheduled_date', date)
        
    if (!logs) return;

    // 2. Calculate
    const completedBlocks = logs.filter(l => l.status === 'completed').length
    const partialBlocks = logs.filter(l => l.status === 'partial').length
    const skippedBlocks = logs.filter(l => l.status === 'skipped').length
    const pendingBlocks = logs.filter(l => l.status === 'pending').length
    const totalBlocks = logs.length

    const scheduledHours = logs.reduce((sum, l) => sum + (Number(l.scheduled_hours) || 0), 0)
    const completedHours = logs.filter(l => l.status === 'completed').reduce((sum, l) => sum + (Number(l.scheduled_hours) || 0), 0)
    const partialHours = logs.filter(l => l.status === 'partial').reduce((sum, l) => sum + (Number(l.actual_hours) || 0), 0)

    const effectiveCompleted = completedBlocks + (partialBlocks * 0.5)
    const completionRate = totalBlocks > 0 ? (effectiveCompleted / totalBlocks) * 100 : 0

    const ratedLogs = logs.filter(l => l.focus_rating !== null)
    const focusAvg = ratedLogs.length > 0 ? ratedLogs.reduce((sum, l) => sum + l.focus_rating!, 0) / ratedLogs.length : null

    const subjects = [...new Set(logs.map(l => l.subject))]
    const subjectBreakdown = subjects.map(subject => {
       const subjectLogs = logs.filter(l => l.subject === subject)
       return {
          subject,
          scheduled: subjectLogs.reduce((s, l) => s + (Number(l.scheduled_hours) || 0), 0),
          completed: subjectLogs.filter(l => l.status === 'completed').reduce((s, l) => s + (Number(l.scheduled_hours) || 0), 0),
          status: 'calculated' // getMajorityStatus omitted for brevity
       }
    })

    // 3. Upsert into daily_summaries
    // check existence
    const { data: existingSum } = await supabase.from('daily_summaries')
        .select('id')
        .eq('user_id', userId)
        .eq('timetable_id', timetableId)
        .eq('date', date)
        .single()

    if (existingSum) {
        await supabase.from('daily_summaries')
           .update({
              total_blocks: totalBlocks,
              completed_blocks: completedBlocks,
              partial_blocks: partialBlocks,
              skipped_blocks: skippedBlocks,
              pending_blocks: pendingBlocks,
              scheduled_hours: scheduledHours,
              completed_hours: completedHours,
              partial_hours: partialHours,
              completion_rate: completionRate,
              focus_avg: focusAvg,
              subject_breakdown: subjectBreakdown,
              updated_at: new Date().toISOString()
           })
           .eq('id', existingSum.id)
    } else {
        await supabase.from('daily_summaries')
           .insert({
              user_id: userId,
              timetable_id: timetableId,
              date: date,
              total_blocks: totalBlocks,
              completed_blocks: completedBlocks,
              partial_blocks: partialBlocks,
              skipped_blocks: skippedBlocks,
              pending_blocks: pendingBlocks,
              scheduled_hours: scheduledHours,
              completed_hours: completedHours,
              partial_hours: partialHours,
              completion_rate: completionRate,
              focus_avg: focusAvg,
              subject_breakdown: subjectBreakdown
           })
    }
}
