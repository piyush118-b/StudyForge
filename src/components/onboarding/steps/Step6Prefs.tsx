"use client";

import { useState } from "react";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LEARNING_STYLES, REVISION_FREQUENCIES, TIMETABLE_FORMATS } from "@/lib/app-data";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export function Step6Prefs({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { userData, updateField } = useCreateTimetable();
  const [customPref, setCustomPref] = useState("");

  const toggleLearningStyle = (s: string) => {
    const newStyles = userData.learningStyles.includes(s)
      ? userData.learningStyles.filter(x => x !== s)
      : [...userData.learningStyles, s];
    updateField("learningStyles", newStyles);
  };

  const toggleCulturalPref = (c: string) => {
    const newPrefs = userData.culturalPrefs.includes(c)
      ? userData.culturalPrefs.filter(x => x !== c)
      : [...userData.culturalPrefs, c];
    updateField("culturalPrefs", newPrefs);
  };

  const PRESET_CULTURAL = [
    "Include Namaz / prayer times in schedule", "Keep evenings free for family time", 
    "No study on Sundays", "Roza / fasting — adjust meal + energy schedule", 
    "I prefer Hindi-medium resources", "Include morning spiritual routine"
  ];

  return (
    <StepCard title="A few more things to make it perfect ✨" description="Optional smart tweaks to fully personalize your generated timetable.">
      <div className="space-y-6 pb-6 border-b border-white/5">
        
        {/* Q1: Learning Style */}
        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">1. Learning Style (Select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {LEARNING_STYLES.map(s => (
              <Badge 
                key={s} 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 border transition-all duration-150-all ${userData.learningStyles.includes(s) ? 'bg-[#10B981] border-[#10B981] text-[#F0F0F0]' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
                onClick={() => toggleLearningStyle(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Q2: Revision Blocks */}
        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">2. Spaced Repetition / Revision Blocks</label>
          <div className="grid grid-cols-2 gap-2">
            {REVISION_FREQUENCIES.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("revisionPref", opt)}
                className={`cursor-pointer p-3 rounded-xl border flex items-center justify-center text-center font-medium text-sm transition-all duration-150-all
                  ${userData.revisionPref === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
              >
                {opt}
              </div>
            ))}
            <div 
              onClick={() => updateField("revisionPref", "None")}
              className={`cursor-pointer p-3 rounded-xl border flex items-center justify-center text-center font-medium text-sm transition-all duration-150-all
                ${userData.revisionPref === "None" ? 'bg-slate-700/50 border-[#2A2A2A] text-slate-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
            >
              No, I&apos;ll handle revision
            </div>
          </div>
        </div>

        {/* Q3: Pomodoro */}
        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">3. Pomodoro-style Study Blocks</label>
          <div className="flex flex-wrap gap-2">
            {["Classic (25/5)", "Extended (50/10)", "None", "Let AI decide"].map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("pomodoroPref", opt)}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150-all
                  ${userData.pomodoroPref === opt ? 'bg-[#10B981]/30 border-[#10B981] text-indigo-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* Q4: Cultural Prefs */}
        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">4. Cultural / Personal Preferences</label>
          <div className="flex flex-wrap gap-2 w-full">
            {userData.culturalPrefs.filter(c => !PRESET_CULTURAL.includes(c)).map(c => (
              <Badge key={c} variant="secondary" className="px-3 py-1.5 bg-[#1A1A1A] text-teal-300 border border-teal-500/30 flex items-center gap-2 text-xs">
                {c} <X className="w-3 h-3 cursor-pointer hover:text-[#F0F0F0]" onClick={() => toggleCulturalPref(c)} />
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_CULTURAL.map(c => (
              <Badge 
                key={c} 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 border transition-all duration-150-all ${userData.culturalPrefs.includes(c) ? 'bg-teal-950/50 border-teal-500/50 text-teal-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
                onClick={() => toggleCulturalPref(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Include travel buffer for Friday prayer"
              className="bg-[#111111] border-white/20 text-[#F0F0F0]"
              value={customPref} onChange={e => setCustomPref(e.target.value)}
              onKeyDown={e => {
                if(e.key === 'Enter' && customPref) {
                  toggleCulturalPref(customPref); setCustomPref("");
                }
              }}
            />
            <Button onClick={() => { if (customPref) { toggleCulturalPref(customPref); setCustomPref(""); } }} className="bg-[#1A1A1A] hover:bg-slate-700">Add</Button>
          </div>
        </div>

        {/* Q5: Buffer Time */}
        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">5. Buffer Time (Highly Recommended)</label>
          <div className="flex flex-wrap gap-2">
            {["15 min", "30 min", "45 min", "60 min", "None"].map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("bufferTime", opt)}
                className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150-all
                  ${userData.bufferTime === opt ? 'bg-[#10B981]/30 border-[#10B981] text-indigo-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* Q6: Format */}
        <div className="space-y-3">
          <label className="text-[#F0F0F0]/70 text-sm font-medium">6. Timetable Display Preference</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIMETABLE_FORMATS.map(opt => (
              <div 
                key={opt}
                onClick={() => updateField("displayFormat", opt)}
                className={`cursor-pointer p-3 rounded-xl border flex items-center justify-center text-center font-medium text-xs transition-all duration-150-all
                  ${userData.displayFormat === opt ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#111111] border-white/10 hover:border-white/30 text-[#A0A0A0]'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-[#A0A0A0] hover:text-[#F0F0F0]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} className="bg-white text-black hover:bg-slate-200 px-8">
          Review <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
}
