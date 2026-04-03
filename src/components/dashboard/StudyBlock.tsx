"use client";

import { useState } from "react";
import { CheckCircle2, Undo2, SkipForward, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
            value >= star ? "text-yellow-400" : "text-slate-700 hover:text-yellow-300"
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
    <div className="mt-3 p-3 border border-emerald-500/25 bg-emerald-500/5 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <p className="text-emerald-400 font-medium mb-3">Great work! Quick reflection 👇</p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-slate-400 text-xs w-16">Focus</span>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-400 text-xs w-16">Energy</span>
        {(["high", "medium", "low"] as EnergyLevel[]).map((e) => (
          <button
            key={e}
            onClick={() => setEnergy(e)}
            className={cn(
              "text-xs px-2 py-0.5 rounded-full border capitalize transition-colors",
              energy === e
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "border-slate-700 text-slate-400 hover:border-slate-600"
            )}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => onSave(rating, energy)}>
          Save
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: BlockWithLog["status"] }) {
  if (status === "completed")
    return <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20 text-[10px]">✅ Done</Badge>;
  if (status === "partial")
    return <Badge className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/15 border-amber-500/20 text-[10px]">⚡ Partial</Badge>;
  if (status === "skipped")
    return <Badge className="bg-slate-800 text-slate-400 hover:bg-slate-800 border-slate-700 text-[10px]">⏭ Skipped</Badge>;
  return null;
}

// ─── Main Component ───────────────────────────────────────────
export function StudyBlock({ block, mode, todayDate, onDone, onPartial, onSkip, onUndo }: StudyBlockProps) {
  const [showDoneForm, setShowDoneForm] = useState(false);

  const isPending = block.status === "pending" && !block.isFixed;
  const isDone = block.status === "completed";

  // ── COMPACT MODE (Dashboard "Up Next") ───────────────────────
  if (mode === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200",
          isDone
            ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
            : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
        )}
      >
        {/* Color dot + time */}
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: block.color }} />
        <span className="text-xs font-mono text-slate-500 w-14 shrink-0">{block.startTime}</span>

        {/* Subject */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold truncate", isDone ? "line-through text-slate-500" : "text-white")}>
            {block.subject}
          </p>
          <p className="text-xs text-slate-600 truncate">{block.blockType} · {block.scheduledHours}h</p>
        </div>

        {/* Action / Status */}
        {isDone ? (
          <StatusBadge status="completed" />
        ) : block.status === "skipped" ? (
          <StatusBadge status="skipped" />
        ) : isPending ? (
          <Button
            size="sm"
            className="h-7 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 shrink-0"
            onClick={() => onDone(block.blockId, todayDate)}
          >
            ✅ Done
          </Button>
        ) : null}
      </div>
    );
  }

  // ── DETAILED MODE (Today page) ────────────────────────────────
  return (
    <div
      className={cn(
        "flex w-full border rounded-xl overflow-hidden transition-all duration-200",
        block.isCurrent
          ? "border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5 scale-[1.005]"
          : "border-slate-800/60 bg-slate-900/40",
        isDone && "opacity-75"
      )}
    >
      {/* Left accent bar */}
      <div
        className="w-1 shrink-0 self-stretch opacity-70"
        style={{ backgroundColor: block.color }}
      />

      {/* Time column */}
      <div className={cn("w-28 px-3 py-3 flex flex-col items-end justify-center border-r border-slate-800/60 shrink-0", block.isCurrent && "bg-indigo-500/5")}>
        <span className={cn("text-sm font-bold font-mono", block.isCurrent ? "text-indigo-300" : "text-slate-300")}>
          {block.startTime}
        </span>
        <span className="text-xs text-slate-600">– {block.endTime}</span>
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
              <h3 className={cn("font-semibold text-base leading-tight", isDone ? "line-through text-slate-500" : "text-white")}>
                {block.subject}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {block.blockType} · {block.scheduledHours}h
                {block.isCurrent && <span className="ml-2 text-indigo-400 font-medium animate-pulse">● Live</span>}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {block.status !== "pending" && <StatusBadge status={block.status} />}

            {isPending && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => setShowDoneForm((v) => !v)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Done
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hidden sm:flex"
                  onClick={() => onPartial(block.blockId, todayDate, 50, block.scheduledHours * 0.5)}
                >
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  Partial
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-slate-500 hover:text-slate-300 hidden sm:flex"
                  onClick={() => onSkip(block.blockId, todayDate, "other")}
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {block.status !== "pending" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-400"
                title="Undo"
                onClick={() => onUndo(block.blockId, todayDate)}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Inline Done Form */}
        {showDoneForm && isPending && (
          <DoneForm
            onSave={(rating, energy) => {
              onDone(block.blockId, todayDate, rating, energy);
              setShowDoneForm(false);
            }}
            onSkip={() => setShowDoneForm(false)}
          />
        )}
      </div>
    </div>
  );
}
