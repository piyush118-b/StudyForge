"use client";

import { useState } from "react";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";

const HOURS_OPTIONS = [
  { label: "6 hrs", value: "6 hrs", note: "Solid! That's 42 hrs/week — enough to stay ahead." },
  { label: "7 hrs", value: "7 hrs", note: "Good momentum. Great for balancing regular lectures." },
  { label: "8 hrs 🔥 (recommended)", value: "8 hrs", note: "Great choice! This is the sweet spot for most toppers." },
  { label: "9 hrs", value: "9 hrs", note: "Intense! Make sure you are prioritizing sleep as well." },
  { label: "10+ hrs", value: "10+ hrs", note: "Ambitious! We'll add enough breaks to avoid burnout." },
  { label: "Custom", value: "Custom", note: "Let's personalize your daily goal." }
];

export function Step2Goal({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { userData, updateField } = useCreateTimetable();
  const [isCustom, setIsCustom] = useState(userData.dailyHours !== "6 hrs" && userData.dailyHours !== "7 hrs" && userData.dailyHours !== "8 hrs" && userData.dailyHours !== "9 hrs" && userData.dailyHours !== "10+ hrs");
  
  // Find note
  const currentOpt = HOURS_OPTIONS.find(h => isCustom ? h.value === "Custom" : h.value === userData.dailyHours);
  
  const isValid = Boolean(userData.dailyHours);

  return (
    <StepCard title="How much do you want to study daily? ⏱️" description="Be realistic — consistency beats cramming.">
      <div className="space-y-6 pb-6 border-b border-white/5">
        
        <div className="grid grid-cols-2 gap-3">
          {HOURS_OPTIONS.map(opt => {
            const isSelected = (!isCustom && userData.dailyHours === opt.value) || (isCustom && opt.value === "Custom");
            return (
              <div 
                key={opt.value}
                onClick={() => {
                  if (opt.value === "Custom") {
                    setIsCustom(true);
                    updateField("dailyHours", "");
                  } else {
                    setIsCustom(false);
                    updateField("dailyHours", opt.value);
                  }
                }}
                className={`cursor-pointer p-4 rounded-xl border flex items-center justify-center text-center font-semibold transition-all duration-150-all
                  ${isSelected ? 'bg-[#10B981] border-[#10B981] shadow-lg shadow-indigo-500/20 text-[#F0F0F0]' : 'bg-[#1A1A1A] border-white/10 hover:border-white/30 text-slate-300'}`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>

        {isCustom && (
          <Input 
            placeholder="E.g. 5 hours" 
            className="mt-4 bg-[#111111] border-white/20 text-[#F0F0F0] h-12 rounded-xl text-center text-lg"
            value={userData.dailyHours}
            onChange={e => updateField("dailyHours", e.target.value)}
          />
        )}

        {currentOpt && (
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/20 text-teal-300 text-sm text-center">
            💡 {currentOpt.note}
          </div>
        )}

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
