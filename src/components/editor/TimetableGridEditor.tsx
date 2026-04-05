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
  const { initGrid, dayColumns, blocks, currentSnapInterval, setSnapInterval, deleteBlock, openBlockModal, openSkipModal, shiftBlock, duplicateBlock, activeTool, setActiveTool } = useGridStore();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBlocksRef = useRef(blocks);
  const isFirstLoadRef = useRef(true);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null);
  const [duplicateModalBlockId, setDuplicateModalBlockId] = useState<string | null>(null);
  const [deleteModalBlockId, setDeleteModalBlockId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    initGrid(timetableId || 'draft', cols, "07:00", "23:00");

    const handleGridData = (rawData: any) => {
      if (!rawData) return;
      const data = { ...rawData };
      const meta = data._metadata_;
      delete data._metadata_;

      if (meta && meta.gridStartTime && meta.gridEndTime) {
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
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.from('timetables').select('grid_data').eq('id', timetableId).single().then(({ data }) => {
          const row = data as any;
          if (row && row.grid_data) {
            handleGridData(row.grid_data);
          }
        });
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

    setSaveStatus('saving');
    try {
      const currentBlocks = latestBlocksRef.current;
      const res = await fetch(`/api/timetables/${timetableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid_data: {
            ...currentBlocks,
            _metadata_: { gridStartTime: useGridStore.getState().gridStartTime, gridEndTime: useGridStore.getState().gridEndTime }
          },
          total_blocks: Object.keys(currentBlocks).length
        })
      });

      if (!res.ok) throw new Error('Save failed');

      trackEvent('timetable_saved', { blockCount: Object.keys(currentBlocks).length });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
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

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (dayColumns.length === 0) return null; // loading state essentially

  return (
    <div className="w-full h-screen bg-[#0A0A0A] flex flex-col overflow-hidden text-[#F0F0F0]">

      <div
        className="flex flex-1 overflow-hidden pointer-events-auto relative"
        onContextMenu={(e) => {
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
        <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] rounded-full px-5 py-2.5 flex items-center shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <h1 className="font-bold text-[15px] text-[#F0F0F0] tracking-wide flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            StudyForge
          </h1>
        </div>
        {/* Auto-save status */}
        {saveStatus === 'saving' && (
          <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] rounded-full px-4 py-2 flex items-center gap-2 text-[12px] text-[#A0A0A0]">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Saving...
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="bg-[#1A1A1A]/90 backdrop-blur-xl border border-[#2A2A2A] rounded-full px-4 py-2 flex items-center gap-2 text-[12px] text-[#10B981]">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            Saved ✓
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-[rgba(239,68,68,0.15)] backdrop-blur-xl border border-[#EF4444]/30 rounded-full px-4 py-2 flex items-center gap-2 text-[12px] text-[#EF4444]">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            Save Failed
          </div>
        )}
      </div>

      {mode !== 'dashboard' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <div className="bg-forge-elevated/90 backdrop-blur-2xl border border-forge-border rounded-full px-6 py-3 flex items-center gap-6 shadow-forge-xl">
            <div className="flex items-center gap-3 border-r border-forge-border pr-6">
              <label className="text-[11px] font-bold text-forge-text-muted uppercase tracking-wider">Snap</label>
              <select
                className="bg-transparent text-forge-text-primary font-bold focus:outline-none appearance-none cursor-pointer text-sm tracking-wide"
                value={currentSnapInterval}
                onChange={(e) => setSnapInterval(parseInt(e.target.value) as any)}
              >
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">1 hour</option>
              </select>
            </div>

            <div className="border-r border-forge-border pr-6">
              <button
                onClick={() => setIsBalanceOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-forge-accent hover:text-forge-accent-bright transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Auto-Balance
              </button>
            </div>

            <div className="text-forge-text-muted font-medium text-[12px] flex items-center gap-5 tracking-wide">
              <span className="flex items-center gap-1.5"><kbd className="bg-forge-overlay rounded-md px-2 py-0.5 font-sans font-semibold text-forge-text-primary border border-forge-border shadow-sm">Space</kbd> + Drag to Pan</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-forge-overlay rounded-md px-2 py-0.5 font-sans font-semibold text-forge-text-primary border border-forge-border shadow-sm">Ctrl</kbd> + Scroll to Zoom</span>
              <span className="flex items-center gap-1.5 ml-2 pl-6 border-l border-forge-border"><kbd className="bg-forge-accent/20 text-forge-accent rounded-md px-2 py-0.5 font-sans font-semibold border border-forge-accent/30 shadow-sm">⌘/Ctrl + P</kbd> Timer</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] pointer-events-auto flex flex-col gap-2 bg-forge-elevated/90 backdrop-blur-2xl border border-forge-border rounded-full p-2 shadow-forge-xl">
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setActiveTool('select')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTool === 'select' ? 'bg-forge-text-primary text-forge-base shadow-md scale-105' : 'text-forge-text-muted hover:bg-forge-overlay hover:text-forge-text-primary'}`}
          >
            <MousePointer2 className={`w-5 h-5 ${activeTool === 'select' ? 'fill-forge-base' : ''}`} />
          </button>

          {/* Tooltip */}
          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-forge-elevated border border-forge-border rounded-lg text-[13px] font-medium tracking-wide text-forge-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-forge-md">
            Select - V
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-forge-elevated border-r border-t border-forge-border" />
          </div>
        </div>

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setActiveTool('pan')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTool === 'pan' ? 'bg-forge-text-primary text-forge-base shadow-md scale-105' : 'text-forge-text-muted hover:bg-forge-overlay hover:text-forge-text-primary'}`}
          >
            <Hand className={`w-5 h-5 ${activeTool === 'pan' ? 'fill-forge-base/20' : ''}`} />
          </button>

          {/* Tooltip */}
          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-forge-elevated border border-forge-border rounded-lg text-[13px] font-medium tracking-wide text-forge-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-forge-md">
            Pan - H
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-forge-elevated border-r border-t border-forge-border" />
          </div>
        </div>

        <div className="w-full h-px bg-forge-border my-1" />

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isChatOpen ? 'bg-forge-accent/20 text-forge-accent shadow-md scale-105 border border-forge-accent/30' : 'text-forge-accent/80 hover:bg-forge-accent/10 hover:text-forge-accent'}`}
          >
            <Bot className={`w-5 h-5 ${isChatOpen ? 'fill-forge-accent/20' : ''}`} />
          </button>

          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-forge-elevated border border-forge-accent/30 rounded-lg text-[13px] font-medium tracking-wide text-forge-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-forge-md">
            AI Assistant
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-forge-elevated border-r border-t border-forge-accent/30" />
          </div>
        </div>

        <div className="w-full h-px bg-forge-border my-1" />

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all text-forge-text-muted hover:bg-forge-overlay hover:text-forge-text-primary`}
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-forge-elevated border border-forge-border rounded-lg text-[13px] font-medium tracking-wide text-forge-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-forge-md">
            Grid Settings
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-forge-elevated border-r border-t border-forge-border" />
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
          className="fixed z-[300] bg-forge-elevated/95 backdrop-blur-xl border border-forge-border shadow-forge-xl rounded-xl w-48 py-1.5 flex flex-col text-[13px] font-medium text-forge-text-primary overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-forge-overlay flex items-center gap-2 transition-colors"
            onClick={() => { shiftBlock(contextMenu.blockId, 'up'); }}
          >
            <span>⬆️</span> Shift Up
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-forge-overlay flex items-center gap-2 transition-colors"
            onClick={() => { shiftBlock(contextMenu.blockId, 'down'); }}
          >
            <span>⬇️</span> Shift Down
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-forge-overlay flex items-center gap-2 border-t border-forge-border transition-colors mt-1 pt-2"
            onClick={() => { setDuplicateModalBlockId(contextMenu.blockId); }}
          >
            <span>📋</span> Duplicate to...
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-forge-overlay flex items-center gap-2 border-t border-forge-border transition-colors mt-1 pt-2"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openSkipModal(b.id); }}
          >
            <span>⏭</span> Skip / Missed
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-forge-overlay flex items-center gap-2 transition-colors"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openBlockModal(b.day, b.startTime, b.endTime, b.id); }}
          >
            <span>✏️</span> Edit Block
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-forge-error/20 text-forge-error flex items-center gap-2 transition-colors border-t border-forge-border mt-1 pt-2"
            onClick={() => setDeleteModalBlockId(contextMenu.blockId)}
          >
            <span>🗑️</span> Delete Block
          </button>
        </div>
      )}

      {duplicateModalBlockId && (
        <DuplicateModal
          blockId={duplicateModalBlockId}
          onClose={() => setDuplicateModalBlockId(null)}
          dayColumns={dayColumns}
          duplicateBlock={duplicateBlock}
        />
      )}

      {deleteModalBlockId && (
        <DeleteConfirmModal 
          blockId={deleteModalBlockId}
          onClose={() => setDeleteModalBlockId(null)}
          onConfirm={() => {
            deleteBlock(deleteModalBlockId);
            setDeleteModalBlockId(null);
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-forge-elevated/95 backdrop-blur-3xl border border-forge-border rounded-2xl p-6 w-full max-w-sm shadow-forge-xl flex flex-col pointer-events-auto">
        <h3 className="text-forge-text-primary font-bold mb-1 tracking-wide">Duplicate Block</h3>
        <p className="text-xs text-forge-text-secondary tracking-wider mb-5">Copy <strong className="text-forge-text-primary font-semibold">"{block.subject}"</strong> to multiple days</p>

        <div className="space-y-1 mb-6 max-h-[40vh] overflow-y-auto px-1">
          {dayColumns.map(day => (
            <label key={day.id} className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg cursor-pointer select-none transition-colors border ${selectedDays.includes(day.id) ? 'bg-forge-accent/10 border-forge-accent/20 text-forge-accent' : 'bg-transparent border-transparent text-forge-text-primary hover:bg-forge-overlay'}`}>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-forge-border bg-forge-base text-forge-accent focus:ring-1 focus:ring-forge-accent/50"
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
        <div className="flex justify-between items-center mt-auto border-t border-forge-border pt-5">
          <button onClick={() => setSelectedDays(dayColumns.map(d => d.id))} className="text-xs font-semibold text-forge-text-muted hover:text-forge-text-primary">Select All</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-forge-text-secondary hover:text-forge-text-primary rounded-xl hover:bg-forge-overlay border border-transparent">Cancel</button>
            <button
              onClick={() => { duplicateBlock(blockId, selectedDays); onClose(); }}
              disabled={selectedDays.length === 0}
              className="px-5 py-2 text-sm font-bold bg-forge-accent hover:bg-forge-accent-bright text-forge-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-forge-md border border-forge-accent/20 transition-all"
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-forge-elevated/95 backdrop-blur-3xl border border-forge-error/20 rounded-2xl p-6 w-full max-w-sm shadow-forge-xl flex flex-col pointer-events-auto">
        <h3 className="text-forge-text-primary font-bold mb-1 tracking-wide">Delete Block</h3>
        <p className="text-sm text-forge-text-secondary mb-6">
          Are you sure you want to delete <strong className="text-forge-text-primary font-semibold">"{block.subject}"</strong>? This action cannot be undone.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-transparent hover:bg-forge-overlay text-forge-text-secondary hover:text-forge-text-primary rounded-lg text-sm font-semibold transition-colors border border-forge-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-forge-error/10 hover:bg-forge-error text-forge-error hover:text-white rounded-lg text-sm font-semibold transition-all border border-forge-error/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
