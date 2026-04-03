import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { TaskFormData } from '@/types/task.types';

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
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timetableId = searchParams.get('timetable_id');
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy') || 'created_at';

  let query = supabase.from('tasks').select('*').eq('user_id', user.id);
  if (status) query = query.eq('status', status);
  query = query.order(sortBy === 'due_date' ? 'due_date' : sortBy === 'priority' ? 'priority' : 'created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as TaskFormData;
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const validPriorities = ['High', 'Medium', 'Low'];
  if (!validPriorities.includes(body.priority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      description: body.description || null,
      subject: body.subject || null,
      priority: body.priority,
      due_date: body.dueDate || null,
      due_time: body.dueTime || null,
      estimated_hours: body.estimatedHours || null,
      tags: body.tags || [],
      notes: body.notes || null,
      reminder_minutes: body.reminderMinutes || 30,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
