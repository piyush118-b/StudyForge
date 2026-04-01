"use client";

import { useState } from "react";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { GOAL_OPTIONS } from "@/lib/app-data";
import { Deadline } from "@/lib/types";
import { ArrowLeft, ArrowRight, Calendar, Plus, X } from "lucide-react";

export function Step5Goals({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { userData, updateField } = useCreateTimetable();
  const [customGoal, setCustomGoal] = useState("");
  const [customConstraint, setCustomConstraint] = useState("");

  const toggleGoal = (g: string) => {
    const newGoals = userData.mainGoals.includes(g)
      ? userData.mainGoals.filter(x => x !== g)
      : [...userData.mainGoals, g];
    updateField("mainGoals", newGoals);
  };

  const toggleConstraint = (c: string) => {
    const newRules = userData.hardConstraints.includes(c)
      ? userData.hardConstraints.filter(x => x !== c)
      : [...userData.hardConstraints, c];
    updateField("hardConstraints", newRules);
  };

  const addDeadline = () => {
    const newDl: Deadline = {
      id: crypto.randomUUID(),
      type: "Exam",
      subject: userData.subjects[0]?.name || "",
      date: "",
      notes: ""
    };
    updateField("deadlines", [...userData.deadlines, newDl]);
  };

  const updateDeadline = (id: string, updates: Partial<Deadline>) => {
    updateField("deadlines", userData.deadlines.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const removeDeadline = (id: string) => {
    updateField("deadlines", userData.deadlines.filter(d => d.id !== id));
  };

  const PRESET_CONSTRAINTS = [
    "No study after 10:30 PM", "No two heavy subjects back-to-back", "Strict 1 hr lunch break at 1 PM",
    "Always start day with easiest subject", "Never schedule lab + theory on same evening", 
    "No phone during study blocks (focus mode)", "Don't schedule anything within 30 min of sleep", 
    "Keep one full revision day before every exam"
  ];

  return (
    <StepCard title="What do you want to achieve? 🎯" description="Set targets and let the AI map out the path to hit them.">
      <div className="space-y-8 pb-6 border-b border-white/5">
        
        {/* Q1: Goals */}
        <div className="space-y-3">
          <label className="text-white/70 text-sm font-medium">1. Main Goals (Select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map(g => (
              <Badge 
                key={g} 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 border transition-all ${userData.mainGoals.includes(g) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-white/10 hover:border-white/30 text-slate-400'}`}
                onClick={() => toggleGoal(g)}
              >
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Custom goal..." 
              className="bg-slate-900 border-white/20 text-white"
              value={customGoal} onChange={e => setCustomGoal(e.target.value)}
              onKeyDown={e => {
                if(e.key === 'Enter' && customGoal) {
                  toggleGoal(customGoal); setCustomGoal("");
                }
              }}
            />
            <Button onClick={() => { if (customGoal) { toggleGoal(customGoal); setCustomGoal(""); } }} className="bg-slate-800 hover:bg-slate-700">Add</Button>
          </div>
        </div>

        {/* Q2: Deadlines */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="text-white/70 text-sm font-medium flex justify-between items-center">
            2. Upcoming Deadlines
            <Button variant="ghost" size="sm" onClick={addDeadline} className="h-6 text-teal-400 hover:text-teal-300">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </label>
          {userData.deadlines.length === 0 && (
            <div className="text-sm text-slate-500 italic">No upcoming deadlines added.</div>
          )}
          <div className="space-y-3">
            {userData.deadlines.map(dl => (
              <div key={dl.id} className="bg-slate-900 p-3 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <Select value={dl.type} onValueChange={v => updateDeadline(dl.id, { type: v || "" })}>
                    <SelectTrigger className="w-32 bg-slate-950 border-white/10 h-8 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white">
                      {["Exam", "Assignment", "Project", "Viva", "Lab Record", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  <Select value={dl.subject} onValueChange={v => updateDeadline(dl.id, { subject: v || "" })}>
                    <SelectTrigger className="flex-1 bg-slate-950 border-white/10 h-8 text-xs text-white">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white">
                      {userData.subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400" onClick={() => removeDeadline(dl.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <div className="relative w-40">
                    <Calendar className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="date"
                      className="bg-slate-950 border-white/10 text-white h-8 text-xs pl-8"
                      value={dl.date} onChange={e => updateDeadline(dl.id, { date: e.target.value })}
                    />
                  </div>
                  <Input 
                    placeholder="Notes..." 
                    className="flex-1 bg-slate-950 border-white/10 text-white h-8 text-xs"
                    value={dl.notes} onChange={e => updateDeadline(dl.id, { notes: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Q4: Day Prefs */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="text-white/70 text-sm font-medium">3. Day-specific Overrides</label>
          <div className="text-xs text-slate-400 mb-2">Keep a day light, heavy, or take it entirely off!</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
              const pref = userData.heavyLightDays[day] || "Normal";
              return (
                <div key={day} className="flex flex-col bg-slate-900 p-2 rounded-lg border border-white/10">
                  <span className="text-xs font-semibold text-white/50 mb-1">{day}</span>
                  <Select value={pref} onValueChange={v => updateField("heavyLightDays", {...userData.heavyLightDays, [day]: v || ""})}>
                    <SelectTrigger className="w-full bg-slate-950 border-white/5 h-7 text-[10px] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20 text-white text-xs">
                      {["Normal", "Light Day", "Heavy Day", "Off (No Study)"].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        </div>

        {/* Q5: Constraints */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="text-white/70 text-sm font-medium">4. Hard Constraints / Study Rules</label>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2 w-full">
              {userData.hardConstraints.filter(c => !PRESET_CONSTRAINTS.includes(c)).map(c => (
                <Badge key={c} variant="secondary" className="px-3 py-1.5 bg-red-950/40 text-red-300 border border-red-500/30 flex items-center gap-2 text-xs">
                  {c} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => toggleConstraint(c)} />
                </Badge>
              ))}
            </div>
            {PRESET_CONSTRAINTS.map(c => (
              <Badge 
                key={c} 
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 border transition-all ${userData.hardConstraints.includes(c) ? 'bg-red-950/50 border-red-500/50 text-red-300' : 'bg-slate-900 border-white/10 hover:border-white/30 text-slate-400'}`}
                onClick={() => toggleConstraint(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Always do math first..." 
              className="bg-slate-900 border-white/20 text-white"
              value={customConstraint} onChange={e => setCustomConstraint(e.target.value)}
              onKeyDown={e => {
                if(e.key === 'Enter' && customConstraint) {
                  toggleConstraint(customConstraint); setCustomConstraint("");
                }
              }}
            />
            <Button onClick={() => { if (customConstraint) { toggleConstraint(customConstraint); setCustomConstraint(""); } }} className="bg-slate-800 hover:bg-slate-700">Add Rule</Button>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} className="bg-white text-black hover:bg-slate-200 px-8">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
}
