"use client";

import { useState, useEffect } from "react";
import { useGridStore } from "@/store/grid-store";
import { CanvasWrapper } from "./CanvasWrapper";
import { TimetableGrid } from "./TimetableGrid";
import { BlockFormModal } from "./BlockFormModal";
import { CompletionTrackerModal } from "./CompletionTracker";

import { DayColumn } from "@/lib/grid-engine";

export function TimetableGridEditor({ timetableId }: { timetableId?: string }) {
  const { initGrid, dayColumns, currentSnapInterval, setSnapInterval, deleteBlock, openBlockModal, openSkipModal } = useGridStore();
  
  // Feature 8: Right-click Context Menu State global root mapping
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null);

  useEffect(() => {
    // Boilerplate hydration simulating loading /api/timetables/[id] mapping to store parameters!
    const cols: DayColumn[] = [
      { id: 'col_monday', label: 'Monday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_tuesday', label: 'Tuesday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_wednesday', label: 'Wednesday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_thursday', label: 'Thursday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_friday', label: 'Friday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_saturday', label: 'Saturday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_sunday', label: 'Sunday', isCustom: false, isHidden: false, widthPx: 160 },
    ];
    initGrid(timetableId || 'draft', cols, "07:00", "23:00");

    // Dummy block binding to showcase render
    useGridStore.getState().addBlock({ 
       dayId: 'col_monday', 
       startTime: '08:00',
       endTime: '10:00',
       subject: "Introduction to Advanced Algorithms",
       subjectType: "Lecture",
       priority: "High",
       color: "#4f46e5", // Updated to PresenceX Indigo
       textColor: "#ffffff",
       notes: "Read chapter 4 before class."
    });
    
  }, [initGrid, timetableId]);

  // Global Context Listener override
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  if (dayColumns.length === 0) return null; // loading state essentially

  return (
    <div className="w-full h-screen bg-[#202124] flex flex-col overflow-hidden text-slate-100">
      
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
      <div className="absolute top-4 left-4 z-[100] pointer-events-auto flex gap-3">
         <div className="bg-[#292A2D]/90 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
           <h1 className="font-bold text-[15px] text-[#E8EAED] tracking-wide flex items-center gap-2.5">
             <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
             StudyForge
           </h1>
         </div>
      </div>

      {/* Floating Bottom Command Bar (Phase 2) */}
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
           
           <div className="text-[#9AA0A6] font-medium text-[12px] flex items-center gap-5 tracking-wide">
             <span className="flex items-center gap-1.5"><kbd className="bg-black/20 rounded-md px-2 py-0.5 font-sans font-semibold text-[#E8EAED] border border-white/5 shadow-inner">Space</kbd> + Drag to Pan</span>
             <span className="flex items-center gap-1.5"><kbd className="bg-black/20 rounded-md px-2 py-0.5 font-sans font-semibold text-[#E8EAED] border border-white/5 shadow-inner">Ctrl</kbd> + Scroll to Zoom</span>
           </div>
         </div>
      </div>

      <BlockFormModal />
      <CompletionTrackerModal />
      
      {/* Context Menu (Feature 8) */}
      {contextMenu && (
        <div 
          className="fixed z-[300] bg-[#1A1B24]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] rounded-xl w-48 py-1.5 flex flex-col text-[13px] font-medium text-slate-300 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openSkipModal(b.id); }}
          >
             <span>⏭</span> Skip / Missed
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2 border-y border-white/5"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openBlockModal(b.dayId, b.startTime, b.endTime, b.id); }}
          >
             <span>✏️</span> Edit Block
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
            onClick={() => { if(confirm("Delete block?")) deleteBlock(contextMenu.blockId); }}
          >
             <span>🗑️</span> Delete Block
          </button>
        </div>
      )}
    </div>
  );
}
