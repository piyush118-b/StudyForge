import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { subDays, format } from 'date-fns';

export async function POST(request: Request) {
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

  const userId = user.id;
  const subjects = ['Data Structures', 'Operating Systems', 'DBMS', 'Physics', 'Mathematics'];
  const today = new Date();

  const sessions = [];
  
  // Generate 50 sessions spread over the last 14 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const dateObj = subDays(today, daysAgo);
    
    sessions.push({
      user_id: userId,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      session_type: 'focus',
      planned_minutes: 25,
      actual_minutes: [15, 20, 25, 25, 25][Math.floor(Math.random() * 5)],
      status: 'completed',
      date: format(dateObj, 'yyyy-MM-dd'),
      started_at: new Date(dateObj.getTime() - 25 * 60000).toISOString(),
      ended_at: dateObj.toISOString(),
    });
  }

  // Insert mock sessions
  const { error: sessionErr } = await supabase.from('pomodoro_sessions').insert(sessions);
  if (sessionErr) return NextResponse.json({ error: sessionErr.message }, { status: 500 });

  // Update mock streak
  const { error: streakErr } = await supabase
    .from('study_streaks')
    .upsert({
      user_id: userId,
      current_streak: 5,
      longest_streak: 12,
      last_study_date: format(today, 'yyyy-MM-dd')
    }, { onConflict: 'user_id' });

  if (streakErr) return NextResponse.json({ error: streakErr.message }, { status: 500 });

  return NextResponse.json({ success: true, message: 'Injected 50 mock pomodoros and 5 day streak.' });
}
