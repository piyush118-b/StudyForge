export type PlanType = 'free' | 'pro' | 'pro_yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  aiCallsUsed: number;
  aiCallsLimit: number; // -1 = unlimited (pro)
  createdAt: string;
  updatedAt: string;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: { monthly: number; yearly: number };
  priceId: { monthly: string; yearly: string };
  description: string;
  features: string[];
  notIncluded: string[];
  badge: string | null;
  color: string;
}

export const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    priceId: { monthly: '', yearly: '' },
    description: 'Perfect for getting started',
    features: [
      '3 timetables',
      '5 AI generations/month',
      'Basic exports (PNG)',
      'Manual timetable editor',
      'Daily tracking',
      'Basic analytics (7 days)',
    ],
    notIncluded: [
      'Unlimited AI generations',
      'PDF & Excel exports',
      'Collaboration',
      'Advanced analytics',
      'Priority AI (Gemini Pro)',
      'Remove watermark',
    ],
    badge: null,
    color: '#64748b',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 99, yearly: 799 },
    priceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? '',
    },
    description: 'For serious students',
    features: [
      'Unlimited timetables',
      'Unlimited AI generations',
      'All export formats (PNG/PDF/Excel/ICS)',
      'Collaboration (up to 5 members)',
      'Full analytics (unlimited history)',
      'Priority AI (Gemini Pro)',
      'No watermark on exports',
      'AI chat assistant in editor',
      'Photo timetable scanner',
      'Priority support',
      'Achievement badges',
      'Weekly AI insights email',
    ],
    notIncluded: [],
    badge: 'Most Popular',
    color: '#6366f1',
  },
];
