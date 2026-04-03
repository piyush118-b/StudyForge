'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useGridStore } from '@/store/grid-store';
import { Sparkles, Loader2, X, AlertCircle } from 'lucide-react';
import { ProGate } from '../subscription/ProGate';
import { trackEvent } from '@/lib/lifecycle';
import { toast } from 'sonner';

interface AutoBalanceModalProps {
  onClose: () => void;
}

export function AutoBalanceModal({ onClose }: AutoBalanceModalProps) {
  const { session } = useAuth();
  const { blocks, setBlocks } = useGridStore((state) => ({
    blocks: state.blocks,
    setBlocks: (newBlocks: any) => useGridStore.setState({ blocks: newBlocks })
  }));
  const { isPro, incrementAICalls } = useSubscriptionStore();
  
  const [customRules, setCustomRules] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBalance = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const blockArray = Object.values(blocks);
      
      const res = await fetch('/api/ai/auto-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ blocks: blockArray, customRules })
      });

      if (!res.ok) {
        if (res.status === 402) throw new Error('AI limit reached! Please upgrade to Pro.');
        throw new Error('Failed to auto-balance');
      }

      const { optimizedBlocks } = await res.json();
      
      // Update blocks in store
      const newBlockRecord: Record<string, any> = {};
      optimizedBlocks.forEach((b: any) => {
        newBlockRecord[b.id] = b; 
      });

      setBlocks(newBlockRecord);
      trackEvent('ai_auto_balance_used', { numBlocks: optimizedBlocks.length });
      toast.success('Timetable optimized successfully! ✨');
      if (!isPro) incrementAICalls();
      onClose();

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="p-6">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">AI Auto-Balance</h2>
              <p className="text-slate-400 text-sm">Optimize your current schedule</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <ProGate feature="ai_generation" fallback={
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-slate-300">You need Pro or available AI credits to use Auto-Balance.</p>
              </div>
            }>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Custom Focus (Optional)</label>
                <textarea 
                  value={customRules}
                  onChange={e => setCustomRules(e.target.value)}
                  placeholder="e.g. Keep mornings for Maths, spread DSA across the week..."
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleBalance}
                  disabled={loading || Object.keys(blocks).length === 0}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</>
                  ) : (
                     <><Sparkles className="w-4 h-4" /> Run Auto-Balance</>
                  )}
                </button>
                {Object.keys(blocks).length === 0 && (
                  <p className="text-center text-xs text-slate-500 mt-2">Add some blocks to your timetable first.</p>
                )}
              </div>
            </ProGate>
          </div>
        </div>
      </div>
    </div>
  );
}
