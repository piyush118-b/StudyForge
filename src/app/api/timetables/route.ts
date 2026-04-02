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
    const { title, colorTag, semesterStart, semesterEnd, isActive, gridData, onboardingData } = body
    
    // Validate
    if (!title) {
        return NextResponse.json({ error: 'Missing title' }, { status: 400 })
    }

    // Deactivate others if needed
    if (isActive) {
       await supabase.from('timetables')
         .update({ is_active: false })
         .eq('user_id', session.user.id)
    }

    const { data, error } = await supabase.from('timetables').insert({
       user_id: session.user.id,
       title,
       color_tag: colorTag || '#6366f1',
       semester_start: semesterStart || null,
       semester_end: semesterEnd || null,
       is_active: isActive || false,
       activated_at: isActive ? new Date().toISOString() : null,
       grid_data: gridData || {},
       onboarding_data: onboardingData || {},
       total_blocks: calculateTotalBlocks(gridData)
    }).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await getSupabase()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase.from('timetables')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
  }
}

function calculateTotalBlocks(gridData: any) {
  if (!gridData || !gridData.days) return 0
  let total = 0
  for (const day of gridData.days) {
     if (day.blocks) total += day.blocks.length
  }
  return total
}
