'use client';

import { useMemo } from 'react';
import { useSubscriptionStore } from '@/store/subscription-store';
import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';

type GatedFeature =
  | 'ai_generation'
  | 'export_pdf'
  | 'export_excel'
  | 'collaborate'
  | 'advanced_analytics'
  | 'ai_chat'
  | 'photo_scanner';

interface ProGateProps {
  feature: GatedFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FEATURE_LABELS: Record<GatedFeature, string> = {
  ai_generation: 'AI Generation',
  export_pdf: 'PDF Export',
  export_excel: 'Excel Export',
  collaborate: 'Collaboration',
  advanced_analytics: 'Advanced Analytics',
  ai_chat: 'AI Chat Assistant',
  photo_scanner: 'Photo Scanner',
};

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { isPro, canUseAI } = useSubscriptionStore();

  const hasAccess = useMemo(() => {
    switch (feature) {
      case 'ai_generation': return canUseAI;
      case 'export_pdf': return isPro;
      case 'export_excel': return isPro;
      case 'collaborate': return isPro;
      case 'advanced_analytics': return isPro;
      case 'ai_chat': return isPro;
      case 'photo_scanner': return isPro;
      default: return true;
    }
  }, [feature, isPro, canUseAI]);

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative isolate overflow-hidden rounded-xl bg-transparent">
      <div className="blur-md opacity-20 pointer-events-none select-none transition-all duration-150-all duration-300">
        {children}
      </div>
      {!isPro && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0A0A0A]/85 backdrop-blur-sm rounded-xl">
          {fallback ? fallback : (
            <div className="text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[#F59E0B]/20 flex items-center justify-center text-2xl mx-auto mb-4">
                🔒
              </div>
              <h4 className="text-sm font-semibold text-[#F0F0F0] mb-1 tracking-tight">
                Pro Feature
              </h4>
              <p className="text-xs text-[#A0A0A0] mb-4 leading-relaxed max-w-[160px]">
                Upgrade to Pro to unlock {FEATURE_LABELS[feature]}
              </p>
              <a href="/pricing"
                 className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#10B981] text-[#0A0A0A] text-xs font-bold hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
                <Zap className="w-3.5 h-3.5" />
                Upgrade
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function UpgradePrompt({ feature }: { feature: GatedFeature }) {
  const label = FEATURE_LABELS[feature];

  return (
    <Link
      href="/pricing"
      className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-forge-accent px-6 text-sm font-semibold text-forge-base shadow-forge-glow transition-all duration-150-all duration-200 hover:scale-[1.02] hover:bg-forge-accent-bright hover:shadow-forge-glow-strong active:scale-[0.98]"
    >
      <Lock className="w-4 h-4" />
      <span>{label} — Upgrade</span>
      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
    </Link>
  );
}

// A compact inline banner shown when user is close to their AI limit
export function AIUsageBanner() {
  const { canUseAI, subscription, isPro } = useSubscriptionStore();

  if (isPro || !subscription) return null;

  const aiCallsLimit = subscription.aiCallsLimit;
  const used = subscription.aiCallsUsed;
  const remainingCredits = Math.max(0, aiCallsLimit - used);
  const isFree = !isPro;

  if (!canUseAI) {
    return (
      <div className="relative overflow-hidden bg-[#1A1A1A] border border-[#F59E0B]/25 rounded-xl p-5 mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(245,158,11,0.04)] to-transparent pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center text-xl flex-shrink-0">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[#F0F0F0] mb-1">
              AI credits used up
            </h4>
            <p className="text-xs text-[#A0A0A0] leading-relaxed mb-3">
              You&apos;ve used all {aiCallsLimit} free AI generations. Upgrade to Pro for unlimited timetable generation.
            </p>
            <a href="/pricing"
               className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-[#F59E0B] text-[#0A0A0A] text-xs font-bold hover:bg-[#FCD34D] transition-all duration-150-all duration-150 active:scale-[0.97]">
              <Zap className="w-3.5 h-3.5" />
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-medium text-[#A0A0A0]">
      <Zap className="w-3.5 h-3.5" />
      <span>
        <span className={`font-bold ${remainingCredits <= 1 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
          {remainingCredits}
        </span>
        /{aiCallsLimit} AI credits left
      </span>
      {remainingCredits <= 2 && (
        <a href="/pricing" className="text-[#10B981] hover:text-[#34D399] transition-all duration-150-colors ml-1">
          Upgrade →
        </a>
      )}
    </div>
  );
}
