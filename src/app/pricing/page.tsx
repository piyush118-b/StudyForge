'use client';

import { useState } from 'react';
import { PLANS } from '@/types/subscription.types';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useAuth } from '@/lib/auth-context';
import { Check, X, Zap, Shield, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: "Yes! Cancel from your dashboard anytime. You keep Pro access until the period ends — no questions asked.",
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. We use Supabase with row-level security. Your timetable data is private and encrypted. We never share your data.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'Yes! Email us at bagdipiyush91@gmail.com with your college ID for 50% off Pro!',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Credit/debit cards, net banking, and UPI via Stripe. We plan to add Razorpay soon for smoother Indian payments.',
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your timetables are completely safe. You just lose access to Pro-exclusive features. No data is ever deleted.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isPro, subscription, createCheckoutSession } = useSubscriptionStore();
  const { user } = useAuth();
  const router = useRouter();

  const proSavings = PLANS[1].price.monthly * 12 - PLANS[1].price.yearly; // 1188 - 799 = 389

  const handleUpgrade = async (priceId: string, planId: string) => {
    if (!user) {
      toast.error('Please log in to upgrade');
      router.push('/login');
      return;
    }
    if (!priceId) {
      toast.error('Price not configured. Please contact support.');
      return;
    }
    setLoadingPlan(planId);
    try {
      const url = await createCheckoutSession(priceId, 'pro');
      window.location.href = url;
    } catch {
      toast.error('Could not start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-forge-base text-forge-text-primary font-sans relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-forge-accent/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-20 relative z-10">

        {/* Header */}
        <div className="text-center mb-14 space-y-5">
          <div className="inline-block px-4 py-1.5 rounded-full bg-forge-accent/10 border border-forge-accent/20 text-forge-accent text-sm font-semibold">
            Simple, Student-Friendly Pricing 🎓
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-forge-text-primary to-forge-text-muted bg-clip-text text-transparent">
            Invest in Your Studies
          </h1>
          <p className="text-forge-text-secondary text-lg max-w-md mx-auto">
            Less than a movie ticket per month. Worth every rupee.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 bg-forge-elevated border border-forge-border rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-forge-accent text-forge-base shadow-lg shadow-forge-accent/30'
                  : 'text-forge-text-secondary hover:text-forge-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-forge-accent text-forge-base shadow-lg shadow-forge-accent/30'
                  : 'text-forge-text-secondary hover:text-forge-text-primary'
              }`}
            >
              Yearly
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          {/* Free Card */}
          <div className="bg-forge-elevated/60 border border-forge-border rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-forge-text-primary">Free</h2>
              <p className="text-forge-text-muted text-sm mt-1">{PLANS[0].description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-forge-text-primary">₹0</span>
                <span className="text-forge-text-muted text-sm">/month</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {PLANS[0].features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-forge-text-secondary">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
              {PLANS[0].notIncluded.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-forge-text-muted opacity-50 line-through">
                  <X className="w-4 h-4 text-forge-text-muted mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {!user || subscription?.plan === 'free' ? (
              <Link
                href="/create"
                className="block text-center py-3 rounded-xl border border-forge-border text-forge-text-secondary font-semibold hover:bg-forge-overlay transition-colors"
              >
                {!user ? 'Get Started Free' : 'Your Current Plan'}
              </Link>
            ) : (
              <div className="block text-center py-3 rounded-xl border border-forge-border text-forge-text-muted font-semibold cursor-not-allowed">
                Downgrade to Free
              </div>
            )}
          </div>

          {/* Pro Card */}
          <div className="relative bg-forge-elevated/80 border-2 border-forge-accent/60 rounded-2xl p-8 flex flex-col shadow-forge-2xl">
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 right-6 bg-forge-accent text-forge-base text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Most Popular ✨
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-forge-text-primary">Pro</h2>
              <p className="text-forge-text-secondary text-sm mt-1">{PLANS[1].description}</p>
              <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                {billing === 'yearly' ? (
                  <>
                    <span className="text-5xl font-bold text-forge-text-primary">₹799</span>
                    <span className="text-forge-text-secondary text-sm">/year</span>
                    <span className="text-forge-text-muted text-sm line-through ml-1">₹{PLANS[1].price.monthly * 12}</span>
                    <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Save ₹{proSavings}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl font-bold text-forge-text-primary">₹99</span>
                    <span className="text-forge-text-secondary text-sm">/month</span>
                  </>
                )}
              </div>
              <p className="text-forge-accent text-xs mt-2 font-medium">✨ 7-day free trial included</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {PLANS[1].features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-forge-text-primary">
                  <Check className="w-4 h-4 text-forge-accent mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="block text-center py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                ✓ Your Current Plan
              </div>
            ) : (
              <button
                onClick={() => {
                  const priceId = billing === 'yearly'
                    ? PLANS[1].priceId.yearly
                    : PLANS[1].priceId.monthly;
                  handleUpgrade(priceId, 'pro');
                }}
                disabled={loadingPlan === 'pro'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-forge-accent to-forge-accent-bright hover:shadow-forge-xl text-forge-base font-bold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'pro' ? 'Redirecting to Stripe...' : 'Upgrade to Pro ✨'}
              </button>
            )}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-forge-text-muted mb-16">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-forge-accent" />
            Secure payment via Stripe
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-forge-accent" />
            Cancel anytime, no questions
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-forge-accent" />
            Student discount? Email us
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-forge-elevated/60 border border-forge-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-forge-overlay/40 transition-colors"
                >
                  <span className="font-semibold text-forge-text-primary text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-forge-text-secondary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-forge-text-secondary shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-forge-text-secondary text-sm leading-relaxed border-t border-forge-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
