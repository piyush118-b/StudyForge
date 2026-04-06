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
          <label className="text-[#F0F0F0]/70 text-sm font-medium">1. Are you a morning person or night owl?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CHRONOTYPES.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("chronotype", opt)}
                className={`cursor-pointer p-4 rounded-xl border flex items-center justify-center font-semibold text-sm transition-all duration-150-all
                  ${userData.chronotype === opt ? 'bg-[#10B981] border-[#10B981] shadow-lg shadow-indigo-500/20 text-[#F0F0F0]' : 'bg-[#1A1A1A] border-white/10 hover:border-white/30 text-slate-300'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">2. Peak Focus Window</label>
          <div className="flex flex-wrap gap-2">
            {PEAK_WINDOWS.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("peakWindow", opt)}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150-all
                  ${userData.peakWindow === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">3. Breaks Frequency</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BREAK_FREQUENCIES.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("breaksFreq", opt)}
                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-150-all
                  ${userData.breaksFreq === opt ? 'bg-[#10B981]/30 border-[#10B981] text-indigo-300' : 'bg-[#1A1A1A] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
              >
                <div className="font-semibold text-sm">{opt}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[#F0F0F0]/70 text-sm font-medium">Break Length</label>
            <div className="flex flex-wrap gap-2">
              {BREAK_LENGTHS.map(opt => (
                <div 
                  key={opt}
                  onClick={() => updateField("breakLength", opt)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-all duration-150-all
                    ${userData.breakLength === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[#F0F0F0]/70 text-sm font-medium">Study Session Length</label>
            <div className="flex flex-wrap gap-2">
              {SESSION_LENGTHS.map(opt => (
                <div 
                  key={opt}
                  onClick={() => updateField("sessionLength", opt)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-all duration-150-all
                    ${userData.sessionLength === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-[#A0A0A0] hover:text-[#F0F0F0]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="bg-white text-black hover:bg-slate-200 px-8">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
}
