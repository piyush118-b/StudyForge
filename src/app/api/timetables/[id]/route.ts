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

export async function PATCH(request: Request, context: any) {
    try {
        const { id } = await context.params
        const supabase = await getSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        
        // Prepare update object to avoid broad body injection
        const updateData: any = {}
        if (body.grid_data !== undefined) updateData.grid_data = body.grid_data
        if (body.title !== undefined) updateData.title = body.title
        if (body.is_active !== undefined) updateData.is_active = body.is_active
        if (body.total_blocks !== undefined) updateData.total_blocks = body.total_blocks
        if (body.total_weekly_hours !== undefined) updateData.total_weekly_hours = body.total_weekly_hours
        
        // If they are setting this as active, deactivate all others
        if (updateData.is_active) {
            await supabase.from('timetables')
              .update({ is_active: false })
              .eq('user_id', user.id)
            
            updateData.activated_at = new Date().toISOString()
        }

        const { data, error } = await supabase.from('timetables')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)

    } catch (err: any) {
        console.error(err)
        import('fs').then(fs => fs.writeFileSync('/tmp/studyforge_save_error.json', JSON.stringify(err, null, 2)))
        return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const { id } = await context.params
        const supabase = await getSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Delete associated analytics history — we cannot null out timetable_id 
        // due to database NOT NULL constraints on block_logs and daily_summaries.
        await supabase.from('block_logs')
            .delete()
            .eq('timetable_id', id)
            .eq('user_id', user.id)

        await supabase.from('daily_summaries')
            .delete()
            .eq('timetable_id', id)
            .eq('user_id', user.id)

        // 2. Delete associated tasks
        await supabase.from('tasks')
            .delete()
            .eq('timetable_id', id)
            .eq('user_id', user.id)

        // 3. Delete the timetable itself
        const { error: deleteError } = await supabase.from('timetables')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return NextResponse.json({ 
                error: deleteError.message || 'Database error occurred',
                code: deleteError.code,
                details: deleteError.details
            }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error('Catch error:', err)
        return NextResponse.json({ error: err.message || 'Server error occurred' }, { status: 500 })
    }

}
