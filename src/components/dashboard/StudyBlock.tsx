"use client";

import { useState } from "react";
import { CheckCircle2, Undo2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockWithLog } from "@/types/tracking.types";
import type { EnergyLevel, SkipReason } from "@/types/tracking.types";

interface StudyBlockProps {
  block: BlockWithLog;
  mode: "compact" | "detailed";
  todayDate: string;
  onDone: (blockId: string, date: string, rating?: number, energy?: EnergyLevel) => Promise<void>;
  onPartial: (blockId: string, date: string, pct: number, hrs: number, reason?: SkipReason) => Promise<void>;
  onSkip: (blockId: string, date: string, reason: SkipReason) => Promise<void>;
  onUndo: (blockId: string, date: string) => Promise<void>;
}

// ─── Star Rating ──────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={cn(
            "text-lg transition-colors",
            value >= star ? "text-yellow-400" : "text-[#2A2A2A] hover:text-yellow-300"
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Inline Done Form ─────────────────────────────────────────
function DoneForm({
  onSave,
  onSkip,
}: {
  onSave: (rating: number, energy: EnergyLevel) => void;
  onSkip: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [energy, setEnergy] = useState<EnergyLevel>("medium");

  return (
    <div className="mt-3 p-3 border border-[#10B981]/25 bg-[rgba(16,185,129,0.05)] rounded-lg text-sm">
      <p className="text-[#10B981] font-medium mb-3">Great work! Quick reflection 👇</p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[#606060] text-xs w-16">Focus</span>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#606060] text-xs w-16">Energy</span>
        {(["high", "medium", "low"] as EnergyLevel[]).map((e) => (
          <button
            key={e}
            onClick={() => setEnergy(e)}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border capitalize transition-colors",
              energy === e
                ? "bg-[#10B981] border-[#10B981] text-[#0A0A0A] font-semibold"
                : "border-[#2A2A2A] text-[#A0A0A0] hover:border-[#333333] hover:text-[#F0F0F0]"
            )}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="h-7 px-3 text-xs rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] font-bold transition-all"
          onClick={() => onSave(rating, energy)}
        >
          Save
        </button>
        <button
          className="h-7 px-3 text-xs rounded-lg text-[#606060] hover:text-[#A0A0A0] hover:bg-[#222222] transition-all"
          onClick={onSkip}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ─── Inline Partial Form ──────────────────────────────────────
function PartialForm({
  onSave,
  onCancel,
  scheduledHours,
}: {
  onSave: (percentage: number, actualHours: number) => void;
  onCancel: () => void;
  scheduledHours: number;
}) {
  const [partialPercentage, setPartialPercentage] = useState(50);

  return (
    <div className="mt-3 p-3 border border-[#F59E0B]/25 bg-[rgba(245,158,11,0.05)] rounded-lg text-sm">
      <p className="text-[#F59E0B] font-medium mb-3">How much did you actually study? ⚡</p>

      <div className="p-3 bg-[#0A0A0A]/60 rounded-xl border border-[#2A2A2A] space-y-3 mb-3">
        <input
          type="range"
          min="0" max="100" step="25"
          value={partialPercentage}
          onChange={e => setPartialPercentage(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#2A2A2A]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#F59E0B]
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${partialPercentage}%, #2A2A2A ${partialPercentage}%, #2A2A2A 100%)`
          }}
        />
        <div className="flex justify-between text-[10px] text-[#606060] font-mono">
          <span>0%</span>
          <span>25%</span>
          <span className="text-[#F59E0B] font-bold">{partialPercentage}%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="h-7 px-3 text-xs rounded-lg bg-[#F59E0B] hover:bg-amber-400 text-[#0A0A0A] font-bold transition-all"
          onClick={() => onSave(partialPercentage, scheduledHours * (partialPercentage / 100))}
        >
          Save Partial
        </button>
        <button
          className="h-7 px-3 text-xs rounded-lg text-[#606060] hover:text-[#A0A0A0] hover:bg-[#222222] transition-all"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: BlockWithLog["status"] }) {
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.3)]">
        ✅ Done
      </span>
    );
  if (status === "partial")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]">
        ⚡ Partial
      </span>
    );
  if (status === "skipped")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-[rgba(239,68,68,0.08)] text-[#EF4444] border-[rgba(239,68,68,0.3)]">
        ⏭ Skipped
      </span>
    );
  return null;
}

