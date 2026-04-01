"use client";

import { useState, useMemo } from "react";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Subject } from "@/lib/types";
import { DEFAULT_SUBJECTS, mapBranchToCategory, SUBJECT_TYPES } from "@/lib/app-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, ArrowRight, ArrowLeft, Plus, ChevronDown, ChevronUp } from "lucide-react";

export function Step1Subjects({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { userData, updateField } = useCreateTimetable();
  const [customSubject, setCustomSubject] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const suggestedSubjects = useMemo(() => {
    const category = mapBranchToCategory(userData.branch);
    return DEFAULT_SUBJECTS[category] || [];
  }, [userData.branch]);

  const addSubject = (name: string) => {
    if (userData.subjects.some(s => s.name === name)) return;
    const newSub: Subject = {
      id: crypto.randomUUID(),
      name,
      duration: "4 hours", // legacy
      lectureHours: 3,
      selfStudyHours: 4,
      priority: "Medium",
      type: ["Lecture"]
    };
    updateField("subjects", [...userData.subjects, newSub]);
    setExpandedId(newSub.id);
  };

  const removeSubject = (id: string) => {
    updateField("subjects", userData.subjects.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateSub = (id: string, updates: Partial<Subject>) => {
    updateField("subjects", userData.subjects.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const toggleSubType = (id: string, type: string) => {
    const sub = userData.subjects.find(s => s.id === id);
    if (!sub) return;
    const newTypes = sub.type.includes(type) 
      ? sub.type.filter(t => t !== type)
      : [...sub.type, type];
    updateSub(id, { type: newTypes });
  };

  const availableSuggestions = suggestedSubjects.filter(s => !userData.subjects.some(us => us.name === s)).slice(0, 10);

  return (
    <StepCard title="What are you studying? 📚" description="Add all your subjects so we can plan around them smartly.">
      <div className="space-y-6 pb-6 border-b border-white/5">
        
        {/* Suggestions */}
        <div className="space-y-3">
          <Label className="text-white/70">Suggested for {userData.branch || "your stream"}</Label>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map(sub => (
              <Badge 
                key={sub} 
                variant="outline" 
                className="cursor-pointer border-white/20 text-slate-300 hover:bg-slate-800 py-1.5 px-3"
                onClick={() => addSubject(sub)}
              >
                + {sub}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Subject Adder */}
        <div className="flex gap-2 relative">
          <Input 
            placeholder="Type your own subject..." 
            className="bg-slate-900 border-white/20 text-white rounded-xl h-12 w-full"
            value={customSubject}
            onChange={e => setCustomSubject(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && customSubject.trim()) {
                addSubject(customSubject.trim());
                setCustomSubject("");
              }
            }}
          />
          <Button 
            onClick={() => {
              if (customSubject.trim()) {
                addSubject(customSubject.trim());
                setCustomSubject("");
              }
            }} 
            className="h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
          >
            Add
          </Button>
        </div>

        {/* Selected Subjects List */}
        {userData.subjects.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Label className="text-white">Your Subjects ({userData.subjects.length})</Label>
            {userData.subjects.map((sub) => (
              <div key={sub.id} className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50"
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-teal-300">{sub.name}</span>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                      {sub.priority === 'High' ? '🔥 High' : sub.priority === 'Medium' ? '⚡ Med' : '🌱 Low'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); removeSubject(sub.id); }}>
                      <X className="w-4 h-4" />
                    </Button>
                    {expandedId === sub.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {expandedId === sub.id && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-5 bg-slate-900/50">
                    
                    {/* Priority */}
                    <div className="space-y-2 mt-4">
                      <Label className="text-white/60 text-xs uppercase tracking-wider">Priority / Difficulty</Label>
                      <div className="flex gap-2">
                        {['High', 'Medium', 'Low'].map((p) => (
                          <div
                            key={p}
                            onClick={() => updateSub(sub.id, { priority: p as Subject["priority"] })}
                            className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${sub.priority === p ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/30'}`}
                          >
                            {p === 'High' ? '🔥 High' : p === 'Medium' ? '⚡ Medium' : '🌱 Low'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/60 text-xs uppercase tracking-wider">Lecture Hrs/Wk</Label>
                        <Input 
                          type="number" min={0}
                          className="bg-slate-950 border-white/10 text-white"
                          value={sub.lectureHours}
                          onChange={e => updateSub(sub.id, { lectureHours: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60 text-xs uppercase tracking-wider">Self-Study Hrs/Wk</Label>
                        <Input 
                          type="number" min={0}
                          className="bg-slate-950 border-white/10 text-white"
                          value={sub.selfStudyHours}
                          onChange={e => updateSub(sub.id, { selfStudyHours: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs uppercase tracking-wider">Subject Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {SUBJECT_TYPES.map(t => (
                          <Badge
                            key={t}
                            variant="outline"
                            onClick={() => toggleSubType(sub.id, t)}
                            className={`cursor-pointer px-3 py-1 border transition-all ${sub.type.includes(t) ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/30'}`}
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} disabled={userData.subjects.length === 0} className="bg-white text-black hover:bg-slate-200 px-8">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
}
