"use client";

import { useState } from "react";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FixedCommitment } from "@/lib/types";
import { COMMITMENT_TYPES } from "@/lib/app-data";
import { ArrowLeft, ArrowRight, X, ChevronDown, ChevronUp, Clock, Plus } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Step3Commitments({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { userData, updateField } = useCreateTimetable();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addCommitment = (type: string) => {
    const newComm: FixedCommitment = {
      id: crypto.randomUUID(),
      type,
      name: "",
      days: [],
      startTime: "18:00",
      endTime: "19:00",
    };
    updateField("commitments", [...userData.commitments, newComm]);
    setExpandedId(newComm.id);
  };

  const updateComm = (id: string, updates: Partial<FixedCommitment>) => {
    updateField("commitments", userData.commitments.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeComm = (id: string) => {
    updateField("commitments", userData.commitments.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleDay = (id: string, day: string) => {
    const comm = userData.commitments.find(c => c.id === id);
    if (!comm) return;
    const newDays = comm.days.includes(day)
      ? comm.days.filter(d => d !== day)
      : [...comm.days, day];
    updateComm(id, { days: newDays });
  };

  // Ensure Sleep exists
  const hasSleep = userData.commitments.some(c => c.type === "Sleep");

  return (
    <StepCard title="Block out your fixed time first 🔒" description="These are the things that happen regardless — we'll plan around them.">
      <div className="space-y-6 pb-6 border-b border-white/5">
        
        {/* Chips for adding new commitments */}
        <div className="flex flex-wrap gap-2">
          {COMMITMENT_TYPES.filter(type => type !== "Sleep" || !hasSleep).map(type => (
            <Badge 
              key={type} 
              variant="outline" 
              className="cursor-pointer border-white/20 text-slate-300 hover:bg-slate-800 py-1.5 px-3"
              onClick={() => addCommitment(type)}
            >
              + {type}
            </Badge>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          {userData.commitments.map((comm) => (
            <div key={comm.id} className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50"
                onClick={() => setExpandedId(expandedId === comm.id ? null : comm.id)}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <div>
                    <span className="font-semibold text-white">{comm.type}</span>
                    {comm.name && <span className="ml-2 text-sm text-slate-400">({comm.name})</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {comm.type !== "Sleep" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); removeComm(comm.id); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  {expandedId === comm.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expandedId === comm.id && (
                <div className="p-4 pt-0 border-t border-white/5 space-y-4 bg-slate-900/50">
                  
                  {['Tuition / Coaching', 'Part-time Job', 'Club / Extracurricular', 'Other'].includes(comm.type) && (
                    <Input 
                      placeholder="Description / Name (Optional)" 
                      className="bg-slate-950 border-white/10 text-white mt-4"
                      value={comm.name}
                      onChange={e => updateComm(comm.id, { name: e.target.value })}
                    />
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {DAYS.map(d => (
                      <Badge
                        key={d}
                        variant="outline"
                        onClick={() => toggleDay(comm.id, d)}
                        className={`cursor-pointer px-3 py-1 border transition-all ${comm.days.includes(d) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-white/10 text-slate-400'}`}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-white/60 text-xs uppercase">Start Time</span>
                      <Input 
                        type="time"
                        className="bg-slate-950 border-white/10 text-white block w-full"
                        value={comm.startTime}
                        onChange={e => updateComm(comm.id, { startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-white/60 text-xs uppercase">End Time</span>
                      <Input 
                        type="time"
                        className="bg-slate-950 border-white/10 text-white block w-full"
                        value={comm.endTime}
                        onChange={e => updateComm(comm.id, { endTime: e.target.value })}
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
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
