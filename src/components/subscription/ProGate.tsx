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
    <div className="relative isolate overflow-hidden rounded-xl border border-forge-border bg-forge-elevated/50">
      <div className="blur-md opacity-20 pointer-events-none select-none contrast-75 saturate-50 transition-all duration-300 group-hover:blur-lg">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-forge-base/10 backdrop-blur-[2px]">
        {fallback ? (
          fallback
        ) : (
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-forge-accent/20 flex items-center justify-center mb-4 ring-4 ring-forge-accent/10">
              <Lock className="w-6 h-6 text-forge-accent" />
            </div>
            <h3 className="text-lg font-bold text-forge-text-primary mb-2 shadow-sm">
              Premium Feature Locked
            </h3>
            <p className="text-sm text-forge-text-secondary mb-6 leading-relaxed">
              Unlock <span className="font-semibold text-forge-text-primary">{FEATURE_LABELS[feature]}</span> and superpowers with StudyForge Pro to supercharge your flow.
            </p>
            <UpgradePrompt feature={feature} />
          </div>
        )}
      </div>
    </div>
  );
}

export function UpgradePrompt({ feature }: { feature: GatedFeature }) {
  const label = FEATURE_LABELS[feature];

  return (
    <Link
      href="/pricing"
      className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-forge-accent px-6 text-sm font-semibold text-forge-base shadow-forge-glow transition-all duration-200 hover:scale-[1.02] hover:bg-forge-accent-bright hover:shadow-forge-glow-strong active:scale-[0.98]"
    >
      <Lock className="w-4 h-4" />
      <span>{label} — Upgrade</span>
      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
    </Link>
  );
}

// A compact inline banner shown when user is close to their AI limit
export function AIUsageBanner() {
  const { aiCallsRemaining, subscription, isPro } = useSubscriptionStore();

  if (isPro || !subscription) return null;

  const limit = subscription.aiCallsLimit;
  const used = subscription.aiCallsUsed;
  const pct = Math.round((used / limit) * 100);

  if (used === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm shadow-sm transition-all hover:bg-amber-500/15">
      <Zap className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-amber-200 font-medium tracking-tight">
            {used}/{limit} AI uses remaining
          </span>
          {aiCallsRemaining === 0 && (
            <Link href="/pricing" className="text-forge-accent hover:text-forge-accent-bright hover:underline text-xs font-semibold ml-2 shrink-0">
              Upgrade →
            </Link>
          )}
        </div>
        <div className="w-full bg-forge-base/60 h-1.5 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-forge-error shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
