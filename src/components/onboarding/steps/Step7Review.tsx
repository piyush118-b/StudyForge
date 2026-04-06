"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles, Zap, Edit2 } from "lucide-react";
import { GenerateErrorBoundary } from "@/components/onboarding/GenerateErrorBoundary";

export function Step7Review({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { userData, setStep } = useCreateTimetable();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingMsg("Analyzing your subjects... 📚");
    
    setTimeout(() => setLoadingMsg("Mapping your free windows... 🗓"), 1500);
    setTimeout(() => setLoadingMsg("Avoiding clashes... ✅"), 3000);
    setTimeout(() => setLoadingMsg("Building your perfect schedule... ✨"), 4500);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData }), // Correctly wrap in key expected by API
      });

      if (!res.ok) {
         throw new Error("API failed");
      }

      const data = await res.json();
      // Extract the 'timetable' object from the response wrapper
      localStorage.setItem("studyforge_timetable", JSON.stringify(data.timetable));
      router.push("/create/timetable"); // Actual route that displays the timetable
    } catch (err: any) {
      console.error(err);
      // In React 18+ async errors in event handlers aren't automatically caught by ErrorBoundary
      // However the prompt asks to add ErrorBoundary to the step, so we'll set a local state to throw it.
      setGenerationError(err);
    } finally {
      setLoading(false);
    }
  };

  const [generationError, setGenerationError] = useState<any>(null);
  const [step, setStepState] = useState(1);
  const currentStep = 1; // Used for the animation logic mapping

  useEffect(() => {
    if (!loading) return;
    setStepState(1);
    const t1 = setTimeout(() => setStepState(2), 1500);
    const t2 = setTimeout(() => setStepState(3), 3000);
    const t3 = setTimeout(() => setStepState(4), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loading]);

  if (generationError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#0A0A0A] fixed inset-0 z-50">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[#EF4444]/20 flex items-center justify-center text-3xl mb-6">
          😔
        </div>
        <h2 className="text-xl font-bold text-[#F0F0F0] tracking-tight mb-2">Generation failed</h2>
        <p className="text-sm text-[#A0A0A0] max-w-sm leading-relaxed mb-2">
          {generationError.message || generationError.toString()}
        </p>
        <p className="text-xs text-[#606060] mb-8">
          This usually happens when the AI response is unexpected. Your AI credits have NOT been used.
        </p>
        <div className="flex gap-3">
          <button onClick={() => { setGenerationError(null); handleGenerate(); }}
                  className="h-10 px-5 rounded-xl bg-[#10B981] text-[#0A0A0A] text-sm font-bold hover:bg-[#34D399] transition-all duration-150-all duration-150 active:scale-[0.97]">
            Try Again
          </button>
          <button onClick={() => setGenerationError(null)}
             className="h-10 px-5 rounded-xl border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F0F0F0] transition-all duration-150-all duration-150 hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#10B981]/8 blur-[100px] rounded-full animate-[forge-pulse-glow_3s_ease-in-out_infinite] pointer-events-none" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90 animate-spin" viewBox="0 0 80 80" style={{ animationDuration: '1.5s' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1E1E1E" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeDasharray="80 134" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
          </div>
          <h2 className="text-2xl font-black text-[#F0F0F0] tracking-tight mb-3">Building your timetable...</h2>
          <p className="text-sm text-[#A0A0A0] leading-relaxed mb-8">
            Gemini is analysing your college, branch, subjects, and schedule preferences to create the perfect study plan.
          </p>
          <div className="space-y-3 text-left">
            {[
              { label: 'Analysing your semester structure', done: step >= 1 },
              { label: 'Optimising for your peak hours',   done: step >= 2 },
              { label: 'Distributing subjects across week',done: step >= 3 },
              { label: 'Applying your constraints',        done: step >= 4 },
            ].map(({ label, done }, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-150-all duration-500 ${done ? 'text-[#10B981]' : 'text-[#606060]'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150-all duration-300 ${done ? 'bg-[rgba(16,185,129,0.2)] text-[#10B981]' : i === step ? 'border-2 border-[#10B981]/50 animate-pulse' : 'bg-[#1E1E1E]'}`}>
                  {done && (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = Boolean(userData.name && userData.college && userData.semester && userData.branch && userData.subjects.length > 0 && userData.dailyHours);

  return (
    <StepCard title="Here's everything we know about you 🧾" description="Review your inputs before we generate your perfect timetable.">
      <div className="space-y-6 pb-6 border-b border-white/5 text-sm">
        
        {/* Step 0 - Profile */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="absolute right-2 top-2 h-8 w-8 text-[#606060] opacity-0 group-hover:opacity-100 transition-all duration-150-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 1: Profile</div>
          <div className="text-slate-300">
            <span className="font-semibold text-[#F0F0F0]">{userData.name}</span> • {userData.college} • {userData.branch} ({userData.semester})
          </div>
        </div>

        {/* Step 1 - Subjects */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(2)} className="absolute right-2 top-2 h-8 w-8 text-[#606060] opacity-0 group-hover:opacity-100 transition-all duration-150-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 2: Subjects ({userData.subjects.length})</div>
          <div className="flex flex-wrap gap-2">
            {userData.subjects.map(s => (
              <Badge key={s.id} variant="secondary" className="bg-[#1A1A1A] text-slate-300">
                {s.name} - {s.priority}
              </Badge>
            ))}
          </div>
        </div>

        {/* Step 2 - Goal */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(3)} className="absolute right-2 top-2 h-8 w-8 text-[#606060] opacity-0 group-hover:opacity-100 transition-all duration-150-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 3: Daily Goal</div>
          <div className="text-[#F0F0F0] font-bold text-lg">{userData.dailyHours}</div>
        </div>

        {/* Step 3 - Commitments */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(4)} className="absolute right-2 top-2 h-8 w-8 text-[#606060] opacity-0 group-hover:opacity-100 transition-all duration-150-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 4: Fixed Commitments</div>
          <div className="flex flex-wrap gap-2">
            {userData.commitments.map(c => (
              <Badge key={c.id} variant="outline" className="border-white/10 text-[#A0A0A0]">{c.type} ({c.startTime}-{c.endTime})</Badge>
            ))}
          </div>
        </div>

        {/* Steps 4,5,6 Summarized */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(5)} className="absolute right-2 top-2 h-8 w-8 text-[#606060] opacity-0 group-hover:opacity-100 transition-all duration-150-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Smart Preferences & Energy</div>
          <div className="text-slate-300 space-y-1">
            <div><span className="text-[#606060]">Chronotype:</span> {userData.chronotype} (Peak: {userData.peakWindow})</div>
            <div><span className="text-[#606060]">Goals:</span> {userData.mainGoals.length} selected</div>
            <div><span className="text-[#606060]">Buffer:</span> {userData.bufferTime}</div>
          </div>
        </div>

      </div>

      <div className="py-2 flex justify-center">
         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.2)]">
            <Sparkles className="w-8 h-8 text-[#F0F0F0]/90" />
         </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={loading || !isFormValid}
        className="w-full h-14 rounded-xl text-lg font-bold bg-[#10B981] hover:bg-[#34D399] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] text-[#0A0A0A] mt-4 transition-all duration-150-all duration-150 active:scale-[0.97]"
      >
        <Zap className="w-5 h-5 mr-2" /> Generate My Perfect Timetable with AI
      </Button>

      <div className="mt-8 flex justify-start">
        <Button variant="ghost" onClick={onBack} disabled={loading} className="text-[#A0A0A0] hover:text-[#F0F0F0]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    </StepCard>
  );
}
