import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await request.json() as Record<string, unknown>;

  // Map camelCase to snake_case
  const row: Record<string, unknown> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.subject !== undefined) row.subject = updates.subject;
  if (updates.priority !== undefined) row.priority = updates.priority;
  if (updates.status !== undefined) {
    row.status = updates.status;
    if (updates.status === 'completed') row.completed_at = new Date().toISOString();
  }
  if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
  if (updates.dueTime !== undefined) row.due_time = updates.dueTime;
  if (updates.estimatedHours !== undefined) row.estimated_hours = updates.estimatedHours;
  if (updates.actualHours !== undefined) row.actual_hours = updates.actualHours;
  if (updates.tags !== undefined) row.tags = updates.tags;
  if (updates.linkedBlockId !== undefined) row.linked_block_id = updates.linkedBlockId;
  if (updates.notes !== undefined) row.notes = updates.notes;
  if (updates.completionPercentage !== undefined) row.completion_percentage = updates.completionPercentage;
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Soft delete — set status = 'cancelled'
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
