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
        const { id } = context.params
        const supabase = await getSupabase()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        
        // If they are setting this as active, deactivate all others
        if (body.is_active) {
            await supabase.from('timetables')
              .update({ is_active: false })
              .eq('user_id', session.user.id)
        }

        if (body.is_active) {
            body.activated_at = new Date().toISOString()
        }

        const { data, error } = await supabase.from('timetables')
            .update(body)
            .eq('id', id)
            .eq('user_id', session.user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)

    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const { id } = context.params
        const supabase = await getSupabase()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase.from('timetables')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 })
    }
}
