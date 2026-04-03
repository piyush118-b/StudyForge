'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { ProGate } from '../subscription/ProGate';

export function WeeklyAIInsights({ weeklyStats }: { weeklyStats: any }) {
  const { session } = useAuth();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isPro, incrementAICalls } = useSubscriptionStore();

  const generateInsight = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ weeklyStats })
      });
      if (!res.ok) throw new Error('Failed to generate insight');
      const data = await res.json();
      setInsight(data.insight);
      if (!isPro) incrementAICalls();
    } catch (err) {
      console.error(err);
      setInsight("Failed to generate insight. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-generate if active session and haven't yet
    if (session && !insight && !loading) {
      if (isPro) generateInsight(); // Auto-generate ONLY if PRO (to save free quota)
    }
  }, [session, isPro]);

  return (
    <ProGate feature="advanced_analytics" fallback={
      <div className="text-xs text-blue-200/50 leading-tight">
        <Sparkles className="w-3 h-3 inline mr-1 text-blue-400" />
        Upgrade to Pro to get deep AI analysis of your study habits and schedule balancing.
      </div>
    }>
      <div className="relative group">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-blue-300 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating AI insights...
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
              {insight || "No insight generated yet."}
            </p>
            {insight && (
              <button 
                onClick={generateInsight}
                className="text-[10px] uppercase tracking-wider text-blue-400/50 hover:text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Regenerate
              </button>
            )}
            {!insight && !loading && (
              <button 
                onClick={generateInsight}
                className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                Generate Insight
              </button>
            )}
          </div>
        )}
      </div>
    </ProGate>
  );
}
