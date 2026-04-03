import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId: string;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;

    const subscription = await req.json();

    // Store in our user_push_subscriptions table (created in Phase 4 SQL)
    const { error: dbError } = await supabaseAdmin
      .from('user_push_subscriptions')
      .upsert({
         user_id: userId,
         subscription_data: subscription, 
         updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (dbError) {
        throw new Error(dbError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[VAPID Subscribe Error]', err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