// ─── Main Component ───────────────────────────────────────────
export function StudyBlock({ block, mode, todayDate, onDone, onPartial, onSkip, onUndo }: StudyBlockProps) {
  const [activeForm, setActiveForm] = useState<'none' | 'done' | 'partial'>('none');

  const isPending = block.status === "pending" && !block.isFixed;
  const isDone = block.status === "completed";

  // ── COMPACT MODE (Dashboard "Up Next") ───────────────────────
  if (mode === "compact") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
        style={{
          backgroundColor: isDone ? 'rgba(16,185,129,0.05)' : 'rgba(26,26,26,0.8)',
          borderColor: isDone ? 'rgba(16,185,129,0.2)' : '#2A2A2A',
          opacity: isDone ? 0.65 : 1,
        }}
      >
        {/* Color dot */}
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: block.color }} />
        <span className="text-xs font-mono text-[#606060] w-14 shrink-0 tabular-nums">{block.startTime}</span>

        {/* Subject */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold truncate", isDone ? "line-through text-[#606060]" : "text-[#F0F0F0]")}>
            {block.subject}
          </p>
          <p className="text-xs text-[#3A3A3A] truncate">{block.blockType} · {block.scheduledHours}h</p>
        </div>

        {/* Action / Status */}
        {isDone ? (
          <StatusBadge status="completed" />
        ) : block.status === "skipped" ? (
          <StatusBadge status="skipped" />
        ) : isPending ? (
          <button
            className="h-7 px-3 text-xs rounded-lg bg-[rgba(16,185,129,0.12)] hover:bg-[rgba(16,185,129,0.2)] text-[#10B981] border border-[#10B981]/30 shrink-0 font-semibold transition-all"
            onClick={() => onDone(block.blockId, todayDate)}
          >
            ✅ Done
          </button>
        ) : null}
      </div>
    );
  }

  // ── DETAILED MODE (Today page) ────────────────────────────────
  const statusBg =
    block.status === 'completed' ? 'rgba(16,185,129,0.08)' :
    block.status === 'partial'   ? 'rgba(245,158,11,0.08)' :
    block.status === 'skipped'   ? 'rgba(239,68,68,0.08)'  :
    block.isCurrent              ? 'rgba(59,130,246,0.06)' :
                                   'rgba(26,26,26,0.8)';
  const statusBorder =
    block.status === 'completed' ? 'rgba(16,185,129,0.25)'  :
    block.status === 'partial'   ? 'rgba(245,158,11,0.25)'  :
    block.status === 'skipped'   ? 'rgba(239,68,68,0.25)'   :
    block.isCurrent              ? 'rgba(59,130,246,0.35)'  :
                                   '#2A2A2A';

  return (
    <div
      className={cn(
        "flex w-full border rounded-xl overflow-hidden transition-all duration-200",
        block.isCurrent && "shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_0_20px_rgba(59,130,246,0.1)]",
        isDone && "opacity-75"
      )}
      style={{ backgroundColor: statusBg, borderColor: statusBorder }}
    >
      {/* Left accent bar */}
      <div
        className="w-[3px] shrink-0 self-stretch opacity-80"
        style={{ backgroundColor: block.color }}
      />

      {/* Time column */}
      <div className={cn(
        "w-28 px-3 py-3 flex flex-col items-end justify-center border-r shrink-0",
        block.isCurrent ? "bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.2)]" : "border-[#2A2A2A]"
      )}>
        <span className={cn("text-sm font-bold font-mono tabular-nums", block.isCurrent ? "text-[#3B82F6]" : "text-[#F0F0F0]")}>
          {block.startTime}
        </span>
        <span className="text-xs text-[#606060]">– {block.endTime}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm"
              style={{ backgroundColor: block.color }}
            />
            <div className="min-w-0">
              <h3 className={cn("font-semibold text-base leading-tight", isDone ? "line-through text-[#606060]" : "text-[#F0F0F0]")}>
                {block.subject}
              </h3>
              <p className="text-xs text-[#606060] mt-0.5">
                {block.blockType} · {block.scheduledHours}h
                {block.isCurrent && <span className="ml-2 text-[#3B82F6] font-medium animate-pulse">● Live</span>}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {block.status !== "pending" && <StatusBadge status={block.status} />}

            {isPending && (
              <>
                <button
                  className="h-8 px-3 text-xs rounded-lg border border-[#10B981]/40 text-[#10B981] hover:bg-[rgba(16,185,129,0.1)] font-semibold flex items-center gap-1 transition-all"
                  onClick={() => setActiveForm((v) => v === 'done' ? 'none' : 'done')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Done
                </button>
                <button
                  className="h-8 px-3 text-xs rounded-lg border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[rgba(245,158,11,0.1)] font-semibold hidden sm:flex items-center gap-1 transition-all"
                  onClick={() => setActiveForm((v) => v === 'partial' ? 'none' : 'partial')}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Partial
                </button>
              </>
            )}

            {block.status !== "pending" && (
              <button
                className="h-8 w-8 p-0 rounded-lg flex items-center justify-center text-[#606060] hover:text-[#A0A0A0] hover:bg-[#222222] transition-all"
                title="Undo"
                onClick={() => onUndo(block.blockId, todayDate)}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Inline Done Form */}
        {activeForm === 'done' && isPending && (
          <DoneForm
            onSave={(rating, energy) => {
              onDone(block.blockId, todayDate, rating, energy);
              setActiveForm('none');
            }}
            onSkip={() => setActiveForm('none')}
          />
        )}

        {/* Inline Partial Form */}
        {activeForm === 'partial' && isPending && (
          <PartialForm
            scheduledHours={block.scheduledHours}
            onSave={(percentage, actualHours) => {
              onPartial(block.blockId, todayDate, percentage, actualHours, "other");
              setActiveForm('none');
            }}
            onCancel={() => setActiveForm('none')}
          />
        )}
      </div>
    </div>
  );
}
