import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:hello@studyforge.ai',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    // Only accept authenticated internal cron calls or specific auth
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Example logic: Find blocks starting in the next 15 minutes that don't have a sent log
    // For now, we'll just pull active subscriptions and send a mock "Upcoming Study Block" 
    // to test the system pipeline.
    
    const { data: subs, error } = await supabaseAdmin
      .from('user_push_subscriptions')
      .select('user_id, subscription_data');

    if (error) throw error;

    let successCount = 0;
    
    for (const sub of subs) {
      // In a real system, you'd match the user_id with their upcoming blocks.
      const payload = JSON.stringify({
        title: 'StudyForge Reminder',
        body: 'You have a study block starting soon! Keep up the momentum. 🔥',
        url: '/dashboard/today'
      });

      try {
        await webpush.sendNotification(sub.subscription_data, payload);
        successCount++;
        
        // Also log to the in-app notifications
        await supabaseAdmin.from('notifications').insert({
          user_id: sub.user_id,
          title: 'Upcoming Study Block',
          body: 'You have a study block starting soon!',
          type: 'reminder',
          is_sent: true,
          scheduled_for: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.statusCode === 410) {
          // Unsubscribed or expired, clean up
          await supabaseAdmin.from('user_push_subscriptions').delete().eq('user_id', sub.user_id);
        } else {
          console.error("Failed to send push:", err);
        }
      }
    }

    return NextResponse.json({ success: true, sent: successCount });
  } catch (err: any) {
    console.error('[Reminders Cron Error]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
