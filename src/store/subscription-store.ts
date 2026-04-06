import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Subscription, PlanType } from '@/types/subscription.types';

// Raw DB row shape (mirrors the SQL table, avoids Supabase generated types
// which don't exist until SQL is applied)
interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  ai_calls_used: number;
  ai_calls_limit: number;
  created_at: string;
  updated_at: string;
}

interface SubscriptionStore {
  subscription: Subscription | null;
  loading: boolean;

  // Computed getters
  isPro: boolean;
  isFree: boolean;
  aiCallsRemaining: number;
  canUseAI: boolean;
  canCollaborate: boolean;
  canExportAdvanced: boolean;

  // Actions
  fetchSubscription: (userId: string) => Promise<void>;
  incrementAICalls: () => Promise<void>;
  createCheckoutSession: (priceId: string, plan: PlanType) => Promise<string>;
  createPortalSession: () => Promise<string>;
}

function computeFields(sub: Subscription | null) {
  const isPro =
    sub !== null &&
    sub.plan !== 'free' &&
    sub.status === 'active';
  const aiCallsRemaining = isPro
    ? Infinity
    : Math.max(0, (sub?.aiCallsLimit ?? 5) - (sub?.aiCallsUsed ?? 0));
  return {
    isPro,
    isFree: !isPro,
    aiCallsRemaining,
    canUseAI: isPro || aiCallsRemaining > 0,
    canCollaborate: isPro,
    canExportAdvanced: isPro,
  };
}

function rowToSubscription(data: SubscriptionRow): Subscription {
  return {
    id: data.id,
    userId: data.user_id,
    plan: data.plan as Subscription['plan'],
    status: data.status as Subscription['status'],
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    stripePriceId: data.stripe_price_id,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    trialEnd: data.trial_end,
    aiCallsUsed: data.ai_calls_used ?? 0,
    aiCallsLimit: data.ai_calls_limit ?? 5,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function freeFallback(userId: string): Subscription {
  return {
    id: '',
    userId,
    plan: 'free',
    status: 'active',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    trialEnd: null,
    aiCallsUsed: 0,
    aiCallsLimit: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: null,
  loading: true,
  isPro: false,
  isFree: true,
  aiCallsRemaining: 5,
  canUseAI: true,
  canCollaborate: false,
  canExportAdvanced: false,

  fetchSubscription: async (userId: string) => {
    set({ loading: true });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const fallback = freeFallback(userId);
        set({ subscription: fallback, loading: false, ...computeFields(fallback) });
        return;
      }

      const sub = rowToSubscription(data as SubscriptionRow);
      set({ subscription: sub, loading: false, ...computeFields(sub) });
    } catch (err) {
      console.error('[SubscriptionStore] fetch error:', (err as any)?.message || err);
      // Still set a fallback so the app doesn't break
      const fallback = freeFallback(userId);
      set({ subscription: fallback, loading: false, ...computeFields(fallback) });
    }
  },

  incrementAICalls: async () => {
    const { subscription } = get();
    if (!subscription || subscription.id === '') return;

    const updated: Subscription = {
      ...subscription,
      aiCallsUsed: subscription.aiCallsUsed + 1,
    };
    set({ subscription: updated, ...computeFields(updated) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .update({ ai_calls_used: updated.aiCallsUsed })
      .eq('id', subscription.id);
  },

  createCheckoutSession: async (priceId: string, plan: PlanType) => {
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, plan }),
    });
    if (!res.ok) throw new Error('Failed to create checkout session');
    const { url } = await res.json() as { url: string };
    return url;
  },

  createPortalSession: async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create portal session');
    const { url } = await res.json() as { url: string };
    return url;
  },
}));
