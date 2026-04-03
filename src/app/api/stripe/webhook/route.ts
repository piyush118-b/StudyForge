import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import stripe from '@/lib/stripe';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const subData = subscription as unknown as Record<string, unknown>;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'pro',
            status: 'active',
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            current_period_start: new Date(Number(subData['current_period_start']) * 1000).toISOString(),
            current_period_end: new Date(Number(subData['current_period_end']) * 1000).toISOString(),
            ai_calls_limit: -1, // unlimited
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('user_id', userId);

        // Unlock pro_member achievement
        await supabaseAdmin.from('achievements').upsert({
          user_id: userId,
          achievement_key: 'pro_member',
          achievement_name: 'Pro Member 💎',
          achievement_description: 'Upgraded to StudyForge Pro',
          badge_emoji: '💎',
          is_seen: false,
        }, { onConflict: 'user_id,achievement_key', ignoreDuplicates: true });

        // Log lifecycle event
        await supabaseAdmin.from('lifecycle_events').insert({
          user_id: userId,
          event_type: 'upgraded_to_pro',
          event_data: { plan: 'pro', subscription_id: subscription.id },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: subRow } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!subRow) break;

        const subRaw = sub as unknown as Record<string, unknown>;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: sub.status as string,
            current_period_start: new Date(Number(subRaw['current_period_start']) * 1000).toISOString(),
            current_period_end: new Date(Number(subRaw['current_period_end']) * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq('user_id', subRow.user_id);

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: subRow } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!subRow) break;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'cancelled',
            ai_calls_limit: 5,
            cancel_at_period_end: false,
          })
          .eq('user_id', subRow.user_id);

        await supabaseAdmin.from('lifecycle_events').insert({
          user_id: subRow.user_id,
          event_type: 'downgraded_to_free',
          event_data: {},
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: subRow } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!subRow) break;

        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('user_id', subRow.user_id);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe webhook] handler error', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
