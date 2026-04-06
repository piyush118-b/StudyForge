"use client";

import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, ChevronRight } from 'lucide-react';
import { useTaskStore } from '@/store/task-store';

export function SmartSuggestions() {
  const { tasks } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setExpanded(true);
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
    } catch {
      setInsights(["We couldn't reach the AI at the moment. Please try again!"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 to-slate-900/0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Gemini Insights
        </h2>
        {insights.length > 0 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#606060] hover:text-[#10B981] transition-all duration-150-colors flex items-center"
          >
            {expanded ? "Hide" : "Show"} <ChevronRight className={`w-3 h-3 transition-all duration-150-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {!expanded && insights.length === 0 && (
        <button
          onClick={fetchInsights}
          className="w-full py-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] rounded-lg text-xs font-medium transition-all duration-150-all hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 active:scale-[0.97]"
        >
          Generate Study Plan
        </button>
      )}

      {expanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-4 text-[#10B981]/60">
              <Loader2 className="w-5 h-5 animate-spin mb-2" />
              <span className="text-xs">Analyzing workload...</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-2.5 bg-[#111111]/60 p-3 rounded-xl border border-shadow-sm border-[#2A2A2A]/50 hover:border-[#10B981]/20 transition-all duration-150-colors">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
              <div className="pt-2 flex justify-end">
                 <button onClick={fetchInsights} className="text-[10px] text-[#606060] hover:text-[#10B981] transition-all duration-150-colors underline-offset-2 hover:underline tracking-wide active:scale-[0.97]">
                   Refresh Insights
                 </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
