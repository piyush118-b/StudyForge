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
      router.push('/auth/login');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#10B981]/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-20 relative z-10">

        {/* Header */}
        <div className="text-center mb-14 space-y-5">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-sm font-semibold">
            Simple, Student-Friendly Pricing 🎓
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Invest in Your Studies
          </h1>
          <p className="text-[#A0A0A0] text-lg max-w-md mx-auto">
            Less than a movie ticket per month. Worth every rupee.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 bg-[#111111] border border-[#2A2A2A] rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150-all ${billing === 'monthly'
                  ? 'bg-[#10B981] text-[#F0F0F0] shadow-lg shadow-indigo-500/30'
                  : 'text-[#A0A0A0] hover:text-[#F0F0F0]'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150-all flex items-center gap-2 ${billing === 'yearly'
                  ? 'bg-[#10B981] text-[#F0F0F0] shadow-lg shadow-indigo-500/30'
                  : 'text-[#A0A0A0] hover:text-[#F0F0F0]'
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
          <div className="bg-[#111111]/60 border border-[#2A2A2A] rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-300">Free</h2>
              <p className="text-[#606060] text-sm mt-1">{PLANS[0].description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#F0F0F0]">₹0</span>
                <span className="text-[#606060] text-sm">/month</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {PLANS[0].features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
              {PLANS[0].notIncluded.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-600 line-through">
                  <X className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {!user || subscription?.plan === 'free' ? (
              <Link
                href="/create"
                className="block text-center py-3 rounded-xl border border-[#2A2A2A] text-[#A0A0A0] font-semibold hover:bg-[#1A1A1A] transition-all duration-150-colors hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200"
              >
                {!user ? 'Get Started Free' : 'Your Current Plan'}
              </Link>
            ) : (
              <div className="block text-center py-3 rounded-xl border border-[#2A2A2A] text-[#606060] font-semibold cursor-not-allowed">
                Downgrade to Free
              </div>
            )}
          </div>

          {/* Pro Card */}
          <div className="relative bg-[#111111]/80 border-2 border-[#10B981]/60 rounded-2xl p-8 flex flex-col shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 right-6 bg-[#10B981] text-[#F0F0F0] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Most Popular ✨
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#F0F0F0]">Pro</h2>
              <p className="text-[#A0A0A0] text-sm mt-1">{PLANS[1].description}</p>
              <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                {billing === 'yearly' ? (
                  <>
                    <span className="text-5xl font-bold tracking-tight text-[#F0F0F0]">₹799</span>
                    <span className="text-[#A0A0A0] text-sm">/year</span>
                    <span className="text-[#606060] text-sm line-through ml-1">₹{PLANS[1].price.monthly * 12}</span>
                    <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Save ₹{proSavings}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl font-bold tracking-tight text-[#F0F0F0]">₹99</span>
                    <span className="text-[#A0A0A0] text-sm">/month</span>
                  </>
                )}
              </div>
              <p className="text-[#10B981] text-xs mt-2 font-medium">✨ 7-day free trial included</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {PLANS[1].features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-200">
                  <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-[#F0F0F0] font-bold transition-all duration-150-all shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'pro' ? 'Redirecting to Stripe...' : 'Upgrade to Pro ✨'}
              </button>
            )}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-[#606060] mb-16">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#10B981]" />
            Secure payment via Stripe
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#10B981]" />
            Cancel anytime, no questions
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#10B981]" />
            Student discount? Email us
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-[#111111]/60 border border-[#2A2A2A] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1A1A1A]/40 transition-all duration-150-colors"
                >
                  <span className="font-semibold text-slate-200 text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-[#A0A0A0] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#A0A0A0] shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[#A0A0A0] text-sm leading-relaxed border-t border-[#2A2A2A] pt-3">
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
