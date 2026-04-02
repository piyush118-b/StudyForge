"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles, Zap, Edit2 } from "lucide-react";

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
    } catch (err) {
      console.error(err);
      alert("Uh oh! Generation failed yaar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(userData.name && userData.college && userData.semester && userData.branch && userData.subjects.length > 0 && userData.dailyHours);

  return (
    <StepCard title="Here's everything we know about you 🧾" description="Review your inputs before we generate your perfect timetable.">
      <div className="space-y-6 pb-6 border-b border-white/5 text-sm">
        
        {/* Step 0 - Profile */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="absolute right-2 top-2 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 1: Profile</div>
          <div className="text-slate-300">
            <span className="font-semibold text-white">{userData.name}</span> • {userData.college} • {userData.branch} ({userData.semester})
          </div>
        </div>

        {/* Step 1 - Subjects */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(2)} className="absolute right-2 top-2 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 2: Subjects ({userData.subjects.length})</div>
          <div className="flex flex-wrap gap-2">
            {userData.subjects.map(s => (
              <Badge key={s.id} variant="secondary" className="bg-slate-800 text-slate-300">
                {s.name} - {s.priority}
              </Badge>
            ))}
          </div>
        </div>

        {/* Step 2 - Goal */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(3)} className="absolute right-2 top-2 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 3: Daily Goal</div>
          <div className="text-white font-bold text-lg">{userData.dailyHours}</div>
        </div>

        {/* Step 3 - Commitments */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(4)} className="absolute right-2 top-2 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Step 4: Fixed Commitments</div>
          <div className="flex flex-wrap gap-2">
            {userData.commitments.map(c => (
              <Badge key={c.id} variant="outline" className="border-white/10 text-slate-400">{c.type} ({c.startTime}-{c.endTime})</Badge>
            ))}
          </div>
        </div>

        {/* Steps 4,5,6 Summarized */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 relative group">
          <Button variant="ghost" size="icon" onClick={() => setStep(5)} className="absolute right-2 top-2 h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <div className="text-teal-400 font-semibold mb-2">Smart Preferences & Energy</div>
          <div className="text-slate-300 space-y-1">
            <div><span className="text-slate-500">Chronotype:</span> {userData.chronotype} (Peak: {userData.peakWindow})</div>
            <div><span className="text-slate-500">Goals:</span> {userData.mainGoals.length} selected</div>
            <div><span className="text-slate-500">Buffer:</span> {userData.bufferTime}</div>
          </div>
        </div>

      </div>

      <div className="py-2 flex justify-center">
         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.2)]">
            <Sparkles className="w-8 h-8 text-white/90" />
         </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={loading || !isFormValid}
        className="w-full h-14 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 text-white mt-4"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {loadingMsg}</>
        ) : (
          <><Zap className="w-5 h-5 mr-2" /> Generate My Perfect Timetable with AI</>
        )}
      </Button>

      <div className="mt-8 flex justify-start">
        <Button variant="ghost" onClick={onBack} disabled={loading} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    </StepCard>
  );
}
