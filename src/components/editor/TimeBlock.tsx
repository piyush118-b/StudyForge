"use client";

import { useGridStore } from "@/store/grid-store";
import { TimeBlock } from "@/lib/grid-engine";
import { GripHorizontal, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { useState, useRef, MouseEvent as ReactMouseEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { pixelToTime, snapTime, timeToPixel, to12HourShort, timeDiffMinutes } from "@/lib/time-utils";
import { getDateForDayOfWeek, calculateHours, recalculateDailySummary } from "@/lib/analytics-utils";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface TimeBlockComponentProps {
  block: TimeBlock;
  x: number;
  y: number; // passed relative essentially but actually absolute bounds
  w: number;
  h: number;
}

export function TimeBlockComponent({ block, x, w, h }: TimeBlockComponentProps) {
  const {
    updateBlock,
    openBlockModal,
    openSkipModal,
    deleteBlock,
    gridStartTime,
    pxPerHour,
    currentSnapInterval,
    zoom,
    activeTool,
    contextMenu,
    setContextMenu
  } = useGridStore();

  const { user } = useAuth();

  const [isResizingTop, setIsResizingTop] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

  // Transient drag math bounds overriding render statically dynamically
  const [previewY, setPreviewY] = useState<number | null>(null);
  const [previewH, setPreviewH] = useState<number | null>(null);

  // Use a ref to track absolute transient value securely inside event listener closures
  const activeDragRef = useRef<{ y: number | null, h: number | null }>({ y: null, h: null });

  const displayY = previewY !== null ? previewY : 0;
  const displayHeight = previewH !== null ? previewH : h;

  const isCompleted = block.status === 'completed';
  const isSkipped = block.status === 'skipped';
  const isPartial = block.status === 'partial';
  const isSmallBlock = displayHeight < 50;

  // --- Hover Portal Mechanics ---
  const blockRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  // Sync: Hide popover if a context menu is opened anywhere
  useEffect(() => {
    if (contextMenu) {
       setShowPopover(false);
    }
  }, [contextMenu]);

  const handleMouseEnter = () => {
    if (activeTool === 'pan' || isResizingTop || isResizingBottom || contextMenu) return;
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const CARD_W = 272;
      const CARD_H = 240;
      // Prefer right; fall back to left if card would be clipped
      const spaceRight = window.innerWidth - rect.right;
      const left = spaceRight >= CARD_W + 20
        ? rect.right + 12
        : rect.left - CARD_W - 12;
      // Clamp top so card never goes below viewport bottom
      const top = Math.min(Math.max(16, rect.top), window.innerHeight - CARD_H - 16);
      setPopoverCoords({ top, left });
    }
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    // 400ms gives enough time to move mouse from block to popover
    hideTimeout.current = setTimeout(() => {
      setShowPopover(false);
    }, 400);
  };

  // --- TOP Resize Mechanics (Feature 9) ---
  const handleTopResizeStart = (e: ReactMouseEvent) => {
    if (activeTool === 'pan') return;

    e.stopPropagation();
    e.preventDefault();
    setIsResizingTop(true);

    const startCursorY = e.clientY;
    const baseH = h;
    const baseY = timeToPixel(block.startTime, gridStartTime, pxPerHour); // absolute bounds

    // Initial display mapping
    setPreviewY(0);
    setPreviewH(baseH);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = (moveEvent.clientY - startCursorY) / zoom;
      const newY = Math.max(-baseY, deltaY); // Don't drag above grid zero

      const rawStartTime = pixelToTime(baseY + newY, gridStartTime, pxPerHour);
      const snappedStartTime = currentSnapInterval ? snapTime(rawStartTime, currentSnapInterval) : rawStartTime;
      const finalYDiff = timeToPixel(snappedStartTime, gridStartTime, pxPerHour) - baseY;

      const finalH = baseH - finalYDiff;
      if (finalH >= (15 / 60) * pxPerHour) {
        setPreviewY(finalYDiff);
        setPreviewH(finalH);
        activeDragRef.current.y = finalYDiff;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      setIsResizingTop(false);

      const prevY = activeDragRef.current.y;
      if (prevY !== null && prevY !== 0) {
        const newRawTime = pixelToTime(baseY + prevY, gridStartTime, pxPerHour);
        const newSnapped = currentSnapInterval ? snapTime(newRawTime, currentSnapInterval) : newRawTime;
        updateBlock(block.id, { startTime: newSnapped });
      }

      setPreviewY(null);
      setPreviewH(null);
      activeDragRef.current = { y: null, h: null };
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // --- BOTTOM Resize Mechanics ---
  const handleBottomResizeStart = (e: ReactMouseEvent) => {
    if (activeTool === 'pan') return;

    e.stopPropagation();
    e.preventDefault();
    setIsResizingBottom(true);

    const startCursorY = e.clientY;
    const baseH = h;
    const baseY = timeToPixel(block.startTime, gridStartTime, pxPerHour);

    setPreviewH(baseH);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = (moveEvent.clientY - startCursorY) / zoom;
      const rawEndY = baseY + baseH + deltaY;

      const rawEndTime = pixelToTime(rawEndY, gridStartTime, pxPerHour);
      const snappedEndTime = currentSnapInterval ? snapTime(rawEndTime, currentSnapInterval) : rawEndTime;
      const newEndY = timeToPixel(snappedEndTime, gridStartTime, pxPerHour);

      const finalH = newEndY - baseY;
      if (finalH >= (15 / 60) * pxPerHour) {
        setPreviewH(finalH);
        activeDragRef.current.h = finalH;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      setIsResizingBottom(false);
      const prevH = activeDragRef.current.h;

      if (prevH !== null && prevH !== baseH) {
        const rawTime = pixelToTime(baseY + prevH, gridStartTime, pxPerHour);
        const snappedTime = currentSnapInterval ? snapTime(rawTime, currentSnapInterval) : rawTime;
        updateBlock(block.id, { endTime: snappedTime });
      }

      setPreviewH(null);
      activeDragRef.current = { y: null, h: null };
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleToggleComplete = async (e: ReactMouseEvent) => {
    if (activeTool === 'pan' || !user) return;

    e.stopPropagation();
    const newStatus: 'completed' | 'pending' = isCompleted ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    // 1. Optimistic Update in Grid Store (for the canvas)
    updateBlock(block.id, {
      status: newStatus,
      completedAt: completedAt
    });

    const timetableId = useGridStore.getState().id;
    if (!timetableId || timetableId === 'draft') return;

    try {
      // 2. Calculate the correct historical date for this block
      // If it's a "Monday" block, find the date of the most recent Monday
      const scheduledDate = getDateForDayOfWeek(block.day ?? '');
      const scheduledHours = calculateHours(block.startTime, block.endTime);

      // Ensure day_of_week is never null — derive from scheduledDate if block.day is missing
      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek: string = block.day ?? DAYS[new Date(scheduledDate + 'T12:00:00').getDay()];

      // 3. Sync with Block logs (Upsert)
      const { error: logError } = await (supabase
        .from('block_logs')
        .upsert({
          user_id: user.id,
          block_id: block.id,
          timetable_id: timetableId,
          subject: block.subject,
          block_type: (block.subjectType || 'Lecture'),
          day_of_week: dayOfWeek,
          scheduled_date: scheduledDate,
          scheduled_start: block.startTime,
          scheduled_end: block.endTime,
          scheduled_hours: scheduledHours,
          status: newStatus,
          actual_hours: newStatus === 'completed' ? scheduledHours : 0,
          partial_percentage: newStatus === 'completed' ? 100 : 0,
          marked_at: completedAt
        } as unknown as any, {
          onConflict: 'user_id,block_id,scheduled_date'
        }) as any);

      if (logError) throw logError;

      // 4. Update daily_summaries (Recalculate)
      await recalculateDailySummary(user.id, timetableId, scheduledDate);

      // 5. Update study_sessions for streak/total tracking
      if (newStatus === 'completed') {
        const { data: existingSession } = await (supabase
          .from('study_sessions')
          .select('id, hours_studied, subjects_covered')
          .eq('user_id', user.id)
          .eq('date', scheduledDate)
          .single() as any);

        if (existingSession) {
          const updatedSubjects = Array.from(new Set([...((existingSession as any).subjects_covered || []), block.subject]));
          await ((supabase as any)
            .from('study_sessions')
            .update({
              hours_studied: ((existingSession as any).hours_studied || 0) + scheduledHours,
              subjects_covered: updatedSubjects
            })
            .eq('id', (existingSession as any).id));
        } else {
          await (supabase
            .from('study_sessions')
            .insert({
              user_id: user.id,
              timetable_id: timetableId,
              date: scheduledDate,
              hours_studied: scheduledHours,
              subjects_covered: [block.subject]
            } as any) as any);
        }
      }

      toast.success(newStatus === 'completed' ? `✅ ${block.subject} marked done!` : `Restored ${block.subject}`);
    } catch (err) {
      console.error('Failed to sync block status:', err);
      toast.error('Sync failed. Please check connection.');
      // Revert optimistic update
      updateBlock(block.id, {
        status: isCompleted ? 'completed' : 'pending',
        completedAt: block.completedAt
      });
    }
  };

  const handleContextMenu = (e: ReactMouseEvent) => {
    // Hide popover immediately on right click to avoid overlap with menu
    setShowPopover(false);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    
    // Bubble up to TimetableGridEditor contextual listener!
    // We don't call preventDefault here because TimetableGridEditor needs to catch it
  };

  // Preview time calculations for tooltips
  const previewStartTimeStr = previewY !== null ?
    snapTime(pixelToTime(timeToPixel(block.startTime, gridStartTime, pxPerHour) + previewY, gridStartTime, pxPerHour), currentSnapInterval) : block.startTime;

  const previewEndTimeStr = previewH !== null ?
    snapTime(pixelToTime(timeToPixel(block.startTime, gridStartTime, pxPerHour) + (previewY !== null ? previewY : 0) + previewH, gridStartTime, pxPerHour), currentSnapInterval) : block.endTime;

  return (
    <>
    <div
      ref={blockRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ left: 2, top: displayY + 2, width: w - 4, height: displayHeight - 4, backgroundColor: block.color, color: block.textColor ?? undefined, '--block-shadow-color': `${block.color}40` } as React.CSSProperties}
      onClick={(e) => {
        if (activeTool === 'pan') return; // let it bubble up to pan handlers if applicable, or just ignore
        e.stopPropagation();
        openBlockModal(block.day, block.startTime, block.endTime, block.id);
      }}
      // Use pointer-events-none conditionally to let Pan grab the wrapper underneath
      className={`absolute transition-colors duration-150 flex flex-col group rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/5
        ${activeTool === 'pan' ? 'cursor-inherit' : 'cursor-pointer pointer-events-auto hover:border-white/15 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]'}
        ${isCompleted ? 'brightness-[0.85] ring-1 ring-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.2)]' : ''}
        ${isSkipped ? 'grayscale-[0.6] opacity-50 border-orange-500/20' : ''}
        ${isPartial ? 'ring-1 ring-yellow-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : ''}
        ${isResizingTop || isResizingBottom ? 'z-50 pointer-events-none' : 'z-20 hover:z-[60]'}
      `}
      onContextMenu={handleContextMenu}
      data-block-id={block.id}
    >

      {/* Partial Completion — clean left-edge vertical fill bar */}
      {isPartial && (
        <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl overflow-hidden pointer-events-none z-10">
          {/* Track */}
          <div className="absolute inset-0 bg-black/20" />
          {/* Fill — grows from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-500"
            style={{
              height: `${block.completionPercentage ?? 0}%`,
              background: 'linear-gradient(to top, #f59e0b, #fbbf24)'
            }}
          />
        </div>
      )}

      {/* Completed Watermark */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden mix-blend-overlay opacity-30">
          <CheckCircle2 className="w-24 h-24 absolute -right-6 -bottom-6 text-emerald-500" strokeWidth={3} />
        </div>
      )}


      {/* 0. Top Resize Handler */}
      <div
        className="absolute top-0 left-2 right-2 h-[6px] cursor-n-resize hover:bg-white/40 rounded-b-xl transition-all duration-150-colors z-30 pointer-events-auto"
        onMouseDown={handleTopResizeStart}
      />

      {/* Feature 7: Inline Top Time Pill (Visible during resize or hover) */}
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-forge-elevated text-forge-text-primary border border-forge-border text-[10px] font-bold px-2 py-0.5 rounded shadow-forge-md opacity-0 transition-all duration-150-opacity ${isResizingTop || isResizingBottom || 'group-hover:opacity-100'}`}>
        {to12HourShort(previewStartTimeStr)}
      </div>

      {/* 1. Drag Handle (Hover state) */}
      <div className="w-full h-3 cursor-grab opacity-0 hover:opacity-100 transition-all duration-150-opacity bg-black/10 flex items-center justify-center shrink-0 pointer-events-auto" title="Click to edit">
        <GripHorizontal className="w-3 h-3 mix-blend-overlay pointer-events-none" />
      </div>

      {/* 2. Content Matrix */}
      <div className={`flex-1 px-3 pb-1.5 flex flex-col min-h-0 relative pointer-events-none overflow-hidden mt-0 ${isSmallBlock ? 'justify-center' : ''}`}>
        <div className="flex justify-between items-start gap-1">
          <div className="font-bold text-[14px] tracking-tight leading-snug truncate drop-shadow-md flex items-center gap-2">
            {block.sticker}
            <span>{block.subject}</span>
          </div>
          {isCompleted && <div className="shrink-0 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-lg"><CheckCircle2 className="w-3.5 h-3.5" /></div>}
          {isSkipped && <div className="shrink-0 bg-orange-600/90 text-[#F0F0F0] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-lg"><ChevronRight className="w-3.5 h-3.5" /></div>}
        </div>

        {!isSmallBlock && (
          <div className="flex items-center justify-between mt-2">
            <div className="text-[10px] font-bold opacity-100 uppercase tracking-widest truncate bg-black/20 px-2.5 py-1 rounded shadow-inner">
              {block.subjectType}
            </div>
            {block.priority && (
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${block.priority === "High" ? 'bg-red-400 text-red-400' : block.priority === "Medium" ? 'bg-orange-400 text-orange-400' : 'bg-emerald-400 text-emerald-400'}`} />
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Action Strip */}
      <div className={`h-8 w-full border-t border-black/10 bg-black/20 shrink-0 flex items-center justify-between px-3 backdrop-blur-md pointer-events-auto rounded-b-2xl transition-all duration-200
        ${isSmallBlock ? 'absolute bottom-0 left-0 right-0 z-30 opacity-0 group-hover:opacity-100 border-t-0 bg-black/40' : 'relative opacity-100'}
      `}>
        <div className="flex items-center gap-1.5">
          <button onClick={handleToggleComplete} className={`p-0.5 rounded-full transition-all duration-150-colors ${isCompleted ? 'bg-green-500 text-white' : 'text-white/60 hover:bg-white/20 hover:text-white'}`} title="Mark Completed">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openSkipModal(block.id); }} className={`p-0.5 rounded-full transition-all duration-150-colors ${isSkipped ? 'bg-orange-500 text-[#F0F0F0]' : 'text-[#F0F0F0]/60 hover:bg-white/20 hover:text-[#F0F0F0]'}`} title="Skip Event">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {block.notes && <FileText className="w-3.5 h-3.5 text-[#F0F0F0]/50" />}
      </div>

      {/* 5. Bottom Resize Handler */}
      <div
        className="absolute bottom-0 left-2 right-2 h-[6px] cursor-s-resize hover:bg-white/40 rounded-t-xl transition-all duration-150-colors z-30 pointer-events-auto"
        onMouseDown={handleBottomResizeStart}
      />

      {/* Feature 7: Inline Bottom Time Pill */}
      <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-forge-elevated text-forge-text-primary border border-forge-border text-[10px] font-bold px-2 py-0.5 rounded shadow-forge-md opacity-0 transition-all duration-150-opacity ${isResizingTop || isResizingBottom || 'group-hover:opacity-100'}`}>
        {to12HourShort(previewEndTimeStr)}
      </div>

      {/* Ghost dashed rendering when resizing heavily */}
      {(isResizingTop || isResizingBottom) && (
        <div className="absolute inset-0 border-2 border-dashed border-white/50 pointer-events-none rounded-lg" />
      )}
    </div>

    {isMounted && showPopover && createPortal(
      <div
        className="fixed bg-[#111111] border border-[#222222] rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] p-4 z-[9999] w-[264px] animate-in fade-in zoom-in-95 duration-150"
        style={{ top: popoverCoords.top, left: popoverCoords.left }}
        onMouseEnter={() => { if (hideTimeout.current) clearTimeout(hideTimeout.current); setShowPopover(true); }}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header: time + duration */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: block.color, boxShadow: `0 0 6px ${block.color}` }} />
          <span className="text-[10px] font-bold text-[#606060] uppercase tracking-wider">
            {to12HourShort(block.startTime)} – {to12HourShort(block.endTime)} · {calculateHours(block.startTime, block.endTime)}h
          </span>
        </div>

        {/* Subject name */}
        <div className="font-bold text-[#F0F0F0] text-[15px] leading-tight mb-2.5">
          {block.sticker && <span className="mr-1.5 text-base inline-block align-bottom">{block.sticker}</span>}
          {block.subject}
        </div>

        {/* Badges: type + priority */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="text-[10px] bg-[#1E1E1E] border border-[#2A2A2A] text-[#A0A0A0] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
            {block.subjectType}
          </span>
          {block.priority && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold border ${
              block.priority === 'High'   ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              block.priority === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                           'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>{block.priority}</span>
          )}
        </div>

        {/* Completion status row */}
        <div className="border-t border-[#1E1E1E] pt-3">
          {isCompleted && (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Done
                </span>
                <span className="text-[10px] text-[#606060]">Complete</span>
              </div>
              <div className="h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
              </div>
            </>
          )}
          {isPartial && (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-yellow-400">⚡ {block.completionPercentage ?? 0}% Done</span>
                <span className="text-[10px] text-[#606060]">Partial</span>
              </div>
              <div className="h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${block.completionPercentage ?? 0}%`, background: 'linear-gradient(to right, #f59e0b, #fbbf24)' }}
                />
              </div>
            </>
          )}
          {isSkipped && (
            <span className="text-[11px] font-semibold text-orange-400">⏭ Skipped</span>
          )}
          {!isCompleted && !isPartial && !isSkipped && (
            <span className="text-[11px] text-[#505050] font-medium">○ Not started</span>
          )}
        </div>

        {/* Notes */}
        {block.notes && (
          <div className="mt-3 text-xs text-[#606060] pt-3 border-t border-[#1E1E1E] line-clamp-3 leading-relaxed">
            {block.notes}
          </div>
        )}
      </div>,
      document.body
    )}
    </>
  );
}
