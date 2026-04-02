"use client";

import { useState, useEffect } from "react";
import { useGridStore } from "@/store/grid-store";
import { CanvasWrapper } from "./CanvasWrapper";
import { TimetableGrid } from "./TimetableGrid";
import { BlockFormModal } from "./BlockFormModal";
import { CompletionTrackerModal } from "./CompletionTracker";
import { MousePointer2, Hand } from "lucide-react";

import { DayColumn } from "@/lib/grid-engine";

export function TimetableGridEditor({ timetableId }: { timetableId?: string }) {
  const { initGrid, dayColumns, currentSnapInterval, setSnapInterval, deleteBlock, openBlockModal, openSkipModal, shiftBlock, duplicateBlock, activeTool, setActiveTool } = useGridStore();
  
  // Feature 8: Right-click Context Menu State global root mapping
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null);
  const [duplicateModalBlockId, setDuplicateModalBlockId] = useState<string | null>(null);

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

  // Global Context Listener override & Keyboard shortcuts
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    
    // Feature: Keyboard shortcuts for tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('pan');
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
              <span className="flex items-center gap-1.5 ml-2 pl-6 border-l border-white/10"><kbd className="bg-indigo-500/20 text-indigo-300 rounded-md px-2 py-0.5 font-sans font-semibold border border-indigo-500/20 shadow-inner">⌘/Ctrl + P</kbd> Timer</span>
            </div>
         </div>
      </div>

      {/* Vertical Tool Bar (Right Side) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] pointer-events-auto flex flex-col gap-2 bg-[#292A2D]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="relative group flex items-center justify-center">
          <button 
             onClick={() => setActiveTool('select')}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTool === 'select' ? 'bg-[#E8EAED] text-black shadow-md scale-105' : 'text-[#9AA0A6] hover:bg-white/10 hover:text-white'}`}
          >
            <MousePointer2 className={`w-5 h-5 ${activeTool === 'select' ? 'fill-black' : ''}`} />
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-[#1A1B24] border border-white/10 rounded-lg text-[13px] font-medium tracking-wide text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-xl">
            Select - V
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1B24] border-r border-t border-white/10" />
          </div>
        </div>

        <div className="relative group flex items-center justify-center">
          <button 
             onClick={() => setActiveTool('pan')}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTool === 'pan' ? 'bg-[#E8EAED] text-black shadow-md scale-105' : 'text-[#9AA0A6] hover:bg-white/10 hover:text-white'}`}
          >
            <Hand className={`w-5 h-5 ${activeTool === 'pan' ? 'fill-black/20' : ''}`} />
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-[110%] mr-2 px-3 py-1.5 bg-[#1A1B24] border border-white/10 rounded-lg text-[13px] font-medium tracking-wide text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center shadow-xl">
            Pan - H
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1B24] border-r border-t border-white/10" />
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
            onClick={() => { shiftBlock(contextMenu.blockId, 'up'); }}
          >
             <span>⬆️</span> Shift Up
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2"
            onClick={() => { shiftBlock(contextMenu.blockId, 'down'); }}
          >
             <span>⬇️</span> Shift Down
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2 border-t border-white/5"
            onClick={() => { setDuplicateModalBlockId(contextMenu.blockId); }}
          >
             <span>📋</span> Duplicate to...
          </button>
          
          <button 
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2 border-t border-white/5"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openSkipModal(b.id); }}
          >
             <span>⏭</span> Skip / Missed
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white flex items-center gap-2"
            onClick={() => { const b = useGridStore.getState().blocks[contextMenu.blockId]; openBlockModal(b.dayId, b.startTime, b.endTime, b.id); }}
          >
             <span>✏️</span> Edit Block
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors border-t border-red-500/10"
            onClick={() => { if(confirm("Delete block?")) deleteBlock(contextMenu.blockId); }}
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
         <h3 className="text-white font-bold mb-1 tracking-wide">Duplicate Block</h3>
         <p className="text-xs text-slate-400 tracking-wider mb-5">Copy <strong className="text-white font-semibold">"{block.subject}"</strong> to multiple days</p>
         
         <div className="space-y-1 mb-6 max-h-[40vh] overflow-y-auto px-1">
           {dayColumns.map(day => (
              <label key={day.id} className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg cursor-pointer select-none transition-colors border ${selectedDays.includes(day.id) ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5'}`}>
                 <input 
                   type="checkbox" 
                   className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
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
           <button onClick={() => setSelectedDays(dayColumns.map(d => d.id))} className="text-xs font-bold text-slate-500 hover:text-slate-300">Select All</button>
           <div className="flex gap-2">
             <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/5 border border-transparent">Cancel</button>
             <button 
               onClick={() => { duplicateBlock(blockId, selectedDays); onClose(); }} 
               disabled={selectedDays.length === 0}
               className="px-5 py-2 text-sm font-bold bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(79,70,229,0.5)] border border-white/10 transition-all"
             >
               Confirm Copy
             </button>
           </div>
         </div>
      </div>
    </div>
  )
}
