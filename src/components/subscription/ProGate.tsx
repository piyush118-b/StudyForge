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
  if (fallback) return <>{fallback}</>;

  return <UpgradePrompt feature={feature} />;
}

export function UpgradePrompt({ feature }: { feature: GatedFeature }) {
  const label = FEATURE_LABELS[feature];

  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-sm font-medium"
    >
      <Lock className="w-3.5 h-3.5" />
      <span>{label} — Upgrade to Pro</span>
      <Zap className="w-3.5 h-3.5 text-yellow-400" />
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
    <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-amber-200 font-medium">
            {used}/{limit} AI generations used this month
          </span>
          {aiCallsRemaining === 0 && (
            <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold ml-2 shrink-0">
              Upgrade →
            </Link>
          )}
        </div>
        <div className="w-full bg-amber-900/30 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-amber-400'}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
