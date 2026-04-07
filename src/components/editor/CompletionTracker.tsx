"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGridStore } from "@/store/grid-store";
import { useAnalyticsStore } from "@/store/analytics-store";
import { X } from "lucide-react";
import { getLocalDateStr } from "@/lib/time-utils";
import { calculateHours } from "@/lib/analytics-utils";


const REASON_CHIPS = [
  { icon: '😴', label: 'Too tired' },
  { icon: '🚨', label: 'Something came up' },
  { icon: '🤯', label: "Didn't understand the topic" },
  { icon: '📱', label: 'Got distracted' },
  { icon: '🏥', label: 'Not feeling well' },
  { icon: '📅', label: 'Plan changed' },
  { icon: '✏️', label: 'Write my own reason...' }
];

export function CompletionTrackerModal() {
  const { blocks, updateBlock, isSkipModalOpen, skipModalBlockId, closeSkipModal } = useGridStore();
  const { queueEvent, syncEvents } = useAnalyticsStore();
  const block = skipModalBlockId ? blocks[skipModalBlockId] : null;

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [partialPercentage, setPartialPercentage] = useState<number>(50);

  if (!isSkipModalOpen || !block) {
    if (isSkipModalOpen) closeSkipModal();
    return null;
  }

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason("");
    setPartialPercentage(50);
    closeSkipModal();
  };

  const handleSkip = () => {
    const finalReason = selectedReason === 'Write my own reason...' ? customReason : selectedReason;

    // Status resolution based on partial efforts
    let status: 'skipped' | 'partial' = 'skipped';
    let partialHours = 0;

    const maxSubjectHours = calculateHours(block.startTime, block.endTime);
    if (partialPercentage > 0 && partialPercentage < 100) {
      status = 'partial';
      partialHours = (partialPercentage / 100) * maxSubjectHours;
    } else if (partialPercentage === 100) {
      // Should be handled natively by ✅ complete button, but resolve just in case
      updateBlock(block.id, { status: 'completed', completedAt: new Date().toISOString() });

      const timetableId = useGridStore.getState().id;
      if (timetableId && timetableId !== 'draft') {
        const today = getLocalDateStr();
        fetch('/api/block-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockId: block.id,
            timetableId: timetableId,
            subject: block.subject,
            blockType: block.subjectType,
            dayOfWeek: block.day,
            scheduledDate: today,
            scheduledStart: block.startTime,
            scheduledEnd: block.endTime,
            scheduledHours: maxSubjectHours,
            status: 'completed',
            actualHours: maxSubjectHours,
            partialPercentage: 100,
            markedAt: new Date().toISOString()
          })
        }).catch(console.error);
      }

      queueEvent({
        blockId: block.id,
        timetableId: 'draft',
        userId: 'local-demo',
        date: getLocalDateStr(),
        dayOfWeek: block.day,
        subject: block.subject,
        subjectType: block.subjectType ?? '',
        scheduledStart: block.startTime,
        scheduledEnd: block.endTime,
        scheduledHours: maxSubjectHours,
        status: 'completed',
        actualHours: maxSubjectHours,
        completedAt: new Date().toISOString()
      });
      syncEvents();
      handleClose();
      return;

    }

    updateBlock(block.id, {
      status,
      skippedAt: new Date().toISOString(),
      skipReason: finalReason,
      partialHours: status === 'partial' ? partialHours : null,
      completionPercentage: status === 'partial' ? partialPercentage : null
    });

    const timetableId = useGridStore.getState().id;
    if (timetableId && timetableId !== 'draft') {
      const today = getLocalDateStr();
      fetch('/api/block-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId: block.id,
          timetableId: timetableId,
          subject: block.subject,
          blockType: block.subjectType,
          dayOfWeek: block.day,
          scheduledDate: today,
          scheduledStart: block.startTime,
          scheduledEnd: block.endTime,
          scheduledHours: maxSubjectHours,
          status,
          actualHours: partialHours,
          partialPercentage: partialPercentage,
          skipReason: finalReason,
          markedAt: new Date().toISOString()
        })
      }).catch(console.error);
    }

    queueEvent({
      blockId: block.id,
      timetableId: 'draft',
      userId: 'local-demo',
      date: getLocalDateStr(),
      dayOfWeek: block.day,
      subject: block.subject,
      subjectType: block.subjectType ?? '',
      scheduledStart: block.startTime,
      scheduledEnd: block.endTime,
      scheduledHours: maxSubjectHours,
      status,
      actualHours: partialHours,
      skipReason: finalReason,
      skippedAt: new Date().toISOString()
    });

    syncEvents();
    handleClose();
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[320px] bg-[#111111] border border-[#2A2A2A]/50 rounded-2xl shadow-2xl relative overflow-hidden font-sans">

        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]/50">
          <h3 className="font-bold text-slate-100 text-[15px] tracking-tight">Why are you skipping this? 😅</h3>
          <button onClick={handleClose} className="text-[#A0A0A0] hover:text-[#F0F0F0] transition-all duration-150-colors active:scale-[0.97]">

            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-col">
          <div className="flex flex-wrap gap-2">
            {REASON_CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => setSelectedReason(chip.label)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all duration-150-colors border
                  ${selectedReason === chip.label
                    ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }
                `}
              >
                <span className="text-[13px]">{chip.icon}</span>
                {chip.label}
              </button>
            ))}
          </div>

          {selectedReason === 'Write my own reason...' && (
            <input
              autoFocus
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50"
              placeholder="Be honest with yourself..."
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
            />
          )}

          <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider block">How much did you actually study?</label>
              <span className="text-[13px] font-bold text-orange-400">{partialPercentage}%</span>
            </div>
            <input
              type="range"
              min="0" max="100" step="25"
              value={partialPercentage}
              onChange={e => setPartialPercentage(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${partialPercentage}%, #334155 ${partialPercentage}%, #334155 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-[#606060] font-mono">
              <span>0%</span>
              <span>25%</span>
              <span className={partialPercentage === 50 ? 'text-orange-400 font-bold' : ''}>50%</span>
              <span className={partialPercentage === 75 ? 'text-orange-400 font-bold' : ''}>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#1A1A1A]/30 border-t border-white/5 flex gap-3">
          <Button variant="ghost" onClick={handleClose} className="flex-1 text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-white/5 h-9 text-xs">
            Cancel
          </Button>
          <Button onClick={handleSkip} className="flex-1 bg-orange-600 hover:bg-orange-500 text-[#F0F0F0] shadow-lg shadow-orange-900/20 font-bold h-9 text-xs border border-orange-500/20">
            {partialPercentage === 0 ? 'Mark Skipped' : 'Mark Partial'}
          </Button>
        </div>

      </div>
    </div>
  );
}
