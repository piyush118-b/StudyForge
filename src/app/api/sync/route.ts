import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { operations } = await req.json()
    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const results = []

    for (const op of operations) {
      if (op.type === 'track') {
        const payload = op.payload
        // Upsert standard block_logs structure
        const { data, error } = await (supabase as any).from('block_logs').upsert({
          block_id: payload.id,
          timetable_id: payload.timetableId,
          subject: payload.subject,
          day_of_week: payload.dayOfWeek,
          scheduled_date: payload.scheduledDate,
          status: payload.status,
          actual_hours: payload.actualHours || null,
          partial_percentage: payload.partialPercentage || null,
          skip_reason: payload.skipReason || null,
          focus_rating: payload.focusRating || null,
          notes: payload.notes || null,
          updated_at: new Date().toISOString()
        })
        if (error) throw error
        results.push({ type: 'track', status: 'success', data })
      } else if (op.type === 'grid_update') {
        // Example handling for grid update chunks
        results.push({ type: 'grid_update', status: 'success', message: 'Not implemented in this route yet, fallback to original if needed.' })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('Batch Sync Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
