"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGridStore } from "@/store/grid-store";
import { CanvasWrapper } from "./CanvasWrapper";
import { TimetableGrid } from "./TimetableGrid";
import { BlockFormModal } from "./BlockFormModal";
import { CompletionTrackerModal } from "./CompletionTracker";
import { MousePointer2, Hand, Bot, Sparkles, Settings } from "lucide-react";
import { AIChatPanel } from "../chat/AIChatPanel";
import { AutoBalanceModal } from "../chat/AutoBalanceModal";
import { GridSettingsModal } from "./GridSettingsModal";
import { trackEvent } from "@/lib/lifecycle";

import { DayColumn } from "@/lib/grid-engine";

interface TimetableGridEditorProps {
  timetableId?: string
  initialData?: any
  mode?: 'editor' | 'dashboard'
  onBlockSelect?: (blockId: string | null) => void
  className?: string
}

export function TimetableGridEditor({ timetableId, initialData, mode = 'editor', onBlockSelect, className }: TimetableGridEditorProps) {
  const { 
    initGrid, dayColumns, blocks, gridStartTime, gridEndTime, currentSnapInterval, setSnapInterval, 
    deleteBlock, openBlockModal, openSkipModal, shiftBlock, duplicateBlock, activeTool, setActiveTool, 
    contextMenu, setContextMenu, isBlockModalOpen, isSkipModalOpen, isDuplicateModalOpen, isDeleteModalOpen,
    duplicateModalBlockId, deleteModalBlockId, openDuplicateModal, closeDuplicateModal, openDeleteModal, closeDeleteModal 
  } = useGridStore();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBlocksRef = useRef(blocks);
  const isFirstLoadRef = useRef(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track latest blocks for closures
  useEffect(() => {
    latestBlocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    const cols: DayColumn[] = [
      { id: 'Monday', label: 'Monday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'Tuesday', label: 'Tuesday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'Wednesday', label: 'Wednesday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'Thursday', label: 'Thursday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'Friday', label: 'Friday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'Saturday', label: 'Saturday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'Sunday', label: 'Sunday', isCustom: false, isHidden: false, widthPx: 160 },
    ];

    // ── Extract saved bounds BEFORE calling initGrid so they aren't overwritten ──
    const rawData = initialData?.grid_data as any;
    const savedMeta = rawData?._metadata_;
    const savedStart: string = savedMeta?.gridStartTime || '07:00';
    const savedEnd: string   = savedMeta?.gridEndTime   || '23:00';

    // Initialize with saved bounds (not hardcoded defaults)
    // Prevents destructive reset if same timetable is re-loading (e.g. on focus)
    const currentIdInStore = useGridStore.getState().id;
    if (currentIdInStore !== (timetableId || 'draft')) {
      initGrid(timetableId || 'draft', cols, savedStart, savedEnd);
    }

    const handleGridData = (rawGridData: any) => {
      if (!rawGridData) return;
      const data = { ...rawGridData };
      const meta = data._metadata_;
      delete data._metadata_;

      // Apply metadata bounds (needed for the async fallback fetch path)
      if (meta?.gridStartTime && meta?.gridEndTime) {
        useGridStore.setState({ gridStartTime: meta.gridStartTime, gridEndTime: meta.gridEndTime });
      }

      if (Object.keys(data).length > 0) {
        useGridStore.setState({ blocks: data, past: [], future: [] });
      }
    };

    if (initialData?.grid_data) {
      handleGridData(initialData.grid_data);
    } else if (timetableId && timetableId !== 'draft') {
      // Fallback fetch if initialData for some reason isn't passed
      import('@/lib/supabase').then(async ({ supabase }) => {
        try {
          const { data } = await supabase.from('timetables').select('grid_data').eq('id', timetableId).single();
          const row = data as any;
          if (row && row.grid_data) {
            handleGridData(row.grid_data);
          }
        } catch (err) {
          console.error('Fallback fetch failed', err);
        }
      });
    } else {
      // New draft: check if empty
      if (Object.keys(useGridStore.getState().blocks).length === 0) {
        useGridStore.getState().addBlock({
          day: 'Monday',
          startTime: '08:00',
          endTime: '10:00',
          subject: "Introduction to Advanced Algorithms",
          subjectType: "Lecture",
          priority: "High",
          color: "#4f46e5",
          textColor: "#ffffff",
          notes: "Read chapter 4 before class."
        });
      }
    }
  }, [initGrid, timetableId, initialData]);

  const saveToSupabase = useCallback(async () => {
    if (!timetableId || timetableId === 'draft') return;

    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSaveStatus('saving');
    try {
      const currentBlocks = latestBlocksRef.current;
      const res = await fetch(`/api/timetables/${timetableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          grid_data: {
            ...currentBlocks,
            _metadata_: { gridStartTime: useGridStore.getState().gridStartTime, gridEndTime: useGridStore.getState().gridEndTime }
          },
          total_blocks: Object.keys(currentBlocks).length
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Save API Error:', errText, res.status, res.statusText);
        throw new Error(`Save failed: ${res.status} ${errText}`);
      }

      trackEvent('timetable_saved', { blockCount: Object.keys(currentBlocks).length });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error('Auto-save failed', e);
      setSaveStatus('error');
    }
  }, [timetableId]);

  // Auto-save: debounce 5s instead of 2s
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }
    if (!timetableId || timetableId === 'draft') return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(saveToSupabase, 1000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [blocks, timetableId, saveToSupabase]);

  // Also save when grid bounds change (Apply Bounds in GridSettingsModal)
  const isFirstBoundsRef = useRef(true);
  useEffect(() => {
    if (isFirstBoundsRef.current) {
      isFirstBoundsRef.current = false;
      return;
    }
    if (!timetableId || timetableId === 'draft') return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(saveToSupabase, 800);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [gridStartTime, gridEndTime, timetableId, saveToSupabase]);

  // Save on unmount
  useEffect(() => {
    return () => {
      // If dirty and unmounting, we should ideally save. 
      // Note: fetch on unmount is unreliable unless using keepalive or navigator.sendBeacon
    };
  }, []);

  // Global Context Listener override & Keyboard shortcuts
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);

    // Feature: Keyboard shortcuts for tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        saveToSupabase();
        return;
      }

      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('pan');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Open modal with some default dummy times for the user to customize
        openBlockModal('Monday', '08:00', '10:00');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible again. 
        // We can do a silent refresh here if needed, but NOT a full initGrid.
        console.log("Welcome back! Viewport preserved.");
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (dayColumns.length === 0) return null; // loading state essentially

  return (
    <div className="w-full h-screen bg-[#202124] flex flex-col overflow-hidden text-slate-100">

      <div
        className="flex flex-1 overflow-hidden pointer-events-auto relative"
        onContextMenu={(e) => {
          // If any modal is open, let the default behavior or modal handle it (ignore grid context menu)
          if (isBlockModalOpen || isSkipModalOpen || isDuplicateModalOpen || isDeleteModalOpen) {
            return; 
          }

          // Identify if we right clicked a block natively looking recursively
          const blockEl = (e.target as HTMLElement).closest('[data-block-id]');
          if (blockEl) {
            e.preventDefault();
            e.stopPropagation();
            const blockId = blockEl.getAttribute('data-block-id')!;
            setContextMenu({ x: e.clientX, y: e.clientY, blockId });
          } else {
            setContextMenu(null);
          }
        }}
      >
        <CanvasWrapper>
          <TimetableGrid />
        </CanvasWrapper>
      </div>

      {/* Floating Top Left Brand Nav (Phase 2) */}
      <div className="absolute top-4 left-4 z-[100] pointer-events-auto flex gap-3 items-center">
        <div className="bg-[#292A2D]/90 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <h1 className="font-bold text-[15px] text-[#E8EAED] tracking-wide flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
            StudyForge
          </h1>
        </div>
        {/* Auto-save status */}
        {saveStatus === 'saving' && (
          <div className="bg-[#292A2D]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[12px] text-[#9AA0A6]">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Saving...
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="bg-[#292A2D]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[12px] text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Saved ✓
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-full px-4 py-2 flex items-center gap-2 text-[12px] text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Save Failed
          </div>
        )}
      </div>

      {mode !== 'dashboard' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <div className="bg-[#292A2D]/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 border-r border-[#E8EAED]/10 pr-6">
              <label className="text-[11px] font-bold text-[#9AA0A6] uppercase tracking-wider">Snap</label>
              <select
                className="bg-transparent text-[#E8EAED] font-bold focus:outline-none appearance-none cursor-pointer text-sm tracking-wide"
                value={currentSnapInterval}
                onChange={(e) => setSnapInterval(parseInt(e.target.value) as any)}
              >
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
              </select>
            </div>

            <div className="border-r border-[#E8EAED]/10 pr-6">
              <button
                onClick={() => setIsBalanceOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-[#10B981] hover:text-indigo-300 transition-all duration-150-colors"
              >
                <Sparkles className="w-4 h-4" /> Auto-Balance
              </button>
            </div>

            <div className="text-[#9AA0A6] font-medium text-[12px] flex items-center gap-5 tracking-wide">
              <span className="flex items-center gap-1.5"><kbd className="bg-black/20 rounded-md px-2 py-0.5 font-sans font-semibold text-[#E8EAED] border border-white/5 shadow-inner">Space</kbd> + Drag to Pan</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-black/20 rounded-md px-2 py-0.5 font-sans font-semibold text-[#E8EAED] border border-white/5 shadow-inner">Ctrl</kbd> + Scroll to Zoom</span>
              <span className="flex items-center gap-1.5 ml-2 pl-6 border-l border-white/10"><kbd className="bg-[#10B981]/20 text-indigo-300 rounded-md px-2 py-0.5 font-sans font-semibold border border-[#10B981]/20 shadow-inner">⌘/Ctrl + P</kbd> Timer</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] pointer-events-auto flex flex-col gap-2 bg-[#292A2D]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setActiveTool('select')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150-all ${activeTool === 'select' ? 'bg-[#E8EAED] text-black shadow-md scale-105' : 'text-[#9AA0A6] hover:bg-white/10 hover:text-[#F0F0F0]'}`}
          >
            <MousePointer2 className={`w-5 h-5 ${activeTool === 'select' ? 'fill-black' : ''}`} />
          </button>

          {/* Tooltip */}
          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-[#1A1B24] border border-white/10 rounded-lg text-[13px] font-medium tracking-wide text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-150-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-xl">
            Select - V
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1B24] border-r border-t border-white/10" />
          </div>
        </div>

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setActiveTool('pan')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150-all ${activeTool === 'pan' ? 'bg-[#E8EAED] text-black shadow-md scale-105' : 'text-[#9AA0A6] hover:bg-white/10 hover:text-[#F0F0F0]'}`}
          >
            <Hand className={`w-5 h-5 ${activeTool === 'pan' ? 'fill-black/20' : ''}`} />
          </button>

          {/* Tooltip */}
          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-[#1A1B24] border border-white/10 rounded-lg text-[13px] font-medium tracking-wide text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-150-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-xl">
            Pan - H
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1B24] border-r border-t border-white/10" />
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-1" />

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150-all ${isChatOpen ? 'bg-[#10B981]/20 text-[#10B981] shadow-md scale-105 border border-[#10B981]/30' : 'text-[#10B981]/80 hover:bg-[#10B981]/10 hover:text-indigo-300'}`}
          >
            <Bot className={`w-5 h-5 ${isChatOpen ? 'fill-indigo-500/20' : ''}`} />
          </button>

          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-[#1A1B24] border border-[#10B981]/30 rounded-lg text-[13px] font-medium tracking-wide text-indigo-200 opacity-0 group-hover:opacity-100 transition-all duration-150-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
            AI Assistant
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1B24] border-r border-t border-[#10B981]/30" />
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-1" />

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150-all text-[#9AA0A6] hover:bg-white/10 hover:text-[#F0F0F0]`}
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-[#1A1B24] border border-white/10 rounded-lg text-[13px] font-medium tracking-wide text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-150-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-xl">
            Grid Settings
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1B24] border-r border-t border-white/10" />
          </div>
        </div>
      </div>

      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {isBalanceOpen && <AutoBalanceModal onClose={() => setIsBalanceOpen(false)} />}
      <GridSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <BlockFormModal />
      <CompletionTrackerModal />

      {/* Context Menu (Feature 8) */}
      {contextMenu && (
        <div
          className="fixed z-[300] bg-[#1A1B24]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-xl w-48 py-1.5 flex flex-col text-[13px] font-medium text-slate-300 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-[#F0F0F0] flex items-center gap-2 active:scale-[0.97]"
            onClick={() => { shiftBlock(contextMenu.blockId, 'up'); setContextMenu(null); }}
          >
            <span>⬆️</span> Shift Up
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-[#F0F0F0] flex items-center gap-2 active:scale-[0.97]"
            onClick={() => { shiftBlock(contextMenu.blockId, 'down'); setContextMenu(null); }}
          >
            <span>⬇️</span> Shift Down
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-[#F0F0F0] flex items-center gap-2 border-t border-white/5 active:scale-[0.97]"
            onClick={() => { openDuplicateModal(contextMenu.blockId); setContextMenu(null); }}
          >
            <span>📋</span> Duplicate to...
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-[#F0F0F0] flex items-center gap-2 border-t border-white/5 active:scale-[0.97]"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openSkipModal(b.id); setContextMenu(null); }}
          >
            <span>⏭</span> Skip / Missed
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-[#F0F0F0] flex items-center gap-2 active:scale-[0.97]"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openBlockModal(b.dayId || b.day || 'Monday', b.startTime, b.endTime, b.id); setContextMenu(null); }}
          >
            <span>✏️</span> Edit Block
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 transition-all duration-150-colors border-t border-red-500/10 active:scale-[0.97]"
            onClick={() => { openDeleteModal(contextMenu.blockId); setContextMenu(null); }}
          >
            <span>🗑️</span> Delete Block
          </button>
        </div>
      )}

      {isDuplicateModalOpen && duplicateModalBlockId && (
        <DuplicateModal
          blockId={duplicateModalBlockId}
          onClose={closeDuplicateModal}
          dayColumns={dayColumns}
          duplicateBlock={duplicateBlock}
        />
      )}

      {isDeleteModalOpen && deleteModalBlockId && (
        <DeleteConfirmModal
          blockId={deleteModalBlockId}
          onClose={closeDeleteModal}
          onConfirm={() => {
            deleteBlock(deleteModalBlockId);
            closeDeleteModal();
          }}
        />
      )}
    </div>
  );
}

function DuplicateModal({ blockId, onClose, dayColumns, duplicateBlock }: { blockId: string, onClose: () => void, dayColumns: DayColumn[], duplicateBlock: any }) {
  const block = useGridStore.getState().blocks[blockId];
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  if (!block) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#000000]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#13141A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-[0_24px_64px_rgba(0,0,0,0.8)] ring-1 ring-white/5 flex flex-col pointer-events-auto">
        <h3 className="text-[#F0F0F0] font-bold mb-1 tracking-wide">Duplicate Block</h3>
        <p className="text-xs text-[#A0A0A0] tracking-wider mb-5">Copy <strong className="text-[#F0F0F0] font-semibold">"{block.subject}"</strong> to multiple days</p>

        <div className="space-y-1 mb-6 max-h-[40vh] overflow-y-auto px-1">
          {dayColumns.map(day => (
            <label key={day.id} className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg cursor-pointer select-none transition-all duration-150-colors border ${selectedDays.includes(day.id) ? 'bg-[#10B981]/10 border-[#10B981]/20 text-indigo-300' : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5'}`}>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#10B981] focus:ring-1 focus-visible:ring-[#10B981]/70/50"
                checked={selectedDays.includes(day.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedDays([...selectedDays, day.id]);
                  else setSelectedDays(selectedDays.filter(id => id !== day.id));
                }}
              />
              {day.label}
            </label>
          ))}
        </div>
        <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-5">
          <button onClick={() => setSelectedDays(dayColumns.map(d => d.id))} className="text-xs font-bold text-[#606060] hover:text-slate-300">Select All</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-[#A0A0A0] hover:text-[#F0F0F0] rounded-xl hover:bg-white/5 border border-transparent active:scale-[0.97]">Cancel</button>
            <button
              onClick={() => { duplicateBlock(blockId, selectedDays); onClose(); }}
              disabled={selectedDays.length === 0}
              className="px-5 py-2 text-sm font-bold bg-[#4F46E5] hover:bg-[#4338ca] text-[#F0F0F0] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(79,70,229,0.5)] border border-white/10 transition-all duration-150-all"
            >
              Confirm Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ blockId, onClose, onConfirm }: { blockId: string, onClose: () => void, onConfirm: () => void }) {
  const block = useGridStore.getState().blocks[blockId];
  if (!block) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#000000]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#13141A]/95 backdrop-blur-3xl border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-[0_24px_64px_rgba(239,68,68,0.2)] ring-1 ring-white/5 flex flex-col pointer-events-auto">
        <h3 className="text-[#F0F0F0] font-bold mb-1 tracking-wide">Delete Block</h3>
        <p className="text-sm text-[#A0A0A0] mb-6">
          Are you sure you want to delete <strong className="text-[#F0F0F0] font-semibold">"{block.subject}"</strong>? This action cannot be undone.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-transparent hover:bg-white/5 text-slate-300 rounded-lg text-sm font-semibold transition-all duration-150-colors border border-white/10 active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-sm font-semibold transition-all duration-150-all border border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.97]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
