"use client";

import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { CHRONOTYPES, PEAK_WINDOWS, BREAK_FREQUENCIES, BREAK_LENGTHS, SESSION_LENGTHS } from "@/lib/app-data";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function Step4Energy({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { userData, updateField } = useCreateTimetable();

  const isValid = Boolean(userData.chronotype && userData.peakWindow && userData.breaksFreq && userData.breakLength);

  return (
    <StepCard title="How does your brain work best? 🧠" description="We'll map heavy subjects to your peak hours.">
      <div className="space-y-6 pb-6 border-b border-white/5">
        
        <div className="space-y-3">
          <label className="text-white/70 text-sm font-medium">1. Are you a morning person or night owl?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CHRONOTYPES.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("chronotype", opt)}
                className={`cursor-pointer p-4 rounded-xl border flex items-center justify-center font-semibold text-sm transition-all
                  ${userData.chronotype === opt ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white' : 'bg-slate-800 border-white/10 hover:border-white/30 text-slate-300'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-white/70 text-sm font-medium">2. Peak Focus Window</label>
          <div className="flex flex-wrap gap-2">
            {PEAK_WINDOWS.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("peakWindow", opt)}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${userData.peakWindow === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-900 border-white/10 hover:border-white/30 text-slate-400'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-white/70 text-sm font-medium">3. Breaks Frequency</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BREAK_FREQUENCIES.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("breaksFreq", opt)}
                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all
                  ${userData.breaksFreq === opt ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-white/10 hover:border-white/30 text-slate-400'}`}
              >
                <div className="font-semibold text-sm">{opt}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-white/70 text-sm font-medium">Break Length</label>
            <div className="flex flex-wrap gap-2">
              {BREAK_LENGTHS.map(opt => (
                <div 
                  key={opt}
                  onClick={() => updateField("breakLength", opt)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-all
                    ${userData.breakLength === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-900 border-white/10 hover:border-white/30 text-slate-400'}`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-white/70 text-sm font-medium">Study Session Length</label>
            <div className="flex flex-wrap gap-2">
              {SESSION_LENGTHS.map(opt => (
                <div 
                  key={opt}
                  onClick={() => updateField("sessionLength", opt)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-all
                    ${userData.sessionLength === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-900 border-white/10 hover:border-white/30 text-slate-400'}`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="bg-white text-black hover:bg-slate-200 px-8">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
}
